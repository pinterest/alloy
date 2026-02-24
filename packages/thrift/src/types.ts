import type { Refkey } from "@alloy-js/core";

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

export interface BuiltinTypeRef {
  kind: "builtin";
  name: BuiltinType;
}

export interface RawAnnotationValue {
  kind: "raw";
  value: string;
}

export type AnnotationValue = string | number | boolean | RawAnnotationValue;
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
  | BuiltinTypeRef
  | Refkey
  | string
  | ListTypeRef
  | SetTypeRef
  | MapTypeRef;

export type ConstValue =
  | RawConstValue
  | ConstRef
  | string
  | number
  | boolean
  | ConstValue[]
  | Map<ConstValue, ConstValue>
  | Array<[ConstValue, ConstValue]>
  | { [key: string]: ConstValue };

export interface ConstRef {
  kind: "const-ref";
  name: string;
}

export interface RawConstValue {
  kind: "raw-const";
  value: string;
}

export function constRef(name: string): ConstRef {
  return { kind: "const-ref", name };
}

export function rawConst(value: string): RawConstValue {
  return { kind: "raw-const", value };
}

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
