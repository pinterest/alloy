import { Children, Declaration, Name, Refkey } from "@alloy-js/core";
import { renderAnnotations, renderTypeRef } from "../render.js";
import { createTypeSymbol } from "../symbols/factories.js";
import type { AnnotationMap, TypeRef } from "../types.js";
import { DocWhen } from "./DocComment.js";

export interface TypedefProps {
  /** The alias name for the type. */
  name: string;
  /** The underlying type being aliased. */
  type: TypeRef;
  /** Optional refkey for cross-file references to this typedef. */
  refkey?: Refkey;
  /** Annotations appended after the typedef. */
  annotations?: AnnotationMap;
  /** Doc comment rendered above the typedef. */
  doc?: Children;
}

/**
 * Define a Thrift type alias.
 *
 * @remarks
 * Useful for giving semantic names to primitive or container types. The
 * typedef creates a type symbol that can be referenced from other files
 * using a refkey.
 *
 * @example Primitive typedef
 * ```tsx
 * <Typedef name="UserId" type={i64} />
 * ```
 *
 * Produces:
 * ```thrift
 * typedef i64 UserId
 * ```
 *
 * @example Container typedef
 * ```tsx
 * <Typedef name="StringList" type={listOf(string)} />
 * ```
 *
 * Produces:
 * ```thrift
 * typedef list<string> StringList
 * ```
 */
export function Typedef(props: TypedefProps) {
  const symbol = createTypeSymbol(props.name, props.refkey);
  const annotations = renderAnnotations(props.annotations);
  const annotationText = annotations ? ` ${annotations}` : "";

  return (
    <>
      <DocWhen doc={props.doc} />
      <Declaration symbol={symbol}>
        typedef {renderTypeRef(props.type)} <Name />
        {annotationText}
      </Declaration>
    </>
  );
}
