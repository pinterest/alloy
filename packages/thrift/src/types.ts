import type { Refkey } from "@alloy-js/core";

export type BuiltinType =
  | "void"
  | "bool"
  | "byte"
  | "i16"
  | "i32"
  | "i64"
  | "double"
  | "string"
  | "binary";

export type AnnotationValue = string | number | boolean;
export type AnnotationMap = Record<string, AnnotationValue>;

export interface ListTypeRef {
  kind: "list";
  valueType: TypeRef;
  annotations?: AnnotationMap;
}

export interface SetTypeRef {
  kind: "set";
  valueType: TypeRef;
  annotations?: AnnotationMap;
}

export interface MapTypeRef {
  kind: "map";
  keyType: TypeRef;
  valueType: TypeRef;
  annotations?: AnnotationMap;
}

export type TypeRef =
  | BuiltinType
  | Refkey
  | string
  | ListTypeRef
  | SetTypeRef
  | MapTypeRef;

export type ConstValue =
  | string
  | number
  | boolean
  | ConstValue[]
  | Map<ConstValue, ConstValue>
  | Array<[ConstValue, ConstValue]>
  | { [key: string]: ConstValue };

const BUILTIN_TYPES = new Set<BuiltinType>([
  "void",
  "bool",
  "byte",
  "i16",
  "i32",
  "i64",
  "double",
  "string",
  "binary",
]);

export function isBuiltinType(value: unknown): value is BuiltinType {
  return typeof value === "string" && BUILTIN_TYPES.has(value as BuiltinType);
}

export function listOf(
  valueType: TypeRef,
  annotations?: AnnotationMap,
): ListTypeRef {
  return { kind: "list", valueType, annotations };
}

export function setOf(
  valueType: TypeRef,
  annotations?: AnnotationMap,
): SetTypeRef {
  return { kind: "set", valueType, annotations };
}

export function mapOf(
  keyType: TypeRef,
  valueType: TypeRef,
  annotations?: AnnotationMap,
): MapTypeRef {
  return { kind: "map", keyType, valueType, annotations };
}
