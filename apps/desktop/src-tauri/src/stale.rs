//! Stops an Interlock daemon left behind by a previous launch (the app was killed or crashed),
//! so the new launch can bind the port and its own token. Only a daemon that proves to be ours
//! is signalled: the pid file must be marked `desktopManaged` for our listen address, and the
//! live process command line must look like the Interlock daemon.

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

pub fn command_looks_like_daemon(command: &str) -> bool {
    command.contains("daemon/index.mjs")
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
    // SAFETY: the pid was verified above to be an Interlock daemon of ours.
    unsafe { libc::kill(lock.pid, libc::SIGTERM) };
    let deadline = Instant::now() + TERM_GRACE;
    while alive(lock.pid) && Instant::now() < deadline {
        thread::sleep(Duration::from_millis(50));
    }
    if alive(lock.pid) {
        unsafe { libc::kill(lock.pid, libc::SIGKILL) };
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
    fn missing_lock_file_is_a_no_op() {
        let home = std::env::temp_dir().join("interlock-stale-test-none");
        assert!(!stop_stale_daemon(&home, LISTEN));
    }
}
