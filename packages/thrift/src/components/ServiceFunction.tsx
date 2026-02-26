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
  name: string;
  returnType?: TypeRef;
  oneway?: boolean;
  annotations?: AnnotationMap;
  children?: Children;
  throws?: Children;
  doc?: Children;
  /**
   * When true, render each parameter on its own line with indentation,
   * and place the throws clause on a separate line.
   */
  breakParams?: boolean;
}

export interface ThrowsProps {
  children?: Children;
}

/**
 * Define a Thrift service function (method).
 *
 * @remarks
 * Oneway functions must return `void`. Add exceptions using the `Throws` child
 * component or the `throws` prop.
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
 */
export function ServiceFunction(props: ServiceFunctionProps) {
  const name = useThriftNamePolicy().getName(props.name, "function");
  const returnType = props.returnType ?? "void";

  if (props.oneway && returnType !== "void") {
    throw new Error("Oneway functions must return void.");
  }

  const { params, throws } = splitFunctionChildren(
    props.children,
    props.throws,
  );
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
 * Use this component inside {@link ServiceFunction} to declare exceptions.
 *
 * @example Throws clause
 * ```tsx
 * <Throws>
 *   <Field id={1} type="NotFound" name="notFound" />
 * </Throws>
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

function splitFunctionChildren(
  children?: Children,
  throwsProp?: Children,
): {
  params: Children[];
  throws?: Children;
} {
  const params: Children[] = [];
  let throws: Children | undefined = throwsProp;

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
