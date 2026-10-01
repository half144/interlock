use std::sync::Mutex;

#[derive(Default)]
pub struct Activity {
    inner: Mutex<Inner>,
}

#[derive(Default)]
struct Inner {
    running: u32,
    waiting: u32,
    focused_task: Option<String>,
}

impl Activity {
    pub fn set_counts(&self, running: u32, waiting: u32) {
        let mut inner = self.inner.lock().unwrap();
        inner.running = running;
        inner.waiting = waiting;
    }

    pub fn set_focused_task(&self, task_id: Option<String>) {
        self.inner.lock().unwrap().focused_task = task_id;
    }

    pub fn running(&self) -> u32 {
        self.inner.lock().unwrap().running
    }

    pub fn is_task_on_screen(&self, task_id: &str) -> bool {
        self.inner.lock().unwrap().focused_task.as_deref() == Some(task_id)
    }
}

pub fn summary(running: u32, waiting: u32) -> String {
    format!("{running} running · {waiting} waiting on you")
}

pub fn tray_title(running: u32, waiting: u32) -> String {
    if running == 0 && waiting == 0 {
        String::new()
    } else {
        format!("{running} · {waiting}")
    }
}

pub fn badge(waiting: u32) -> Option<i64> {
    (waiting > 0).then_some(i64::from(waiting))
}

pub fn quit_prompt(running: u32) -> String {
    if running == 1 {
        "Stop 1 running agent and quit?".to_string()
    } else {
        format!("Stop {running} running agents and quit?")
    }
}

pub fn should_notify(window_focused: bool, task_on_screen: bool) -> bool {
    !(window_focused && task_on_screen)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn summary_and_title() {
        assert_eq!(summary(2, 1), "2 running · 1 waiting on you");
        assert_eq!(tray_title(0, 0), "");
        assert_eq!(tray_title(3, 0), "3 · 0");
    }

    #[test]
    fn badge_only_when_waiting() {
        assert_eq!(badge(0), None);
        assert_eq!(badge(4), Some(4));
    }

    #[test]
    fn quit_prompt_pluralizes() {
        assert_eq!(quit_prompt(1), "Stop 1 running agent and quit?");
        assert_eq!(quit_prompt(3), "Stop 3 running agents and quit?");
    }

    #[test]
    fn notification_suppressed_only_when_focused_on_that_task() {
        assert!(!should_notify(true, true));
        assert!(should_notify(true, false));
        assert!(should_notify(false, true));
    }

    #[test]
    fn tracks_focused_task() {
        let activity = Activity::default();
        activity.set_focused_task(Some("t1".into()));
        assert!(activity.is_task_on_screen("t1"));
        assert!(!activity.is_task_on_screen("t2"));
        activity.set_focused_task(None);
        assert!(!activity.is_task_on_screen("t1"));
    }
}
