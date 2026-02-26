import { Children, isRefkey } from "@alloy-js/core";
import { Reference } from "./components/Reference.js";
import type {
  AnnotationMap,
  AnnotationValue,
  ConstMapEntries,
  ConstRef,
  ConstValue,
  ListTypeRef,
  MapTypeRef,
  RawAnnotationValue,
  RawConstValue,
  SetTypeRef,
  TypeRef,
} from "./types.js";
import { isBuiltinType } from "./types.js";

/**
 * Render a {@link TypeRef} to its Thrift IDL string representation.
 *
 * @remarks
 * Handles all `TypeRef` variants: builtin types are emitted by name, refkeys
 * are resolved via {@link Reference} (adding includes as needed), plain strings
 * are emitted verbatim, and container types are rendered recursively
 * (e.g. `list<string>`, `map<string, i32>`).
 *
 * @param type - The type reference to render.
 * @returns The rendered Thrift type expression as component children.
 */
export function renderTypeRef(type: TypeRef): Children {
  if (isRefkey(type)) {
    return <Reference refkey={type} />;
  }

  if (isBuiltinType(type)) {
    return typeof type === "string" ? type : type.name;
  }

  if (typeof type === "string") {
    return type;
  }

  if (type.kind === "list") {
    const annotations = renderAnnotations(type.annotations);
    return (
      <>
        {"list<"}
        {renderTypeRef(type.valueType)}
        {">"}
        {annotations ? ` ${annotations}` : ""}
      </>
    );
  }

  if (type.kind === "set") {
    const annotations = renderAnnotations(type.annotations);
    return (
      <>
        {"set<"}
        {renderTypeRef(type.valueType)}
        {">"}
        {annotations ? ` ${annotations}` : ""}
      </>
    );
  }

  if (type.kind === "map") {
    const annotations = renderAnnotations(type.annotations);
    return (
      <>
        {"map<"}
        {renderTypeRef(type.keyType)}
        {", "}
        {renderTypeRef(type.valueType)}
        {">"}
        {annotations ? ` ${annotations}` : ""}
      </>
    );
  }

  throw new Error(`Unknown TypeRef kind: ${(type as { kind: string }).kind}`);
}

/**
 * Render a {@link ConstValue} to its Thrift IDL literal representation.
 *
 * @remarks
 * Strings are quoted and escaped. Numbers and booleans are emitted as literals.
 * Arrays are rendered as Thrift list literals (`[...]`), maps and objects as
 * Thrift map literals (`{...}`), and {@link ConstRef} values are emitted by
 * name.
 *
 * @param value - The constant value to render.
 * @returns The rendered Thrift constant expression.
 */
export function renderConstValue(value: ConstValue): Children {
  return formatConstValue(value);
}

/**
 * Render an {@link AnnotationMap} to its Thrift IDL parenthesized form.
 *
 * @remarks
 * Entries are sorted alphabetically by key and formatted as
 * `(key1 = value1, key2 = value2)`. Returns an empty string when the map
 * is `undefined` or empty.
 *
 * @param annotations - The annotation map to render.
 * @returns A formatted annotation string, or `""` if there are no annotations.
 */
export function renderAnnotations(annotations?: AnnotationMap): string {
  if (!annotations || Object.keys(annotations).length === 0) {
    return "";
  }

  const entries = Object.entries(annotations).sort(([a], [b]) =>
    a.localeCompare(b),
  );
  const rendered = entries
    .map(([key, value]) => `${key} = ${formatAnnotationValue(value)}`)
    .join(", ");

  return `(${rendered})`;
}

function formatAnnotationValue(value: AnnotationValue): string {
  if (isRawAnnotationValue(value)) {
    return value.value;
  }
  if (typeof value === "string") {
    return `"${escapeString(value)}"`;
  }
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }
  return String(value);
}

function formatConstValue(value: ConstValue): string {
  if (isConstRef(value)) {
    return value.name;
  }
  if (isRawConstValue(value)) {
    return value.value;
  }
  if (typeof value === "string") {
    return `"${escapeString(value)}"`;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (isConstMapEntries(value)) {
    const entries = value.entries
      .map(([k, v]) => `${formatConstValue(k)} : ${formatConstValue(v)}`)
      .join(" , ");
    return `{ ${entries} }`;
  }
  if (Array.isArray(value)) {
    const items = value.map((item) => formatConstValue(item)).join(" , ");
    return `[ ${items} ]`;
  }
  if (value instanceof Map) {
    const entries = Array.from(value.entries())
      .map(([k, v]) => `${formatConstValue(k)} : ${formatConstValue(v)}`)
      .join(" , ");
    return `{ ${entries} }`;
  }
  if (typeof value === "object" && value) {
    const entries = Object.entries(value)
      .map(([k, v]) => `${formatConstValue(k)} : ${formatConstValue(v)}`)
      .join(" , ");
    return `{ ${entries} }`;
  }

  return String(value);
}

function isConstRef(value: ConstValue): value is ConstRef {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as ConstRef).kind === "const-ref"
  );
}

function isRawAnnotationValue(
  value: AnnotationValue,
): value is RawAnnotationValue {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as RawAnnotationValue).kind === "raw"
  );
}

function isRawConstValue(value: ConstValue): value is RawConstValue {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as RawConstValue).kind === "raw-const"
  );
}

function isConstMapEntries(value: ConstValue): value is ConstMapEntries {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as ConstMapEntries).kind === "map-entries"
  );
}

function escapeString(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t");
}

/**
 * Check whether a {@link TypeRef} is a container type (`list`, `set`, or `map`).
 *
 * @param type - The type reference to check.
 * @returns `true` if the type is a {@link ListTypeRef}, {@link SetTypeRef}, or
 *   {@link MapTypeRef}.
 */
export function isContainerType(
  type: TypeRef,
): type is ListTypeRef | SetTypeRef | MapTypeRef {
  return typeof type === "object" && !isRefkey(type) && !isBuiltinType(type);
}
