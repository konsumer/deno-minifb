const LIB_PATH = new URL("../minifb/build/libminifb.dll", import.meta.url);

const lib = Deno.dlopen(
  LIB_PATH,
  {
    mfb_open: {
      parameters: [
        "pointer", /** const char* title */
        "u32", /** unsigned width */
        "u32", /** unsigned height */
      ],
      result: "pointer", /** mfb_window* */
    },

    mfb_open_ex: {
      parameters: [
        "pointer", /** const char* title */
        "u32", /** unsigned width */
        "u32", /** unsigned height */
        "u32", /** unsigned flags */
      ],
      result: "pointer", /** mfb_window* */
    },

    mfb_update: {
      parameters: [
        "pointer", /** struct mfb_window *window */
        "pointer", /** void *buffer */
      ],
      result: "i32", /** mfb_update_state */
    },

    mfb_update_ex: {
      parameters: [
        "pointer", /** struct mfb_window *window */
        "pointer", /** void *buffer */
        "u32", /** unsigned width */
        "u32", /** unsigned height */
      ],
      result: "i32", /** mfb_update_state */
    },

    mfb_update_events: {
      parameters: [
        "pointer", /** struct mfb_window *window */
      ],
      result: "i32", /** mfb_update_state */
    },

    mfb_close: {
      parameters: [
        "pointer", /** struct mfb_window *window */
      ],
      result: "void",
    },

    mfb_set_user_data: {
      parameters: [
        "pointer", /** struct mfb_window *window */
        "pointer", /** void *user_data */
      ],
      result: "void",
    },

    mfb_get_user_data: {
      parameters: [
        "pointer", /** struct mfb_window *window */
      ],
      result: "pointer", /** void * */
    },

    mfb_set_viewport: {
      parameters: [
        "pointer", /** struct mfb_window *window */
        "u32", /** unsigned x */
        "u32", /** unsigned y */
        "u32", /** unsigned width */
        "u32", /** unsigned height */
      ],
      result: "u8",
    },

    mfb_get_monitor_scale: {
      parameters: [
        "pointer", /** struct mfb_window *window */
        "pointer", /** float *scale_x */
        "pointer", /** float *scale_y */
      ],
      result: "void",
    },

    // TODO: Support callbacks once Deno FFI supports them.
    // https://github.com/denoland/deno/pull/13162

    mfb_set_active_callback: {
      parameters: [
        "pointer", /** struct mfb_window *window */
        "pointer", /** mfb_active_callback callback */
      ],
      result: "void",
    },

    mfb_set_resize_callback: {
      parameters: [
        "pointer", /** struct mfb_window *window */
        "pointer", /** mfb_resize_callback callback */
      ],
      result: "void",
    },

    mfb_set_keyboard_callback: {
      parameters: [
        "pointer", /** struct mfb_window *window */
        "pointer", /** mfb_keyboard_callback callback */
      ],
      result: "void",
    },

    mfb_set_char_input_callback: {
      parameters: [
        "pointer", /** struct mfb_window *window */
        "pointer", /** mfb_char_input_callback callback */
      ],
      result: "void",
    },

    mfb_set_mouse_button_callback: {
      parameters: [
        "pointer", /** struct mfb_window *window */
        "pointer", /** mfb_mouse_button_callback callback */
      ],
      result: "void",
    },

    mfb_set_mouse_move_callback: {
      parameters: [
        "pointer", /** struct mfb_window *window */
        "pointer", /** mfb_mouse_move_callback callback */
      ],
      result: "void",
    },

    mfb_set_mouse_scroll_callback: {
      parameters: [
        "pointer", /** struct mfb_window *window */
        "pointer", /** mfb_mouse_scroll_callback callback */
      ],
      result: "void",
    },

    mfb_get_key_name: {
      parameters: [
        "i32", /** mfb_key key */
      ],
      result: "pointer", /** const char* */
    },

    mfb_is_window_active: {
      parameters: [
        "pointer", /** struct mfb_window *window */
      ],
      result: "u8", /** bool */
    },

    mfb_get_window_width: {
      parameters: [
        "pointer", /** struct mfb_window *window */
      ],
      result: "u32", /** unsigned */
    },

    mfb_get_window_height: {
      parameters: [
        "pointer", /** struct mfb_window *window */
      ],
      result: "u32", /** unsigned */
    },

    mfb_get_mouse_x: {
      parameters: [
        "pointer", /** struct mfb_window *window */
      ],
      result: "i32", /** int */
    },

    mfb_get_mouse_y: {
      parameters: [
        "pointer", /** struct mfb_window *window */
      ],
      result: "i32", /** int */
    },

    mfb_get_mouse_scroll_x: {
      parameters: [
        "pointer", /** struct mfb_window *window */
      ],
      result: "f32", /** float */
    },

    mfb_get_mouse_scroll_y: {
      parameters: [
        "pointer", /** struct mfb_window *window */
      ],
      result: "f32", /** float */
    },

    mfb_get_mouse_button_buffer: {
      parameters: [
        "pointer", /** struct mfb_window *window */
      ],
      result: "pointer", /** const uint8_t* */
    },

    mfb_get_key_buffer: {
      parameters: [
        "pointer", /** struct mfb_window *window */
      ],
      result: "pointer", /** const uint8_t* */
    },

    mfb_set_target_fps: {
      parameters: [
        "u32", /** uint32_t target_fps */
      ],
      result: "void",
    },

    mfb_get_target_fps: {
      parameters: [],
      result: "u32", /** unsigned */
    },

    mfb_wait_sync: {
      parameters: [
        "pointer", /** struct mfb_window *window */
      ],
      result: "u8", /** bool */
    },

    mfb_timer_create: {
      parameters: [],
      result: "pointer", /** struct mfb_timer* */
    },

    mfb_timer_destroy: {
      parameters: [
        "pointer", /** struct mfb_timer *timer */
      ],
      result: "void",
    },

    mfb_timer_reset: {
      parameters: [
        "pointer", /** struct mfb_timer *timer */
      ],
      result: "void",
    },

    mfb_timer_now: {
      parameters: [
        "pointer", /** struct mfb_timer *timer */
      ],
      result: "f64", /** double */
    },

    mfb_timer_delta: {
      parameters: [
        "pointer", /** struct mfb_timer *timer */
      ],
      result: "f64", /** double */
    },

    mfb_timer_get_frequency: {
      parameters: [],
      result: "f64", /** double */
    },

    mfb_timer_get_resolution: {
      parameters: [],
      result: "f64", /** double */
    },
  },
);

export type mfb_window = Deno.UnsafePointer;
export type mfb_timer = Deno.UnsafePointer;
export type c_void = Deno.UnsafePointer;

function cstr(str: string) {
  const buf = new Uint8Array(str.length + 1);
  new TextEncoder().encodeInto(str, buf);
  return buf;
}

export function mfb_open(
  title: string,
  width: number,
  height: number,
): mfb_window {
  return lib.symbols.mfb_open(
    cstr(title),
    width,
    height,
  ) as mfb_window;
}

export function mfb_open_ex(
  title: string,
  width: number,
  height: number,
  flags: number,
): mfb_window {
  return lib.symbols.mfb_open_ex(
    cstr(title),
    width,
    height,
    flags,
  ) as mfb_window;
}

export function mfb_update(
  window: mfb_window,
  buffer: Uint8Array,
): number {
  return lib.symbols.mfb_update(
    window,
    buffer,
  ) as number;
}

export function mfb_update_ex(
  window: mfb_window,
  buffer: Uint8Array,
  width: number,
  height: number,
): number {
  return lib.symbols.mfb_update_ex(
    window,
    buffer,
    width,
    height,
  ) as number;
}

export function mfb_update_events(window: mfb_window): number {
  return lib.symbols.mfb_update_events(window) as number;
}

export function mfb_close(window: mfb_window): void {
  lib.symbols.mfb_close(window);
}

export function mfb_set_user_data(
  window: mfb_window,
  user_data: c_void,
): void {
  lib.symbols.mfb_set_user_data(window, user_data);
}

export function mfb_get_user_data(window: mfb_window): c_void {
  return lib.symbols.mfb_get_user_data(window) as Deno.UnsafePointer;
}

export function mfb_set_viewport(
  window: mfb_window,
  x: number,
  y: number,
  width: number,
  height: number,
): void {
  lib.symbols.mfb_set_viewport(window, x, y, width, height);
}

export function mfb_get_monitor_scale(
  window: mfb_window,
): [number, number] {
  const scale = new Float32Array(2);
  lib.symbols.mfb_get_monitor_scale(
    window,
    scale.subarray(0, 4),
    scale.subarray(4, 8),
  );
  return [scale[0], scale[1]];
}

export function mfb_get_key_name(key: number): string {
  const namePtr = lib.symbols.mfb_get_key_name(key) as Deno.UnsafePointer;
  return new Deno.UnsafePointerView(namePtr).getCString();
}

export function mfb_is_window_active(window: mfb_window): boolean {
  return Boolean(lib.symbols.mfb_is_window_active(window) as number);
}

export function mfb_get_window_width(window: mfb_window): number {
  return lib.symbols.mfb_get_window_width(window) as number;
}

export function mfb_get_window_height(window: mfb_window): number {
  return lib.symbols.mfb_get_window_height(window) as number;
}

export function mfb_get_mouse_x(window: mfb_window): number {
  return lib.symbols.mfb_get_mouse_x(window) as number;
}

export function mfb_get_mouse_y(window: mfb_window): number {
  return lib.symbols.mfb_get_mouse_y(window) as number;
}

export function mfb_get_mouse_scroll_x(window: mfb_window): number {
  return lib.symbols.mfb_get_mouse_scroll_x(window) as number;
}

export function mfb_get_mouse_scroll_y(window: mfb_window): number {
  return lib.symbols.mfb_get_mouse_scroll_y(window) as number;
}

export function mfb_get_mouse_button_buffer(
  window: mfb_window,
): Deno.UnsafePointerView {
  const ptr = lib.symbols.mfb_get_mouse_button_buffer(
    window,
  ) as Deno.UnsafePointer;
  return new Deno.UnsafePointerView(ptr);
}

export function mfb_get_key_buffer(window: mfb_window): Deno.UnsafePointerView {
  const ptr = lib.symbols.mfb_get_key_buffer(window) as Deno.UnsafePointer;
  return new Deno.UnsafePointerView(ptr);
}

export function mfb_set_target_fps(target_fps: number): void {
  lib.symbols.mfb_set_target_fps(target_fps);
}

export function mfb_get_target_fps(): number {
  return lib.symbols.mfb_get_target_fps() as number;
}

export function mfb_wait_sync(window: mfb_window): boolean {
  return Boolean(lib.symbols.mfb_wait_sync(window) as number);
}

export function mfb_timer_create(): mfb_timer {
  return lib.symbols.mfb_timer_create() as mfb_timer;
}

export function mfb_timer_destroy(timer: mfb_timer): void {
  lib.symbols.mfb_timer_destroy(timer);
}

export function mfb_timer_reset(timer: mfb_timer): void {
  lib.symbols.mfb_timer_reset(timer);
}

export function mfb_timer_now(timer: mfb_timer): number {
  return lib.symbols.mfb_timer_now(timer) as number;
}

export function mfb_timer_delta(timer: mfb_timer): number {
  return lib.symbols.mfb_timer_delta(timer) as number;
}

export function mfb_timer_get_frequency(): number {
  return lib.symbols.mfb_timer_get_frequency() as number;
}

export function mfb_timer_get_resolution(): number {
  return lib.symbols.mfb_timer_get_resolution() as number;
}

export * from "./constants.ts";
