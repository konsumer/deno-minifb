use std::collections::HashMap;
use std::ffi::CString;
use std::os::raw::c_char;
use std::sync::Arc;
use std::sync::Mutex;
use std::sync::MutexGuard;

use minifb::Menu as MfbMenu;
use minifb::MenuHandle;
// use minifb::Key;
use minifb::Window as MfbWindow;
use minifb::WindowOptions;
use once_cell::sync::Lazy;

pub type ResourceId = u32;

// Wrap some non-thread-safe structures as thread-safe.

pub struct Window(Arc<Mutex<MfbWindow>>);

unsafe impl Send for Window {}
unsafe impl Sync for Window {}

impl Window {
    pub fn get(&self) -> MutexGuard<MfbWindow> {
        self.0.lock().unwrap()
    }
}

pub struct Menu(Arc<Mutex<MfbMenu>>);

unsafe impl Send for Menu {}
unsafe impl Sync for Menu {}

impl Menu {
    pub fn get(&self) -> MutexGuard<MfbMenu> {
        self.0.lock().unwrap()
    }
}

// Since all calls are sync, we will use a global error state.
pub static LAST_ERROR: Lazy<Mutex<Option<CString>>> = Lazy::new(|| Mutex::new(None));

// Objects like window, menu, etc. are stored as "resources".
pub static NEXT_RESOURCE_ID: Lazy<Mutex<ResourceId>> = Lazy::new(|| Mutex::new(1));
pub static WINDOWS: Lazy<Mutex<HashMap<ResourceId, Window>>> =
    Lazy::new(|| Mutex::new(HashMap::new()));
pub static MENUS: Lazy<Mutex<HashMap<ResourceId, Menu>>> = Lazy::new(|| Mutex::new(HashMap::new()));
pub static MENU_HANDLES: Lazy<Mutex<HashMap<ResourceId, MenuHandle>>> =
    Lazy::new(|| Mutex::new(HashMap::new()));

pub type Result = u8;
pub const OK: Result = 1;
pub const ERR: Result = 0;

pub fn error<T: Into<String>>(error: T) -> Result {
    let error = CString::new(error.into()).unwrap();
    *LAST_ERROR.lock().unwrap() = Some(error);
    ERR
}

pub fn error_resource_not_found(id: ResourceId) -> Result {
    error(format!("Resource with ID {} not found", id))
}

#[no_mangle]
pub extern "C" fn get_last_error() -> *const c_char {
    LAST_ERROR
        .lock()
        .unwrap()
        .as_ref()
        .map(|s| s.as_ptr())
        .unwrap_or(std::ptr::null())
}

#[no_mangle]
pub unsafe extern "C" fn window_new(
    window_id: *mut ResourceId,
    title: *const c_char,
    width: usize,
    height: usize,
) -> Result {
    let mut windows = WINDOWS.lock().unwrap();
    let mut next_resource_id = NEXT_RESOURCE_ID.lock().unwrap();

    let title = std::ffi::CStr::from_ptr(title);
    let window = MfbWindow::new(
        title.to_str().unwrap(),
        width,
        height,
        WindowOptions::default(),
    );

    match window {
        Ok(window) => {
            windows.insert(*next_resource_id, Window(Arc::new(Mutex::new(window))));
            *window_id = *next_resource_id;
            *next_resource_id += 1;
            OK
        }
        Err(err) => error(err.to_string()),
    }
}

#[no_mangle]
pub extern "C" fn window_close(id: ResourceId) -> Result {
    let mut windows = WINDOWS.lock().unwrap();

    if windows.contains_key(&id) {
        windows.remove(&id);
        OK
    } else {
        error_resource_not_found(id)
    }
}

#[no_mangle]
pub unsafe extern "C" fn window_set_title(id: ResourceId, title: *mut c_char) -> Result {
    let windows = WINDOWS.lock().unwrap();

    if let Some(window) = windows.get(&id) {
        let mut window = window.get();
        window.set_title(CString::from_raw(title).to_str().unwrap());
        OK
    } else {
        error_resource_not_found(id)
    }
}

#[no_mangle]
pub unsafe extern "C" fn window_topmost(id: ResourceId, topmost: bool) -> Result {
    let windows = WINDOWS.lock().unwrap();

    if let Some(window) = windows.get(&id) {
        let window = window.get();
        window.topmost(topmost);
        OK
    } else {
        error_resource_not_found(id)
    }
}

#[no_mangle]
pub unsafe extern "C" fn window_set_cursor_visibility(id: ResourceId, visible: bool) -> Result {
    let windows = WINDOWS.lock().unwrap();

    if let Some(window) = windows.get(&id) {
        let mut window = window.get();
        window.set_cursor_visibility(visible);
        OK
    } else {
        error_resource_not_found(id)
    }
}

#[no_mangle]
pub unsafe extern "C" fn window_set_background_color(
    id: ResourceId,
    r: u8,
    g: u8,
    b: u8,
) -> Result {
    let windows = WINDOWS.lock().unwrap();

    if let Some(window) = windows.get(&id) {
        let mut window = window.get();
        // Just why MiniFB? RGB values are max 0xFF which is sufficient in a u8...
        window.set_background_color(r as usize, g as usize, b as usize);
        OK
    } else {
        error_resource_not_found(id)
    }
}

#[no_mangle]
pub unsafe extern "C" fn window_set_position(id: ResourceId, x: isize, y: isize) -> Result {
    let windows = WINDOWS.lock().unwrap();

    if let Some(window) = windows.get(&id) {
        let mut window = window.get();
        window.set_position(x, y);
        OK
    } else {
        error_resource_not_found(id)
    }
}

#[no_mangle]
pub unsafe extern "C" fn window_set_key_repeat_delay(id: ResourceId, delay: f32) -> Result {
    let windows = WINDOWS.lock().unwrap();

    if let Some(window) = windows.get(&id) {
        let mut window = window.get();
        window.set_key_repeat_delay(delay);
        OK
    } else {
        error_resource_not_found(id)
    }
}

#[no_mangle]
pub unsafe extern "C" fn window_set_key_repeat_rate(id: ResourceId, rate: f32) -> Result {
    let windows = WINDOWS.lock().unwrap();

    if let Some(window) = windows.get(&id) {
        let mut window = window.get();
        window.set_key_repeat_rate(rate);
        OK
    } else {
        error_resource_not_found(id)
    }
}

#[no_mangle]
pub unsafe extern "C" fn window_is_menu_pressed(id: ResourceId, pressed: *mut isize) -> Result {
    let windows = WINDOWS.lock().unwrap();

    if let Some(window) = windows.get(&id) {
        let mut window = window.get();
        *pressed = match window.is_menu_pressed() {
            Some(pressed) => pressed as isize,
            None => -1,
        };
        OK
    } else {
        error_resource_not_found(id)
    }
}

#[no_mangle]
pub unsafe extern "C" fn window_add_menu(
    id: ResourceId,
    menu_id: ResourceId,
    handle_id: *mut ResourceId,
) -> Result {
    let windows = WINDOWS.lock().unwrap();
    let menus = MENUS.lock().unwrap();
    let mut menu_handles = MENU_HANDLES.lock().unwrap();
    let mut next_resource_id = NEXT_RESOURCE_ID.lock().unwrap();

    if let Some(window) = windows.get(&id) {
        let mut window = window.get();

        if let Some(menu) = menus.get(&menu_id) {
            let menu = menu.get();
            let handle = window.add_menu(&menu);

            let rid = *next_resource_id;
            menu_handles.insert(rid, handle);
            *handle_id = rid;
            *next_resource_id += 1;

            OK
        } else {
            error_resource_not_found(menu_id)
        }
    } else {
        error_resource_not_found(id)
    }
}

#[no_mangle]
pub unsafe extern "C" fn window_remove_menu(id: ResourceId, handle_id: ResourceId) -> Result {
    let windows = WINDOWS.lock().unwrap();
    let mut menu_handles = MENU_HANDLES.lock().unwrap();

    if let Some(window) = windows.get(&id) {
        let mut window = window.get();

        if let Some(menu) = menu_handles.get(&handle_id) {
            window.remove_menu(*menu);
            menu_handles.remove(&handle_id);
            OK
        } else {
            error_resource_not_found(handle_id)
        }
    } else {
        error_resource_not_found(id)
    }
}

#[no_mangle]
pub unsafe extern "C" fn window_get_size(id: ResourceId, width: *mut usize, height: *mut usize) -> Result {
    let windows = WINDOWS.lock().unwrap();

    if let Some(window) = windows.get(&id) {
        let window = window.get();
        let size = window.get_size();
        *width = size.0;
        *height = size.1;
        OK
    } else {
        error_resource_not_found(id)
    }
}

#[no_mangle]
pub unsafe extern "C" fn window_is_open(id: ResourceId, open: *mut bool) -> Result {
    let windows = WINDOWS.lock().unwrap();

    if let Some(window) = windows.get(&id) {
        let window = window.get();
        *open = window.is_open();
        OK
    } else {
        error_resource_not_found(id)
    }
}

#[no_mangle]
pub unsafe extern "C" fn window_is_active(id: ResourceId, active: *mut bool) -> Result {
    let mut windows = WINDOWS.lock().unwrap();

    if let Some(window) = windows.get_mut(&id) {
        let mut window = window.get();
        *active = window.is_active();
        OK
    } else {
        error_resource_not_found(id)
    }
}

#[no_mangle]
pub extern "C" fn window_limit_update_rate(id: ResourceId, ms: u64) -> Result {
    let mut windows = WINDOWS.lock().unwrap();

    if let Some(window) = windows.get_mut(&id) {
        let mut window = window.get();
        window.limit_update_rate(if ms == 0 {
            None
        } else {
            Some(std::time::Duration::from_micros(ms))
        });
        OK
    } else {
        error_resource_not_found(id)
    }
}

#[no_mangle]
pub extern "C" fn window_update_with_buffer(
    id: ResourceId,
    buffer: *const u32,
    width: usize,
    height: usize,
) -> Result {
    let mut windows = WINDOWS.lock().unwrap();

    if let Some(window) = windows.get_mut(&id) {
        let mut window = window.get();
        let buffer: &[u32] = unsafe { std::slice::from_raw_parts(buffer, width * height * 4) };
        match window.update_with_buffer(buffer, width, height) {
            Ok(_) => OK,
            Err(err) => error(err.to_string()),
        }
    } else {
        error_resource_not_found(id)
    }
}

#[no_mangle]
pub extern "C" fn window_update(id: ResourceId) -> Result {
    let mut windows = WINDOWS.lock().unwrap();

    if let Some(window) = windows.get_mut(&id) {
        let mut window = window.get();
        window.update();
        OK
    } else {
        error_resource_not_found(id)
    }
}

#[no_mangle]
pub unsafe extern "C" fn menu_new(id: *mut ResourceId, name: *mut c_char) -> Result {
    let mut menus = MENUS.lock().unwrap();
    let mut next_resource_id = NEXT_RESOURCE_ID.lock().unwrap();

    let menu = MfbMenu::new(CString::from_raw(name).to_str().unwrap());

    if let Err(err) = menu {
        return error(err.to_string());
    }

    let menu = menu.unwrap();

    let rid = *next_resource_id;
    *next_resource_id += 1;
    *id = rid;
    menus.insert(rid, Menu(Arc::new(Mutex::new(menu))));

    OK
}

#[no_mangle]
pub unsafe extern "C" fn menu_destroy(id: ResourceId) -> Result {
    let mut menus = MENUS.lock().unwrap();

    if menus.contains_key(&id) {
        menus.remove(&id);
        OK
    } else {
        error_resource_not_found(id)
    }
}
