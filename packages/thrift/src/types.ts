import type { Refkey } from "@alloy-js/core";

/**
 * String literal union of all Thrift built-in type names.
 *
 * @remarks
 * These correspond to the primitive and special types defined in the
 * {@link https://thrift.apache.org/docs/idl | Thrift IDL specification}.
 * `"byte"` and `"i8"` are aliases for the same 8-bit signed integer type.
 */
export type BuiltinType =
  | "void"
  | "bool"
  | "byte"
  | "i8"
  | "i16"
  | "i32"
  | "i64"
  | "double"
  | "string"
  | "binary";

/**
 * A structured reference to a Thrift built-in type.
 *
 * @remarks
 * Prefer using the builtin constants (`bool`, `i32`, `string`, etc.) exported
 * from `@alloy-js/thrift` rather than constructing this object directly.
 */
export interface BuiltinTypeRef {
  /** Discriminant identifying this as a builtin type reference. */
  kind: "builtin";
  /** The name of the built-in type. */
  name: BuiltinType;
}

/**
 * An annotation value rendered as a raw string without quoting or escaping.
 *
 * @remarks
 * Use {@link rawAnnotation} to construct this. Useful when the annotation value
 * must be an unquoted identifier or expression.
 *
 * @example
 * ```tsx
 * <Struct name="Foo" annotations={{ priority: rawAnnotation("HIGH") }} />
 * ```
 *
 * Produces:
 * ```thrift
 * struct Foo {
 * } (priority = HIGH)
 * ```
 */
export interface RawAnnotationValue {
  /** Discriminant identifying this as a raw annotation value. */
  kind: "raw";
  /** The literal string to emit without quoting. */
  value: string;
}

/**
 * A value that can appear in a Thrift annotation.
 *
 * @remarks
 * Strings are automatically quoted in the output. Numbers and booleans are
 * rendered as literals. Use {@link rawAnnotation} to emit a value without quoting.
 */
export type AnnotationValue = string | number | boolean | RawAnnotationValue;

/**
 * A map of annotation key-value pairs to attach to a Thrift declaration.
 *
 * @remarks
 * Annotations are rendered in sorted key order, enclosed in parentheses after
 * the declaration.
 *
 * @example
 * ```tsx
 * const annotations: AnnotationMap = { deprecated: "Use V2 instead" };
 * <Struct name="UserV1" annotations={annotations}>...</Struct>
 * ```
 *
 * Produces:
 * ```thrift
 * struct UserV1 {
 *   ...
 * } (deprecated = "Use V2 instead")
 * ```
 */
export type AnnotationMap = Record<string, AnnotationValue>;

/**
 * A Thrift `list<T>` container type reference.
 *
 * @remarks
 * Use the {@link listOf} helper to construct this.
 */
export interface ListTypeRef {
  /** Discriminant identifying this as a list type. */
  kind: "list";
  /** The element type of the list. */
  valueType: TypeRef;
  /** Optional annotations on the container type itself. */
  annotations?: AnnotationMap;
}

/**
 * A Thrift `set<T>` container type reference.
 *
 * @remarks
 * Use the {@link setOf} helper to construct this.
 */
export interface SetTypeRef {
  /** Discriminant identifying this as a set type. */
  kind: "set";
  /** The element type of the set. */
  valueType: TypeRef;
  /** Optional annotations on the container type itself. */
  annotations?: AnnotationMap;
}

/**
 * A Thrift `map<K, V>` container type reference.
 *
 * @remarks
 * Use the {@link mapOf} helper to construct this.
 */
export interface MapTypeRef {
  /** Discriminant identifying this as a map type. */
  kind: "map";
  /** The key type of the map. */
  keyType: TypeRef;
  /** The value type of the map. */
  valueType: TypeRef;
  /** Optional annotations on the container type itself. */
  annotations?: AnnotationMap;
}

/**
 * A reference to any Thrift type.
 *
 * @remarks
 * `TypeRef` is the primary way to specify types throughout the package.
 * It accepts several forms:
 *
 * - A {@link BuiltinType} string like `"i32"` or `"string"`
 * - A {@link BuiltinTypeRef} object (e.g. the exported `i32` constant)
 * - A `Refkey` (from `@alloy-js/core`) for cross-file symbol references
 * - A plain string for unresolved or literal type names
 * - A container type ({@link ListTypeRef}, {@link SetTypeRef}, {@link MapTypeRef})
 *   created via {@link listOf}, {@link setOf}, or {@link mapOf}
 *
 * @example Using builtin constants
 * ```tsx
 * <Field id={1} type={i64} name="id" />
 * ```
 *
 * @example Using container helpers
 * ```tsx
 * <Field id={2} type={listOf(string)} name="tags" />
 * <Field id={3} type={mapOf(string, i32)} name="scores" />
 * ```
 */
export type TypeRef =
  | BuiltinType
  | BuiltinTypeRef
  | Refkey
  | string
  | ListTypeRef
  | SetTypeRef
  | MapTypeRef;

/**
 * A constant value in a Thrift `const` declaration or field default.
 *
 * @remarks
 * Accepts JavaScript primitives (`string`, `number`, `boolean`), arrays
 * (rendered as Thrift lists), `Map` instances or {@link mapEntries} tuples
 * (rendered as Thrift maps), plain objects (rendered as Thrift maps with string
 * keys), {@link ConstRef} for referencing other constants, or
 * {@link RawConstValue} for unescaped literals.
 *
 * @example Scalar value
 * ```tsx
 * <Const name="MaxRetries" type={i32} value={3} />
 * ```
 *
 * @example List value
 * ```tsx
 * <Const name="DefaultTags" type={listOf(string)} value={["a", "b"]} />
 * ```
 *
 * @example Map value
 * ```tsx
 * <Const name="Defaults" type={mapOf(string, i32)}
 *   value={mapEntries([["timeout", 30], ["retries", 3]])} />
 * ```
 */
export type ConstValue =
  | RawConstValue
  | ConstRef
  | ConstMapEntries
  | string
  | number
  | boolean
  | ConstValue[]
  | Map<ConstValue, ConstValue>
  | { [key: string]: ConstValue };

/**
 * A reference to another Thrift constant by name.
 *
 * @remarks
 * Use {@link constRef} to construct this. The name is emitted as-is in the
 * output, allowing references to constants defined elsewhere.
 *
 * @example
 * ```tsx
 * <Const name="DefaultTimeout" type={i32} value={constRef("Defaults.TIMEOUT")} />
 * ```
 *
 * Produces:
 * ```thrift
 * const i32 DefaultTimeout = Defaults.TIMEOUT
 * ```
 */
export interface ConstRef {
  /** Discriminant identifying this as a constant reference. */
  kind: "const-ref";
  /** The fully-qualified or simple name of the referenced constant. */
  name: string;
}

/**
 * A constant value rendered as a raw string without quoting or escaping.
 *
 * @remarks
 * Use {@link rawConst} to construct this. Useful when the value must be a
 * literal expression that should not be quoted.
 */
export interface RawConstValue {
  /** Discriminant identifying this as a raw constant value. */
  kind: "raw-const";
  /** The literal string to emit without quoting. */
  value: string;
}

/**
 * Create a {@link ConstRef} that references another constant by name.
 *
 * @param name - The name of the constant to reference (e.g. `"shared.MAX_SIZE"`).
 * @returns A `ConstRef` object.
 *
 * @example
 * ```tsx
 * <Const name="Limit" type={i32} value={constRef("shared.MAX_SIZE")} />
 * ```
 */
export function constRef(name: string): ConstRef {
  return { kind: "const-ref", name };
}

/**
 * Create a {@link RawConstValue} that is emitted without quoting or escaping.
 *
 * @param value - The raw string to emit.
 * @returns A `RawConstValue` object.
 *
 * @example
 * ```tsx
 * <Const name="Mask" type={i32} value={rawConst("0xFF")} />
 * ```
 *
 * Produces:
 * ```thrift
 * const i32 Mask = 0xFF
 * ```
 */
export function rawConst(value: string): RawConstValue {
  return { kind: "raw-const", value };
}

/**
 * A list of key-value tuples rendered as a Thrift map literal.
 *
 * @remarks
 * Use {@link mapEntries} to construct this. Prefer this over bare
 * `[key, value]` arrays so that lists of two-element lists are not
 * ambiguous with map entries.
 */
export interface ConstMapEntries {
  /** Discriminant identifying this as map entries. */
  kind: "map-entries";
  /** The key-value pairs for the map. */
  entries: [ConstValue, ConstValue][];
}

/**
 * Create a {@link ConstMapEntries} value from key-value tuples.
 *
 * @param entries - An array of `[key, value]` pairs.
 * @returns A `ConstMapEntries` object.
 *
 * @example
 * ```tsx
 * <Const name="Defaults" type={mapOf(string, i32)}
 *   value={mapEntries([["timeout", 30], ["retries", 3]])} />
 * ```
 *
 * Produces:
 * ```thrift
 * const map<string, i32> Defaults = { "timeout" : 30 , "retries" : 3 }
 * ```
 */
export function mapEntries(
  entries: [ConstValue, ConstValue][],
): ConstMapEntries {
  return { kind: "map-entries", entries };
}

/**
 * Create a {@link RawAnnotationValue} that is emitted without quoting.
 *
 * @param value - The raw string to emit as the annotation value.
 * @returns A `RawAnnotationValue` object.
 *
 * @example
 * ```tsx
 * <Struct name="Foo" annotations={{ priority: rawAnnotation("HIGH") }} />
 * ```
 *
 * Produces `(priority = HIGH)` rather than `(priority = "HIGH")`.
 */
export function rawAnnotation(value: string): RawAnnotationValue {
  return { kind: "raw", value };
}

const BUILTIN_TYPES = new Set<BuiltinType>([
  "void",
  "bool",
  "byte",
  "i8",
  "i16",
  "i32",
  "i64",
  "double",
  "string",
  "binary",
]);

/**
 * Check whether a value is a Thrift built-in type.
 *
 * @remarks
 * Accepts both string literals (e.g. `"i32"`) and structured
 * {@link BuiltinTypeRef} objects.
 *
 * @param value - The value to check.
 * @returns `true` if the value represents a built-in Thrift type.
 */
export function isBuiltinType(
  value: unknown,
): value is BuiltinType | BuiltinTypeRef {
  if (typeof value === "string") {
    return BUILTIN_TYPES.has(value as BuiltinType);
  }
  if (typeof value === "object" && value) {
    if ((value as BuiltinTypeRef).kind !== "builtin") {
      return false;
    }
    return BUILTIN_TYPES.has((value as BuiltinTypeRef).name);
  }
  return false;
}

/**
 * Create a Thrift `list<T>` type reference.
 *
 * @param valueType - The element type.
 * @param annotations - Optional annotations on the container type.
 * @returns A {@link ListTypeRef}.
 *
 * @example
 * ```tsx
 * <Field id={1} type={listOf(string)} name="tags" />
 * ```
 *
 * Produces:
 * ```thrift
 * 1: list<string> tags,
 * ```
 */
export function listOf(
  valueType: TypeRef,
  annotations?: AnnotationMap,
): ListTypeRef {
  return { kind: "list", valueType, annotations };
}

/**
 * Create a Thrift `set<T>` type reference.
 *
 * @param valueType - The element type.
 * @param annotations - Optional annotations on the container type.
 * @returns A {@link SetTypeRef}.
 *
 * @example
 * ```tsx
 * <Field id={1} type={setOf(i64)} name="userIds" />
 * ```
 *
 * Produces:
 * ```thrift
 * 1: set<i64> userIds,
 * ```
 */
export function setOf(
  valueType: TypeRef,
  annotations?: AnnotationMap,
): SetTypeRef {
  return { kind: "set", valueType, annotations };
}

/**
 * Create a Thrift `map<K, V>` type reference.
 *
 * @param keyType - The key type.
 * @param valueType - The value type.
 * @param annotations - Optional annotations on the container type.
 * @returns A {@link MapTypeRef}.
 *
 * @example
 * ```tsx
 * <Field id={1} type={mapOf(string, i64)} name="scores" />
 * ```
 *
 * Produces:
 * ```thrift
 * 1: map<string, i64> scores,
 * ```
 */
export function mapOf(
  keyType: TypeRef,
  valueType: TypeRef,
  annotations?: AnnotationMap,
): MapTypeRef {
  return { kind: "map", keyType, valueType, annotations };
}
