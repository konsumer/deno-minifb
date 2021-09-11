extern crate minifb;

use minifb::{Key, Window, WindowOptions};

fn show(title: &str, width: usize, height: usize, buffer: &mut Vec<u32>) {
    let mut window =
        Window::new(title, width, height, WindowOptions::default()).unwrap_or_else(|e| {
            panic!("{}", e);
        });

    // Limit to max ~60 fps update rate
    window.limit_update_rate(Some(std::time::Duration::from_micros(16600)));

    while window.is_open() && !window.is_key_down(Key::Escape) {
        for i in buffer.iter_mut() {
            *i = 0;
        }
        window.update_with_buffer(&buffer, width, height).unwrap();
    }
}

fn main() {
    let mut buffer: Vec<u32> = vec![0; 320 * 240];
    show("Hello", 320, 240, &mut buffer);
}
