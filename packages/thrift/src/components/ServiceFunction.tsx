import {
  Children,
  List,
  childrenArray,
  isComponentCreator,
} from "@alloy-js/core";
import { useThriftNamePolicy } from "../name-policy.js";
import { renderAnnotations, renderTypeRef } from "../render.js";
import type { AnnotationMap, TypeRef } from "../types.js";
import { DocWhen } from "./DocComment.js";
import { FieldContext, createFieldRegistry } from "./Field.js";

export interface ServiceFunctionProps {
  /** The function name. */
  name: string;
  /**
   * The return type of the function.
   *
   * @remarks
   * Defaults to `"void"` when omitted. Must be `"void"` for oneway functions.
   */
  returnType?: TypeRef;
  /**
   * Mark this function as oneway (fire-and-forget).
   *
   * @remarks
   * Oneway functions must return `void` and cannot have a throws clause.
   */
  oneway?: boolean;
  /** Annotations appended after the function signature. */
  annotations?: AnnotationMap;
  /**
   * {@link Field} children defining the function parameters.
   *
   * @remarks
   * A {@link Throws} component may also appear among the children to define
   * the exception list.
   */
  children?: Children;
  /** Doc comment rendered above the function. */
  doc?: Children;
  /**
   * When true, render each parameter on its own line with indentation,
   * and place the throws clause on a separate line.
   *
   * @remarks
   * Useful for functions with many parameters that would otherwise produce
   * very long lines.
   */
  breakParams?: boolean;
}

export interface ThrowsProps {
  /** {@link Field} children defining the exception fields. */
  children?: Children;
}

/**
 * Define a Thrift service function (method).
 *
 * @remarks
 * Parameters are defined as {@link Field} children. Exceptions can be declared
 * via a {@link Throws} child component.
 *
 * Oneway functions must return `void` — specifying a non-void return type
 * with `oneway` throws an error.
 *
 * @example Simple function
 * ```tsx
 * <ServiceFunction name="ping" />
 * ```
 *
 * Produces:
 * ```thrift
 * void ping(),
 * ```
 *
 * @example Function with parameters and throws
 * ```tsx
 * <ServiceFunction name="getUser" returnType="User">
 *   <Field id={1} type={i64} name="id" />
 *   <Throws>
 *     <Field id={1} type="NotFound" name="notFound" />
 *   </Throws>
 * </ServiceFunction>
 * ```
 *
 * Produces:
 * ```thrift
 * User getUser(1: i64 id) throws (1: NotFound notFound),
 * ```
 */
export function ServiceFunction(props: ServiceFunctionProps) {
  const name = useThriftNamePolicy().getName(props.name, "function");
  const returnType = props.returnType ?? "void";

  if (props.oneway && returnType !== "void") {
    throw new Error("Oneway functions must return void.");
  }

  const { params, throws } = splitFunctionChildren(props.children);
  const paramRegistry = createFieldRegistry({
    allowRequired: true,
    owner: `function ${name}`,
    terminator: "",
  });
  const throwsRegistry = createFieldRegistry({
    allowRequired: true,
    owner: `throws ${name}`,
    terminator: "",
  });

  const annotations = renderAnnotations(props.annotations);
  const annotationText = annotations ? ` ${annotations}` : "";

  const throwsClause =
    throws ?
      <FieldContext.Provider value={throwsRegistry}>
        <Throws>{throws}</Throws>
      </FieldContext.Provider>
    : null;

  if (props.breakParams) {
    return (
      <>
        <DocWhen doc={props.doc} />
        <align
          prefix={
            <>
              {props.oneway ? "oneway " : ""}
              {renderTypeRef(returnType)}{" "}
            </>
          }
        >
          <align prefix={<>{name}(</>}>
            <FieldContext.Provider value={paramRegistry}>
              <List comma hardline>
                {params}
              </List>
            </FieldContext.Provider>
          </align>
          )
          {throwsClause ?
            <>
              <hbr />
              {throwsClause}
            </>
          : null}
        </align>
        {annotationText},
      </>
    );
  }

  return (
    <>
      <DocWhen doc={props.doc} />
      <group>
        {props.oneway ? "oneway " : ""}
        {renderTypeRef(returnType)} {name}(
        <FieldContext.Provider value={paramRegistry}>
          <List comma space>
            {params}
          </List>
        </FieldContext.Provider>
        ){throws ? " " : ""}
        {throwsClause}
        {annotationText},
      </group>
    </>
  );
}

/**
 * Define the `throws` clause for a service function.
 *
 * @remarks
 * Place this component inside a {@link ServiceFunction} to declare the
 * exceptions that the function may throw. Each exception is defined as a
 * {@link Field} child.
 *
 * @example Throws clause
 * ```tsx
 * <ServiceFunction name="deleteUser" returnType="void">
 *   <Field id={1} type={i64} name="id" />
 *   <Throws>
 *     <Field id={1} type="NotFound" name="notFound" />
 *     <Field id={2} type="PermissionDenied" name="denied" />
 *   </Throws>
 * </ServiceFunction>
 * ```
 *
 * Produces:
 * ```thrift
 * void deleteUser(1: i64 id) throws (1: NotFound notFound, 2: PermissionDenied denied),
 * ```
 */
export function Throws(props: ThrowsProps) {
  const entries = childrenArray(() => props.children, {
    preserveFragments: true,
  });
  return (
    <group>
      throws (
      <List comma space>
        {entries}
      </List>
      )
    </group>
  );
}

function splitFunctionChildren(children?: Children): {
  params: Children[];
  throws?: Children;
} {
  const params: Children[] = [];
  let throws: Children | undefined;

  if (children) {
    const arr = childrenArray(() => children, { preserveFragments: true });
    for (const child of arr) {
      if (isComponentCreator(child) && child.component === Throws) {
        throws = child.props?.children as Children;
      } else {
        params.push(child);
      }
    }
  }

  return { params, throws };
}
