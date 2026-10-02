//! Stops an Interlock daemon left behind by a previous launch (the app was killed or crashed),
//! so the new launch can bind the port and its own token. Only a daemon that proves to be ours
//! is signalled. Two ways to find it: the pid file, when it is marked `desktopManaged` for our
//! listen address, and whoever listens on the port, which also catches a daemon started by hand
//! (`npm run dev:daemon`) and a worker orphaned when its supervisor died. Either way the live
//! process command line must look like the Interlock daemon.

use std::path::Path;
use std::process::Command;
use std::thread;
use std::time::{Duration, Instant};

use serde::Deserialize;

const PID_FILE: &str = "paseo.pid";
const TERM_GRACE: Duration = Duration::from_secs(5);

#[derive(Deserialize, Debug, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct PidLock {
    pub pid: i32,
    pub listen: Option<String>,
    #[serde(default)]
    pub desktop_managed: bool,
}

pub fn parse_lock(raw: &str) -> Option<PidLock> {
    serde_json::from_str::<PidLock>(raw)
        .ok()
        .filter(|lock| lock.pid > 1)
}

/// The daemon renames itself once running (`process.title`), so `ps` may show only the title.
pub fn command_looks_like_daemon(command: &str) -> bool {
    command.starts_with("Interlock Supervisor")
        || command.starts_with("Interlock Daemon")
        || command.contains("daemon/index.mjs")
        || command.contains("@interlock/server")
        || command.contains("packages/server")
}

/// True only when the lock and the live command line both identify our own desktop daemon.
pub fn is_ours(lock: &PidLock, listen: &str, command: &str) -> bool {
    lock.desktop_managed
        && lock.listen.as_deref() == Some(listen)
        && command_looks_like_daemon(command)
}

fn process_command(pid: i32) -> Option<String> {
    let output = Command::new("ps")
        .args(["-o", "command=", "-p", &pid.to_string()])
        .output()
        .ok()?;
    let command = String::from_utf8_lossy(&output.stdout).trim().to_string();
    (output.status.success() && !command.is_empty()).then_some(command)
}

fn alive(pid: i32) -> bool {
    // SAFETY: signal 0 only checks that the process exists.
    unsafe { libc::kill(pid, 0) == 0 }
}

/// Returns true when a stale daemon was found and stopped.
pub fn stop_stale_daemon(home: &Path, listen: &str) -> bool {
    let Ok(raw) = std::fs::read_to_string(home.join(PID_FILE)) else {
        return false;
    };
    let Some(lock) = parse_lock(&raw) else {
        return false;
    };
    let Some(command) = process_command(lock.pid) else {
        return false;
    };
    if !is_ours(&lock, listen, &command) {
        eprintln!(
            "[interlock] pid {} in the lock file is not our daemon; leaving it alone",
            lock.pid
        );
        return false;
    }
    eprintln!("[interlock] stopping stale daemon (pid {})", lock.pid);
    terminate(lock.pid);
    true
}

fn terminate(pid: i32) {
    // SAFETY: callers only pass pids already verified to be an Interlock daemon.
    unsafe { libc::kill(pid, libc::SIGTERM) };
    let deadline = Instant::now() + TERM_GRACE;
    while alive(pid) && Instant::now() < deadline {
        thread::sleep(Duration::from_millis(50));
    }
    if alive(pid) {
        unsafe { libc::kill(pid, libc::SIGKILL) };
    }
}

fn port_owner(port: u16) -> Option<i32> {
    let output = Command::new("lsof")
        .args(["-nP", &format!("-iTCP:{port}"), "-sTCP:LISTEN", "-t"])
        .output()
        .ok()?;
    String::from_utf8_lossy(&output.stdout)
        .lines()
        .next()?
        .trim()
        .parse()
        .ok()
}

fn parent_pid(pid: i32) -> Option<i32> {
    let output = Command::new("ps")
        .args(["-o", "ppid=", "-p", &pid.to_string()])
        .output()
        .ok()?;
    String::from_utf8_lossy(&output.stdout).trim().parse().ok()
}

/// What to stop for a process holding our port: the supervisor first, so it cannot respawn the
/// worker, then the worker. None when the holder is not an Interlock daemon.
pub fn stop_order(worker: (i32, &str), parent: Option<(i32, &str)>) -> Option<Vec<i32>> {
    if !command_looks_like_daemon(worker.1) {
        return None;
    }
    let supervisor = parent
        .filter(|(pid, command)| *pid > 1 && command_looks_like_daemon(command))
        .map(|(pid, _)| pid);
    Some(supervisor.into_iter().chain([worker.0]).collect())
}

/// Returns true when an Interlock daemon was holding the port and was stopped.
pub fn stop_port_owner(port: u16) -> bool {
    let Some(pid) = port_owner(port) else {
        return false;
    };
    let Some(command) = process_command(pid) else {
        return false;
    };
    let parent = parent_pid(pid).and_then(|ppid| Some((ppid, process_command(ppid)?)));
    let Some(order) = stop_order(
        (pid, &command),
        parent.as_ref().map(|(ppid, c)| (*ppid, c.as_str())),
    ) else {
        eprintln!("[interlock] port {port} is held by pid {pid}, which is not our daemon; leaving it alone");
        return false;
    };
    eprintln!("[interlock] port {port} is held by a stale daemon; stopping {order:?}");
    for pid in order {
        terminate(pid);
    }
    true
}

#[cfg(test)]
mod tests {
    use super::*;

    const LISTEN: &str = "127.0.0.1:6868";

    fn lock(managed: bool, listen: Option<&str>) -> PidLock {
        PidLock {
            pid: 4242,
            listen: listen.map(str::to_string),
            desktop_managed: managed,
        }
    }

    #[test]
    fn parses_a_daemon_lock_file() {
        let raw = r#"{"pid":99,"startedAt":"x","hostname":"h","uid":501,"listen":"127.0.0.1:6868","desktopManaged":true,"heartbeat":true}"#;
        assert_eq!(
            parse_lock(raw),
            Some(lock(true, Some(LISTEN))).map(|l| PidLock { pid: 99, ..l })
        );
    }

    #[test]
    fn rejects_garbage_and_unsafe_pids() {
        assert_eq!(parse_lock("not json"), None);
        assert_eq!(parse_lock(r#"{"pid":1,"listen":null}"#), None);
        assert_eq!(parse_lock(r#"{"pid":-5,"listen":null}"#), None);
    }

    #[test]
    fn accepts_our_bundled_and_dev_daemons() {
        let ours = lock(true, Some(LISTEN));
        assert!(is_ours(
            &ours,
            LISTEN,
            "/A/Resources/runtime/node/bin/node /A/Resources/runtime/daemon/index.mjs"
        ));
        assert!(is_ours(
            &ours,
            LISTEN,
            "node --import tsx scripts/dev-runner.ts /x/packages/server"
        ));
        assert!(is_ours(&ours, LISTEN, "Interlock Supervisor"));
        assert!(is_ours(&ours, LISTEN, "Interlock Daemon"));
    }

    #[test]
    fn refuses_anything_not_verifiably_ours() {
        let command = "node /A/runtime/daemon/index.mjs";
        assert!(!is_ours(&lock(false, Some(LISTEN)), LISTEN, command));
        assert!(!is_ours(
            &lock(true, Some("127.0.0.1:6767")),
            LISTEN,
            command
        ));
        assert!(!is_ours(&lock(true, None), LISTEN, command));
        assert!(!is_ours(
            &lock(true, Some(LISTEN)),
            LISTEN,
            "/usr/bin/paseo-daemon --port 6868"
        ));
    }

    #[test]
    fn stops_the_supervisor_before_its_worker() {
        assert_eq!(
            stop_order((20, "Interlock Daemon"), Some((10, "Interlock Supervisor"))),
            Some(vec![10, 20])
        );
    }

    #[test]
    fn stops_an_orphaned_worker_alone() {
        assert_eq!(
            stop_order((20, "Interlock Daemon"), Some((1, "/sbin/launchd"))),
            Some(vec![20])
        );
        assert_eq!(
            stop_order((20, "Interlock Daemon"), Some((10, "/usr/bin/zsh"))),
            Some(vec![20])
        );
    }

    #[test]
    fn leaves_a_foreign_port_holder_alone() {
        assert_eq!(
            stop_order((20, "/usr/bin/some-other-server --port 6868"), None),
            None
        );
    }

    #[test]
    fn missing_lock_file_is_a_no_op() {
        let home = std::env::temp_dir().join("interlock-stale-test-none");
        assert!(!stop_stale_daemon(&home, LISTEN));
    }
}
