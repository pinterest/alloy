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

export interface StructLikeProps {
  name: string;
  refkey?: Refkey;
  children?: Children;
  doc?: Children;
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
 * Struct fields may be `required`, `optional`, or unspecified.
 *
 * @example Struct
 * ```tsx
 * <Struct name="User">
 *   <Field id={1} type={i64} name="id" />
 *   <Field id={2} type={string} name="name" />
 * </Struct>
 * ```
 */
export function Struct(props: StructProps) {
  return <StructLike {...props} keyword="struct" allowRequired />;
}

/**
 * Define a Thrift union.
 *
 * @remarks
 * Union fields are typically optional; some IDLs still mark them as `required`.
 *
 * @example Union
 * ```tsx
 * <Union name="SearchResult">
 *   <Field id={1} type="User" name="user" />
 *   <Field id={2} type="Group" name="group" />
 * </Union>
 * ```
 */
export function Union(props: UnionProps) {
  return <StructLike {...props} keyword="union" allowRequired={false} />;
}

/**
 * Define a Thrift exception.
 *
 * @remarks
 * Exceptions are declared like structs and can be used in `Throws` clauses.
 *
 * @example Exception
 * ```tsx
 * <Exception name="NotFound">
 *   <Field id={1} type={string} name="message" />
 * </Exception>
 * ```
 */
export function Exception(props: ExceptionProps) {
  return <StructLike {...props} keyword="exception" allowRequired />;
}
