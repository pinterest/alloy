import {
  Block,
  Children,
  Declaration,
  List,
  Name,
  Refkey,
  childrenArray,
} from "@alloy-js/core";
import { renderAnnotations } from "../render.js";
import { createTypeSymbol } from "../symbols/factories.js";
import type { AnnotationMap } from "../types.js";
import { DocWhen } from "./DocComment.js";
import { FieldContext, createFieldRegistry } from "./Field.js";

/**
 * Common props shared by {@link Struct}, {@link Union}, and {@link Exception}.
 */
export interface StructLikeProps {
  /** The name of the declaration. */
  name: string;
  /** Optional refkey for cross-file references to this type. */
  refkey?: Refkey;
  /** {@link Field} children defining the members of this declaration. */
  children?: Children;
  /** Doc comment rendered above the declaration. */
  doc?: Children;
  /** Annotations appended after the closing brace. */
  annotations?: AnnotationMap;
}

function StructLike(
  props: StructLikeProps & { keyword: string; allowRequired: boolean },
) {
  const symbol = createTypeSymbol(props.name, props.refkey);
  const registry = createFieldRegistry({
    allowRequired: props.allowRequired,
    owner: props.keyword,
    terminator: ",",
  });
  const annotations = renderAnnotations(props.annotations);
  const annotationText = annotations ? ` ${annotations}` : "";
  const fields = childrenArray(() => props.children, {
    preserveFragments: true,
  });
  const hasFields = fields.length > 0;

  return (
    <>
      <DocWhen doc={props.doc} />
      <Declaration symbol={symbol}>
        {props.keyword} <Name />{" "}
        <FieldContext.Provider value={registry}>
          {hasFields ?
            <Block>
              <List hardline>{fields}</List>
            </Block>
          : <group>
              {"{"}
              <hbr />
              {"}"}
            </group>
          }
        </FieldContext.Provider>
        {annotationText}
      </Declaration>
    </>
  );
}

export interface StructProps extends StructLikeProps {}
export interface UnionProps extends StructLikeProps {}
export interface ExceptionProps extends StructLikeProps {}

/**
 * Define a Thrift struct.
 *
 * @remarks
 * Struct fields may be `required`, `optional`, or left unspecified (default
 * requiredness). Field IDs must be unique within the struct and fall within
 * the signed 16-bit integer range (-32768 to 32767).
 *
 * @example Struct with fields
 * ```tsx
 * <Struct name="User">
 *   <Field id={1} type={i64} name="id" required />
 *   <Field id={2} type={string} name="name" />
 * </Struct>
 * ```
 *
 * Produces:
 * ```thrift
 * struct User {
 *   1: required i64 id,
 *   2: string name,
 * }
 * ```
 */
export function Struct(props: StructProps) {
  return <StructLike {...props} keyword="struct" allowRequired />;
}

/**
 * Define a Thrift union.
 *
 * @remarks
 * A union represents a value that is exactly one of its fields at a time.
 * Union fields cannot be marked `required` — doing so throws an error.
 * Fields may be `optional` or left unspecified.
 *
 * @example Union
 * ```tsx
 * <Union name="SearchResult">
 *   <Field id={1} type="User" name="user" />
 *   <Field id={2} type="Group" name="group" />
 * </Union>
 * ```
 *
 * Produces:
 * ```thrift
 * union SearchResult {
 *   1: User user,
 *   2: Group group,
 * }
 * ```
 */
export function Union(props: UnionProps) {
  return <StructLike {...props} keyword="union" allowRequired={false} />;
}

/**
 * Define a Thrift exception.
 *
 * @remarks
 * Exceptions are declared like structs and can be referenced in
 * {@link Throws} clauses of service functions. Fields follow the same
 * rules as struct fields (required, optional, or default requiredness).
 *
 * @example Exception
 * ```tsx
 * <Exception name="NotFound">
 *   <Field id={1} type={string} name="message" />
 * </Exception>
 * ```
 *
 * Produces:
 * ```thrift
 * exception NotFound {
 *   1: string message,
 * }
 * ```
 */
export function Exception(props: ExceptionProps) {
  return <StructLike {...props} keyword="exception" allowRequired />;
}
