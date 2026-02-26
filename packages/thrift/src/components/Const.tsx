import { Children, Declaration, Name, Refkey } from "@alloy-js/core";
import {
  renderAnnotations,
  renderConstValue,
  renderTypeRef,
} from "../render.js";
import { createConstSymbol } from "../symbols/factories.js";
import type { AnnotationMap, ConstValue, TypeRef } from "../types.js";
import { DocWhen } from "./DocComment.js";

export interface ConstProps {
  /** The constant name. */
  name: string;
  /** The Thrift type of the constant. */
  type: TypeRef;
  /**
   * The constant's value.
   *
   * @remarks
   * Accepts JavaScript primitives, arrays (Thrift lists), maps, objects,
   * {@link constRef} references, or {@link rawConst} for unescaped literals.
   */
  value: ConstValue;
  /** Optional refkey for cross-file references to this constant. */
  refkey?: Refkey;
  /** Annotations appended after the constant declaration. */
  annotations?: AnnotationMap;
  /** Doc comment rendered above the constant. */
  doc?: Children;
}

/**
 * Define a Thrift constant.
 *
 * @remarks
 * Values can be literals, lists, maps, or references to other constants.
 * Use the {@link constRef} and {@link rawConst} helpers for special value
 * forms.
 *
 * @example Scalar constant
 * ```tsx
 * <Const name="DefaultPageSize" type={i32} value={50} />
 * ```
 *
 * Produces:
 * ```thrift
 * const i32 DefaultPageSize = 50
 * ```
 *
 * @example List constant
 * ```tsx
 * <Const name="SupportedLangs" type={listOf(string)}
 *   value={["en", "fr", "de"]} />
 * ```
 *
 * Produces:
 * ```thrift
 * const list<string> SupportedLangs = [ "en" , "fr" , "de" ]
 * ```
 */
export function Const(props: ConstProps) {
  const symbol = createConstSymbol(props.name, props.refkey);
  const annotations = renderAnnotations(props.annotations);
  const annotationText = annotations ? ` ${annotations}` : "";

  return (
    <>
      <DocWhen doc={props.doc} />
      <Declaration symbol={symbol}>
        const {renderTypeRef(props.type)} <Name /> ={" "}
        {renderConstValue(props.value)}
        {annotationText}
      </Declaration>
    </>
  );
}
