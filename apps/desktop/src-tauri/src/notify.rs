use std::sync::Arc;

use tauri::{AppHandle, Emitter, Manager};

use crate::activity::{self, Activity};
use crate::tray;

pub const OPEN_TASK_EVENT: &str = "app://open-task";

fn window_focused(app: &AppHandle) -> bool {
    app.get_webview_window("main")
        .is_some_and(|w| w.is_focused().unwrap_or(false) && w.is_visible().unwrap_or(false))
}

pub fn send(app: &AppHandle, title: String, body: String, task_id: String) {
    let on_screen = app.state::<Arc<Activity>>().is_task_on_screen(&task_id);
    if !activity::should_notify(window_focused(app), on_screen) {
        return;
    }
    let app = app.clone();
    std::thread::spawn(move || deliver(&app, &title, &body, &task_id));
}

#[cfg(target_os = "macos")]
fn deliver(app: &AppHandle, title: &str, body: &str, task_id: &str) {
    use mac_notification_sys::{Notification, NotificationResponse};

    let bundle = if tauri::is_dev() {
        "com.apple.Terminal".to_string()
    } else {
        app.config().identifier.clone()
    };
    let _ = mac_notification_sys::set_application(&bundle);
    let response = Notification::new()
        .title(title)
        .message(body)
        .wait_for_click(true)
        .send();
    if matches!(response, Ok(NotificationResponse::Click)) {
        tray::show_main_window(app);
        let _ = app.emit(OPEN_TASK_EVENT, task_id);
    }
}

#[cfg(not(target_os = "macos"))]
fn deliver(app: &AppHandle, title: &str, body: &str, _task_id: &str) {
    use tauri_plugin_notification::NotificationExt;
    let _ = app.notification().builder().title(title).body(body).show();
}
