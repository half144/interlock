use std::collections::HashMap;
use std::net::{SocketAddr, TcpStream};
use std::os::unix::process::CommandExt;
use std::path::PathBuf;
use std::process::{Child, Command, Stdio};
use std::sync::{Arc, Condvar, Mutex};
use std::thread;
use std::time::{Duration, Instant};

use serde::Serialize;
use tauri::{AppHandle, Emitter};

pub const HOST: &str = "127.0.0.1";
pub const PORT: u16 = 6868;
pub const STATUS_EVENT: &str = "daemon://status";

const BACKOFF_START: Duration = Duration::from_millis(500);
const BACKOFF_MAX: Duration = Duration::from_secs(15);
const STABLE_AFTER: Duration = Duration::from_secs(30);
const READY_TIMEOUT: Duration = Duration::from_secs(60);
const STOP_GRACE: Duration = Duration::from_secs(5);

#[derive(Clone, Copy, Serialize, PartialEq, Eq, Debug)]
#[serde(rename_all = "lowercase")]
pub enum DaemonStatus {
    Starting,
    Ready,
    Crashed,
}

#[derive(Clone, Serialize)]
pub struct DaemonConnection {
    pub url: String,
    pub token: String,
}

struct State {
    status: DaemonStatus,
    stopping: bool,
}

/// Owns the daemon child process: spawns it, restarts it with backoff when it
/// dies, and stops it on quit.
pub struct Daemon {
    token: String,
    state: Mutex<State>,
    wake: Condvar,
    child: Mutex<Option<Child>>,
}

impl Daemon {
    pub fn new() -> Arc<Self> {
        Arc::new(Self {
            token: random_token(),
            state: Mutex::new(State {
                status: DaemonStatus::Starting,
                stopping: false,
            }),
            wake: Condvar::new(),
            child: Mutex::new(None),
        })
    }

    pub fn connection(&self) -> DaemonConnection {
        DaemonConnection {
            url: format!("ws://{HOST}:{PORT}/ws"),
            token: self.token.clone(),
        }
    }

    pub fn status(&self) -> DaemonStatus {
        self.state.lock().unwrap().status
    }

    pub fn start(self: &Arc<Self>, app: AppHandle) {
        let daemon = Arc::clone(self);
        thread::spawn(move || {
            let env = crate::login_env::resolve();
            crate::stale::stop_stale_daemon(&interlock_home(), &format!("{HOST}:{PORT}"));
            crate::stale::stop_port_owner(PORT);
            daemon.supervise(&app, &env);
        });
    }

    pub fn stop(&self) {
        {
            let mut state = self.state.lock().unwrap();
            state.stopping = true;
        }
        self.wake.notify_all();
        if let Some(mut child) = self.child.lock().unwrap().take() {
            terminate(&mut child);
        }
    }

    fn set_status(&self, app: &AppHandle, status: DaemonStatus) {
        self.state.lock().unwrap().status = status;
        let _ = app.emit(STATUS_EVENT, status);
    }

    fn is_stopping(&self) -> bool {
        self.state.lock().unwrap().stopping
    }

    fn sleep(&self, duration: Duration) {
        let state = self.state.lock().unwrap();
        let _ = self
            .wake
            .wait_timeout_while(state, duration, |s| !s.stopping)
            .unwrap();
    }

    fn supervise(&self, app: &AppHandle, login_env: &HashMap<String, String>) {
        let mut backoff = BACKOFF_START;
        while !self.is_stopping() {
            self.set_status(app, DaemonStatus::Starting);
            let started = Instant::now();
            match spawn(app, login_env, &self.token) {
                Ok(child) => {
                    *self.child.lock().unwrap() = Some(child);
                    self.watch(app);
                }
                Err(err) => eprintln!("[interlock] daemon failed to start: {err}"),
            }
            if self.is_stopping() {
                break;
            }
            self.set_status(app, DaemonStatus::Crashed);
            if started.elapsed() > STABLE_AFTER {
                backoff = BACKOFF_START;
            }
            self.sleep(backoff);
            backoff = (backoff * 2).min(BACKOFF_MAX);
        }
    }

    /// Blocks until the child exits, emitting `ready` once the port accepts connections.
    fn watch(&self, app: &AppHandle) {
        let started = Instant::now();
        let mut ready = false;
        loop {
            if self.is_stopping() {
                return;
            }
            {
                let mut guard = self.child.lock().unwrap();
                match guard.as_mut().map(Child::try_wait) {
                    Some(Ok(None)) => {}
                    _ => {
                        guard.take();
                        return;
                    }
                }
            }
            if !ready && port_open() {
                ready = true;
                self.set_status(app, DaemonStatus::Ready);
            } else if !ready && started.elapsed() > READY_TIMEOUT {
                if let Some(mut child) = self.child.lock().unwrap().take() {
                    terminate(&mut child);
                }
                return;
            }
            self.sleep(Duration::from_millis(250));
        }
    }
}

fn random_token() -> String {
    let mut bytes = [0u8; 32];
    getrandom::fill(&mut bytes).expect("system random source");
    bytes.iter().map(|b| format!("{b:02x}")).collect()
}

fn port_open() -> bool {
    let addr = SocketAddr::from(([127, 0, 0, 1], PORT));
    TcpStream::connect_timeout(&addr, Duration::from_millis(200)).is_ok()
}

fn interlock_home() -> PathBuf {
    std::env::var_os("INTERLOCK_HOME")
        .map(PathBuf::from)
        .unwrap_or_else(|| {
            PathBuf::from(std::env::var_os("HOME").unwrap_or_default()).join(".interlock")
        })
}

fn spawn(
    app: &AppHandle,
    login_env: &HashMap<String, String>,
    token: &str,
) -> Result<Child, String> {
    let mut command = daemon_command(app)?;
    command
        .envs(login_env)
        .env("INTERLOCK_HOME", interlock_home())
        .env("INTERLOCK_DESKTOP_MANAGED", "1")
        .env("INTERLOCK_LISTEN", format!("{HOST}:{PORT}"))
        .env("INTERLOCK_TOKEN", token)
        .stdin(Stdio::null())
        .process_group(0);
    command.spawn().map_err(|e| e.to_string())
}

#[cfg(debug_assertions)]
fn daemon_command(_app: &AppHandle) -> Result<Command, String> {
    let root = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../..");
    // INTERLOCK_DEV_DAEMON_CMD swaps the daemon for a stub, e.g. while the server is not runnable.
    let mut command = match std::env::var("INTERLOCK_DEV_DAEMON_CMD") {
        Ok(script) => {
            let mut c = Command::new("/bin/sh");
            c.args(["-c", &script]);
            c
        }
        Err(_) => {
            let mut c = Command::new("npm");
            c.args(["run", "dev:daemon", "-w", "@interlock/server"]);
            c
        }
    };
    command.current_dir(root);
    Ok(command)
}

/// Bundle layout (produced by `npm run bundle:daemon`):
/// `Resources/runtime/node/bin/node` and `Resources/runtime/daemon/index.mjs`.
#[cfg(not(debug_assertions))]
fn daemon_command(app: &AppHandle) -> Result<Command, String> {
    use tauri::Manager;
    let runtime = app
        .path()
        .resource_dir()
        .map_err(|e| e.to_string())?
        .join("runtime");
    let mut command = Command::new(runtime.join("node/bin/node"));
    command
        .arg(runtime.join("daemon/index.mjs"))
        .current_dir(runtime);
    Ok(command)
}

fn terminate(child: &mut Child) {
    let pgid = child.id() as i32;
    // SAFETY: signalling the process group we created with `process_group(0)`.
    unsafe { libc::killpg(pgid, libc::SIGTERM) };
    let deadline = Instant::now() + STOP_GRACE;
    while Instant::now() < deadline {
        if matches!(child.try_wait(), Ok(Some(_))) {
            return;
        }
        thread::sleep(Duration::from_millis(50));
    }
    unsafe { libc::killpg(pgid, libc::SIGKILL) };
    let _ = child.wait();
}
