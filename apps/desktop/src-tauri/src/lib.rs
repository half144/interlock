mod activity;
mod daemon;
mod login_env;
mod notify;
mod quit;
mod tray;

use std::sync::Arc;

use tauri::menu::{MenuBuilder, MenuItemBuilder, SubmenuBuilder};
use tauri::{AppHandle, Manager, RunEvent, State, WindowEvent};
use tauri_plugin_dialog::DialogExt;

use activity::Activity;
use daemon::{Daemon, DaemonConnection};

#[tauri::command]
fn daemon_connection(daemon: State<'_, Arc<Daemon>>) -> DaemonConnection {
    daemon.connection()
}

#[tauri::command]
fn daemon_status(daemon: State<'_, Arc<Daemon>>) -> daemon::DaemonStatus {
    daemon.status()
}

#[tauri::command]
fn set_activity(app: AppHandle, activity: State<'_, Arc<Activity>>, running: u32, waiting: u32) {
    activity.set_counts(running, waiting);
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.set_badge_count(activity::badge(waiting));
    }
    let _ = tray::update(&app, running, waiting);
}

#[tauri::command]
fn set_focus(activity: State<'_, Arc<Activity>>, task_id: Option<String>) {
    activity.set_focused_task(task_id);
}

#[tauri::command]
fn notify(app: AppHandle, title: String, body: String, task_id: String) {
    notify::send(&app, title, body, task_id);
}

#[tauri::command]
async fn pick_folder(app: AppHandle) -> Option<String> {
    app.dialog()
        .file()
        .blocking_pick_folder()
        .and_then(|path| path.into_path().ok())
        .map(|path| path.to_string_lossy().into_owned())
}

const APP_QUIT_ID: &str = "app-quit";

pub fn run() {
    let app = tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_shell::init())
        .manage(Daemon::new())
        .manage(Arc::new(Activity::default()))
        .invoke_handler(tauri::generate_handler![
            daemon_connection,
            daemon_status,
            set_activity,
            set_focus,
            notify,
            pick_folder
        ])
        .on_menu_event(|app, event| {
            if event.id().as_ref() == APP_QUIT_ID {
                quit::request(app);
            }
        })
        .setup(|app| {
            let handle = app.handle();
            let quit_item = MenuItemBuilder::with_id(APP_QUIT_ID, "Quit Interlock")
                .accelerator("Cmd+Q")
                .build(handle)?;
            let app_menu = SubmenuBuilder::new(handle, "Interlock")
                .about(None)
                .separator()
                .hide()
                .hide_others()
                .show_all()
                .separator()
                .item(&quit_item)
                .build()?;
            let edit_menu = SubmenuBuilder::new(handle, "Edit")
                .undo()
                .redo()
                .separator()
                .cut()
                .copy()
                .paste()
                .select_all()
                .build()?;
            let window_menu = SubmenuBuilder::new(handle, "Window")
                .minimize()
                .maximize()
                .close_window()
                .build()?;
            let menu = MenuBuilder::new(handle)
                .items(&[&app_menu, &edit_menu, &window_menu])
                .build()?;
            app.set_menu(menu)?;

            tray::setup(handle)?;
            app.state::<Arc<Daemon>>().start(handle.clone());
            Ok(())
        })
        .on_window_event(|window, event| {
            if let WindowEvent::CloseRequested { api, .. } = event {
                api.prevent_close();
                let _ = window.hide();
            }
        })
        .build(tauri::generate_context!())
        .expect("failed to build the Interlock app");

    app.run(|app, event| match event {
        RunEvent::Reopen { .. } => tray::show_main_window(app),
        RunEvent::ExitRequested {
            api, code: None, ..
        } => {
            api.prevent_exit();
            quit::request(app);
        }
        RunEvent::Exit => app.state::<Arc<Daemon>>().stop(),
        _ => {}
    });
}
