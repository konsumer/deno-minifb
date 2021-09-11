extern crate minifb;

use minifb::Key;
use minifb::Window;
use minifb::WindowOptions;

#[no_mangle]
pub extern "C" fn show(title: &String, width: &usize, height: &usize, buffer: &mut Vec<u32>) {
    let mut window =
        Window::new(title, *width, *height, WindowOptions::default()).unwrap_or_else(|e| {
            panic!("{}", e);
        });

    // Limit to max ~60 fps update rate
    window.limit_update_rate(Some(std::time::Duration::from_micros(16600)));

    while window.is_open() && !window.is_key_down(Key::Escape) {
        for i in buffer.iter_mut() {
            *i = 0;
        }
        window.update_with_buffer(&buffer, *width, *height).unwrap();
    }
}
