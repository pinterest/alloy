import type { BuiltinType, BuiltinTypeRef } from "../types.js";

function createBuiltin(name: BuiltinType): BuiltinTypeRef {
  return { kind: "builtin", name };
}

/** A boolean value (true or false) */
export const bool = createBuiltin("bool");

/** An 8-bit signed integer */
export const byte = createBuiltin("byte");

/** An 8-bit signed integer */
export const i8 = createBuiltin("i8");

/** A 16-bit signed integer */
export const i16 = createBuiltin("i16");

/** A 32-bit signed integer */
export const i32 = createBuiltin("i32");

/** A 64-bit signed integer */
export const i64 = createBuiltin("i64");

/** A 64-bit floating point number */
export const double = createBuiltin("double");

/** A text string encoded using UTF-8 encoding */
export const string = createBuiltin("string");

/** A sequence of arbitrary bytes */
export const binary = createBuiltin("binary");
