use std::collections::HashMap;
use std::ffi::CStr;
use std::ffi::CString;
use std::os::raw::c_char;
use std::sync::Arc;
use std::sync::Mutex;
use std::sync::MutexGuard;

use key::key_to_id;
use key::KeyId;
use minifb::KeyRepeat;
use minifb::Menu as MfbMenu;
use minifb::MenuHandle;
use minifb::MenuItem as MfbMenuItem;
use minifb::MenuItemHandle;
use minifb::MouseButton;
use minifb::MouseMode;
// use minifb::Key;
use minifb::Window as MfbWindow;
use minifb::WindowOptions;
use once_cell::sync::Lazy;

pub mod key;

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

pub struct MenuItem(Arc<Mutex<MfbMenuItem<'static>>>);

unsafe impl Send for MenuItem {}
unsafe impl Sync for MenuItem {}

impl MenuItem {
    pub fn get(&'static self) -> MutexGuard<MfbMenuItem> {
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
pub static MENU_ITEMS: Lazy<Mutex<HashMap<ResourceId, MenuItem>>> =
    Lazy::new(|| Mutex::new(HashMap::new()));
pub static MENU_HANDLES: Lazy<Mutex<HashMap<ResourceId, MenuHandle>>> =
    Lazy::new(|| Mutex::new(HashMap::new()));
pub static MENU_ITEM_HANDLES: Lazy<Mutex<HashMap<ResourceId, MenuItemHandle>>> =
    Lazy::new(|| Mutex::new(HashMap::new()));
pub static NEXT_KEYS: Lazy<Mutex<Vec<KeyId>>> = Lazy::new(|| Mutex::new(Vec::new()));

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
pub unsafe extern "C" fn window_get_mouse_down(
    id: ResourceId,
    button: u8,
    down: *mut bool,
) -> Result {
    let windows = WINDOWS.lock().unwrap();

    if let Some(window) = windows.get(&id) {
        let window = window.get();
        *down = window.get_mouse_down(match button {
            0 => MouseButton::Left,
            1 => MouseButton::Right,
            2 => MouseButton::Middle,
            _ => return error("Invalid mouse button"),
        });
        OK
    } else {
        error_resource_not_found(id)
    }
}

#[no_mangle]
pub unsafe extern "C" fn window_get_mouse_pos(
    id: ResourceId,
    mode: u8,
    none: *mut bool,
    x: *mut f32,
    y: *mut f32,
) -> Result {
    let windows = WINDOWS.lock().unwrap();

    if let Some(window) = windows.get(&id) {
        let window = window.get();
        let pos = window.get_mouse_pos(match mode {
            0 => MouseMode::Clamp,
            1 => MouseMode::Pass,
            2 => MouseMode::Discard,
            _ => return error("Invalid mouse mode"),
        });
        if let Some((px, py)) = pos {
            *x = px;
            *y = py;
        } else {
            *none = true;
        }
        OK
    } else {
        error_resource_not_found(id)
    }
}

#[no_mangle]
pub unsafe extern "C" fn window_get_keys(id: ResourceId, keys_len: *mut usize) -> Result {
    let windows = WINDOWS.lock().unwrap();

    if let Some(window) = windows.get(&id) {
        let window = window.get();
        let keys = window.get_keys();
        let mut data = vec![0 as KeyId; keys.len()];
        for (i, key) in keys.iter().enumerate() {
            data[i] = key_to_id(*key);
        }
        *keys_len = data.len();
        *NEXT_KEYS.lock().unwrap() = data;
        OK
    } else {
        error_resource_not_found(id)
    }
}

#[no_mangle]
pub unsafe extern "C" fn window_get_keys_pressed(
    id: ResourceId,
    keys_len: *mut usize,
    repeat: u8,
) -> Result {
    let windows = WINDOWS.lock().unwrap();

    if let Some(window) = windows.get(&id) {
        let window = window.get();
        let keys = window.get_keys_pressed(match repeat {
            0 => KeyRepeat::No,
            _ => KeyRepeat::Yes,
        });
        let mut data = vec![0 as KeyId; keys.len()];
        for (i, key) in keys.iter().enumerate() {
            data[i] = key_to_id(*key);
        }
        *keys_len = data.len();
        *NEXT_KEYS.lock().unwrap() = data;
        OK
    } else {
        error_resource_not_found(id)
    }
}

#[no_mangle]
pub unsafe extern "C" fn window_get_keys_released(id: ResourceId, keys_len: *mut usize) -> Result {
    let windows = WINDOWS.lock().unwrap();

    if let Some(window) = windows.get(&id) {
        let window = window.get();
        let keys = window.get_keys_released();
        let mut data = vec![0 as KeyId; keys.len()];
        for (i, key) in keys.iter().enumerate() {
            data[i] = key_to_id(*key);
        }
        *keys_len = data.len();
        *NEXT_KEYS.lock().unwrap() = data;
        OK
    } else {
        error_resource_not_found(id)
    }
}

#[no_mangle]
pub unsafe extern "C" fn read_keys(out_keys: *mut u8) {
    let mut keys = NEXT_KEYS.lock().unwrap();
    std::ptr::copy(keys.as_slice().as_ptr(), out_keys, keys.len());
    *keys = Vec::new();
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
pub unsafe extern "C" fn window_get_size(
    id: ResourceId,
    width: *mut usize,
    height: *mut usize,
) -> Result {
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
pub unsafe extern "C" fn menu_add_separator(id: ResourceId) -> Result {
    let menus = MENUS.lock().unwrap();

    if let Some(menu) = menus.get(&id) {
        let mut menu = menu.get();
        menu.add_separator();
        OK
    } else {
        error_resource_not_found(id)
    }
}

#[no_mangle]
pub unsafe extern "C" fn menu_add_sub_menu(
    id: ResourceId,
    name: *mut c_char,
    sub_menu_id: ResourceId,
) -> Result {
    let menus = MENUS.lock().unwrap();

    if let Some(menu) = menus.get(&id) {
        let mut menu = menu.get();

        if let Some(sub_menu) = menus.get(&sub_menu_id) {
            let sub_menu = sub_menu.get();
            menu.add_sub_menu(CString::from_raw(name).to_str().unwrap(), &sub_menu);
            OK
        } else {
            error_resource_not_found(sub_menu_id)
        }
    } else {
        error_resource_not_found(id)
    }
}

#[no_mangle]
pub unsafe extern "C" fn menu_add_item(
    id: ResourceId,
    name: *const c_char,
    item_id: usize,
    // item_rid: *mut ResourceId,
) -> Result {
    let menus = MENUS.lock().unwrap();
    // TODO: I can't figure out rust lifetimes for the life of me
    // let mut items = MENU_ITEMS.lock().unwrap();
    // let mut next_resource_id = NEXT_RESOURCE_ID.lock().unwrap();

    if let Some(menu) = menus.get(&id) {
        let mut menu = menu.get();
        let mut item = menu.add_item(CStr::from_ptr(name).to_str().unwrap(), item_id);
        item.build();
        // let rid = *next_resource_id;
        // *next_resource_id += 1;
        // *item_rid = rid;
        // items.insert(rid, MenuItem(Arc::new(Mutex::new(item))));
        OK
    } else {
        error_resource_not_found(id)
    }
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
