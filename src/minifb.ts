import {
  mfb_close,
  mfb_get_key_buffer,
  mfb_get_key_name,
  mfb_get_monitor_scale,
  mfb_get_mouse_button_buffer,
  mfb_get_mouse_scroll_x,
  mfb_get_mouse_scroll_y,
  mfb_get_mouse_x,
  mfb_get_mouse_y,
  mfb_get_target_fps,
  mfb_get_window_height,
  mfb_get_window_width,
  mfb_is_window_active,
  mfb_open_ex,
  mfb_set_target_fps,
  mfb_set_viewport,
  mfb_update_events,
  mfb_update_ex,
  mfb_wait_sync,
  mfb_window,
  STATE_EXIT,
  STATE_INTERNAL_ERROR,
  STATE_INVALID_BUFFER,
  STATE_INVALID_WINDOW,
  STATE_OK,
} from "./ffi.ts";

export function getKeyName(id: number) {
  return mfb_get_key_name(id);
}

export function getTargetFPS() {
  return mfb_get_target_fps();
}

export function setTargetFPS(fps: number) {
  mfb_set_target_fps(fps);
}

function unwrapUpdateState(state: number) {
  switch (state) {
    case STATE_OK:
      return true;

    case STATE_EXIT:
      return false;

    case STATE_INVALID_WINDOW:
      throw new Error("Invalid window handle");

    case STATE_INVALID_BUFFER:
      throw new Error("Invalid buffer");

    case STATE_INTERNAL_ERROR:
      throw new Error("Internal error");

    default:
      throw new Error(`Unknown error: ${state}`);
  }
}

export class MfbWindow {
  #handle?: mfb_window;
  #mouseButtonBuffer: Deno.UnsafePointerView;
  #keyBuffer: Deno.UnsafePointerView;

  constructor(title: string, width: number, height: number, flags: number = 0) {
    this.#handle = mfb_open_ex(title, width, height, flags);
    this.#mouseButtonBuffer = mfb_get_mouse_button_buffer(this.#handle!);
    this.#keyBuffer = mfb_get_key_buffer(this.#handle!);
  }

  #assertHandle() {
    if (!this.#handle) {
      throw new Error("Window handle is closed");
    }
  }

  update(buffer: Uint8Array, width: number, height: number) {
    this.#assertHandle();
    return unwrapUpdateState(
      mfb_update_ex(this.#handle!, buffer, width, height),
    );
  }

  updateEvents() {
    this.#assertHandle();
    return unwrapUpdateState(mfb_update_events(this.#handle!));
  }

  setViewport(x: number, y: number, width: number, height: number) {
    this.#assertHandle();
    mfb_set_viewport(this.#handle!, x, y, width, height);
  }

  get monitorScale() {
    this.#assertHandle();
    return mfb_get_monitor_scale(this.#handle!);
  }

  get active() {
    this.#assertHandle();
    return mfb_is_window_active(this.#handle!);
  }

  get width() {
    this.#assertHandle();
    return mfb_get_window_width(this.#handle!);
  }

  get height() {
    this.#assertHandle();
    return mfb_get_window_height(this.#handle!);
  }

  get mouseX() {
    this.#assertHandle();
    return mfb_get_mouse_x(this.#handle!);
  }

  get mouseY() {
    this.#assertHandle();
    return mfb_get_mouse_y(this.#handle!);
  }

  get mouseScrollX() {
    this.#assertHandle();
    return mfb_get_mouse_scroll_x(this.#handle!);
  }

  get mouseScrollY() {
    this.#assertHandle();
    return mfb_get_mouse_scroll_y(this.#handle!);
  }

  getMouseButton(button: number) {
    return Boolean(this.#mouseButtonBuffer.getUint8(button));
  }

  getKey(key: number) {
    return Boolean(this.#keyBuffer.getUint8(key));
  }

  waitSync() {
    this.#assertHandle();
    return mfb_wait_sync(this.#handle!);
  }

  close() {
    this.#assertHandle();
    mfb_close(this.#handle!);
    this.#handle = undefined;
  }
}
