import type { BuiltinType, BuiltinTypeRef } from "../types.js";

function createBuiltin(name: BuiltinType): BuiltinTypeRef {
  return { kind: "builtin", name };
}

// NOTE: the `void` builtin is intentionally named `thriftVoid` to avoid
// shadowing the TypeScript `void` keyword.

/**
 * A Thrift `void` — indicates no return value.
 *
 * @remarks
 * Named `thriftVoid` to avoid colliding with TypeScript's `void` keyword.
 * Primarily used as a service function return type.
 *
 * @example
 * ```tsx
 * <ServiceFunction name="ping" returnType={thriftVoid} />
 * ```
 */
export const thriftVoid = createBuiltin("void");

/**
 * A Thrift `bool` — a boolean value (true or false).
 *
 * @example
 * ```tsx
 * <Field id={1} type={bool} name="active" />
 * ```
 */
export const bool = createBuiltin("bool");

/**
 * A Thrift `byte` — an 8-bit signed integer.
 *
 * @remarks
 * Alias for {@link i8}. Both emit the same type.
 *
 * @example
 * ```tsx
 * <Field id={1} type={byte} name="flags" />
 * ```
 */
export const byte = createBuiltin("byte");

/**
 * A Thrift `i8` — an 8-bit signed integer.
 *
 * @remarks
 * Alias for {@link byte}. Both emit the same type.
 *
 * @example
 * ```tsx
 * <Field id={1} type={i8} name="flags" />
 * ```
 */
export const i8 = createBuiltin("i8");

/**
 * A Thrift `i16` — a 16-bit signed integer.
 *
 * @example
 * ```tsx
 * <Field id={1} type={i16} name="port" />
 * ```
 */
export const i16 = createBuiltin("i16");

/**
 * A Thrift `i32` — a 32-bit signed integer.
 *
 * @example
 * ```tsx
 * <Field id={1} type={i32} name="count" />
 * ```
 */
export const i32 = createBuiltin("i32");

/**
 * A Thrift `i64` — a 64-bit signed integer.
 *
 * @example
 * ```tsx
 * <Field id={1} type={i64} name="timestamp" />
 * ```
 */
export const i64 = createBuiltin("i64");

/**
 * A Thrift `double` — a 64-bit IEEE 754 floating point number.
 *
 * @example
 * ```tsx
 * <Field id={1} type={double} name="latitude" />
 * ```
 */
export const double = createBuiltin("double");

/**
 * A Thrift `string` — a UTF-8 encoded text string.
 *
 * @example
 * ```tsx
 * <Field id={1} type={string} name="email" />
 * ```
 */
export const string = createBuiltin("string");

/**
 * A Thrift `binary` — a sequence of arbitrary unencoded bytes.
 *
 * @example
 * ```tsx
 * <Field id={1} type={binary} name="payload" />
 * ```
 */
export const binary = createBuiltin("binary");
