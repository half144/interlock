use std::collections::HashMap;
use std::io::Read;
use std::process::{Command, Stdio};
use std::time::{Duration, Instant};

const MARK: &str = "__INTERLOCK_ENV__";
const TIMEOUT: Duration = Duration::from_secs(15);

/// Environment of the user's login shell. GUI apps start with a minimal PATH, so
/// `claude`, `codex`, `gh` and `git` are only found after this (same approach as
/// Paseo's login-shell-env.ts). Falls back to the process environment.
pub fn resolve() -> HashMap<String, String> {
    let shell = std::env::var("SHELL").unwrap_or_else(|_| "/bin/zsh".into());
    let script = format!("printf '{MARK}'; env -0; printf '{MARK}'");
    for flags in [["-i", "-l", "-c"], ["-l", "-c", ""]] {
        let args: Vec<&str> = flags.iter().copied().filter(|f| !f.is_empty()).collect();
        if let Some(env) = run_shell(&shell, &args, &script) {
            return env;
        }
    }
    std::env::vars().collect()
}

fn run_shell(shell: &str, flags: &[&str], script: &str) -> Option<HashMap<String, String>> {
    let mut child = Command::new(shell)
        .args(flags)
        .arg(script)
        .stdin(Stdio::null())
        .stdout(Stdio::piped())
        .stderr(Stdio::null())
        .spawn()
        .ok()?;
    let mut stdout = child.stdout.take()?;
    let reader = std::thread::spawn(move || {
        let mut buf = Vec::new();
        stdout.read_to_end(&mut buf).ok()?;
        Some(buf)
    });

    let started = Instant::now();
    loop {
        match child.try_wait() {
            Ok(Some(_)) => break,
            Ok(None) if started.elapsed() < TIMEOUT => {
                std::thread::sleep(Duration::from_millis(25))
            }
            _ => {
                let _ = child.kill();
                let _ = child.wait();
                return None;
            }
        }
    }
    parse(&reader.join().ok()??)
}

fn parse(output: &[u8]) -> Option<HashMap<String, String>> {
    let text = String::from_utf8_lossy(output);
    let start = text.find(MARK)? + MARK.len();
    let end = start + text[start..].find(MARK)?;
    let env: HashMap<String, String> = text[start..end]
        .split('\0')
        .filter_map(|entry| entry.split_once('='))
        .map(|(k, v)| (k.to_string(), v.to_string()))
        .collect();
    env.contains_key("PATH").then_some(env)
}

#[cfg(test)]
mod tests {
    use super::parse;

    #[test]
    fn parses_env_between_markers() {
        let out = b"noise__INTERLOCK_ENV__PATH=/a:/b\0HOME=/h\0__INTERLOCK_ENV__tail";
        let env = parse(out).unwrap();
        assert_eq!(env["PATH"], "/a:/b");
        assert_eq!(env["HOME"], "/h");
    }

    #[test]
    fn rejects_output_without_path() {
        assert!(parse(b"__INTERLOCK_ENV__HOME=/h\0__INTERLOCK_ENV__").is_none());
        assert!(parse(b"nothing").is_none());
    }
}
