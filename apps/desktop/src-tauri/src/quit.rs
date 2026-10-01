use std::sync::Arc;

use tauri::{AppHandle, Manager};
use tauri_plugin_dialog::{DialogExt, MessageDialogButtons, MessageDialogKind};

use crate::activity::{self, Activity};
use crate::tray;

pub fn request(app: &AppHandle) {
    let running = app.state::<Arc<Activity>>().running();
    if running == 0 {
        app.exit(0);
        return;
    }
    tray::show_main_window(app);
    let handle = app.clone();
    app.dialog()
        .message(activity::quit_prompt(running))
        .title("Quit Interlock")
        .kind(MessageDialogKind::Warning)
        .buttons(MessageDialogButtons::OkCancelCustom(
            "Stop and quit".into(),
            "Cancel".into(),
        ))
        .show(move |confirmed| {
            if confirmed {
                handle.exit(0);
            }
        });
}
