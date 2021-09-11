import { assertEquals } from "https://deno.land/std@0.106.0/testing/asserts.ts"
import Window from './mod.ts'

Deno.test("has tests", () => {
  assertEquals(true, !false)
})

Deno.test("has correct shape", () => {
  assertEquals(typeof Window, 'class')
})

