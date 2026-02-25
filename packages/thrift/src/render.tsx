import { Children, isRefkey } from "@alloy-js/core";
import { Reference } from "./components/Reference.js";
import type {
  AnnotationMap,
  AnnotationValue,
  ConstRef,
  ConstValue,
  MapTypeRef,
  RawAnnotationValue,
  RawConstValue,
  SetTypeRef,
  TypeRef,
} from "./types.js";
import { isBuiltinType } from "./types.js";

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

  const annotations = renderAnnotations((type as MapTypeRef).annotations);
  return (
    <>
      {"map<"}
      {renderTypeRef(type.keyType)}
      {", "}
      {renderTypeRef(type.valueType)}
      {">"}
      {annotations ? annotations : ""}
    </>
  );
}

export function renderConstValue(value: ConstValue): Children {
  return formatConstValue(value);
}

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
  if (Array.isArray(value)) {
    if (isConstMapEntries(value)) {
      const entries = value
        .map(([k, v]) => `${formatConstValue(k)} : ${formatConstValue(v)}`)
        .join(" , ");
      return `{ ${entries} }`;
    }

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

function isConstMapEntries(
  value: ConstValue[],
): value is Array<[ConstValue, ConstValue]> {
  return value.every(
    (entry) =>
      Array.isArray(entry) &&
      entry.length === 2 &&
      entry.every((item) => typeof item !== "undefined"),
  );
}

function escapeString(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export function isContainerType(
  type: TypeRef,
): type is SetTypeRef | MapTypeRef {
  return typeof type === "object" && !isRefkey(type) && !isBuiltinType(type);
}
