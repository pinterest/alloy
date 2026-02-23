import { Block, Children, Declaration, List, Name } from "@alloy-js/core";
import { Refkey } from "@alloy-js/core";
import { createTypeSymbol } from "../symbols/factories.js";
import { DocWhen } from "./DocComment.js";
import { FieldContext, createFieldRegistry } from "./Field.js";

export interface StructLikeProps {
  name: string;
  refkey?: Refkey;
  children?: Children;
  doc?: Children;
}

function StructLike(props: StructLikeProps & { keyword: string; allowRequired: boolean }) {
  const symbol = createTypeSymbol(props.name, props.refkey);
  const registry = createFieldRegistry({
    allowRequired: props.allowRequired,
    owner: props.keyword,
  });

  return (
    <>
      <DocWhen doc={props.doc} />
      <Declaration symbol={symbol}>
        {props.keyword} <Name />{" "}
        <FieldContext.Provider value={registry}>
          <Block>
            <List hardline>{props.children}</List>
          </Block>
        </FieldContext.Provider>
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
 *   <Field id={1} type="i64" name="id" />
 *   <Field id={2} type="string" name="name" />
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
 * Union fields cannot be `required`.
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
 *   <Field id={1} type="string" name="message" />
 * </Exception>
 * ```
 */
export function Exception(props: ExceptionProps) {
  return <StructLike {...props} keyword="exception" allowRequired />;
}
