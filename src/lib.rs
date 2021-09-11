extern crate minifb;

use minifb::Window;
use minifb::WindowOptions;

#[no_mangle]
pub extern "C" fn window_new(title: &String, width: &usize, height: &usize) -> usize {
    let win =
        &mut Window::new(title, *width, *height, WindowOptions::default()).unwrap_or_else(|e| {
            panic!("{}", e);
        });
    return win as *const _ as usize;
}

#[no_mangle]
pub extern "C" fn window_update(
    window: &mut Window,
    buffer: &mut Vec<u32>,
    width: &usize,
    height: &usize,
) {
    window.update_with_buffer(&buffer, *width, *height).unwrap();
}
