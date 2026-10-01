use tauri::menu::{Menu, MenuItemBuilder, PredefinedMenuItem};
use tauri::tray::TrayIconBuilder;
use tauri::{AppHandle, Manager};

use crate::activity;
use crate::quit;

const TRAY_ID: &str = "main";
const OPEN_ID: &str = "open";
const QUIT_ID: &str = "quit";

pub fn show_main_window(app: &AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.show();
        let _ = window.unminimize();
        let _ = window.set_focus();
    }
}

fn build_menu(app: &AppHandle, running: u32, waiting: u32) -> tauri::Result<Menu<tauri::Wry>> {
    let status = MenuItemBuilder::new(activity::summary(running, waiting))
        .enabled(false)
        .build(app)?;
    let open = MenuItemBuilder::with_id(OPEN_ID, "Open Interlock").build(app)?;
    let quit = MenuItemBuilder::with_id(QUIT_ID, "Quit Interlock")
        .accelerator("Cmd+Q")
        .build(app)?;
    let separator = PredefinedMenuItem::separator(app)?;
    Menu::with_items(app, &[&status, &separator, &open, &quit])
}

pub fn setup(app: &AppHandle) -> tauri::Result<()> {
    let mut tray = TrayIconBuilder::with_id(TRAY_ID)
        .menu(&build_menu(app, 0, 0)?)
        .show_menu_on_left_click(true)
        .on_menu_event(|app, event| match event.id().as_ref() {
            OPEN_ID => show_main_window(app),
            QUIT_ID => quit::request(app),
            _ => {}
        });
    if let Some(icon) = app.default_window_icon() {
        tray = tray.icon(icon.clone()).icon_as_template(true);
    }
    tray.build(app)?;
    Ok(())
}

pub fn update(app: &AppHandle, running: u32, waiting: u32) -> tauri::Result<()> {
    if let Some(tray) = app.tray_by_id(TRAY_ID) {
        tray.set_title(Some(activity::tray_title(running, waiting)))?;
        tray.set_tooltip(Some(activity::summary(running, waiting)))?;
        tray.set_menu(Some(build_menu(app, running, waiting)?))?;
    }
    Ok(())
}
