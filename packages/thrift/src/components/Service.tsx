import {
  Block,
  Children,
  Declaration,
  List,
  Name,
  Refkey,
  childrenArray,
  isComponentCreator,
} from "@alloy-js/core";
import { useThriftNamePolicy } from "../name-policy.js";
import { renderAnnotations, renderTypeRef } from "../render.js";
import { createServiceSymbol } from "../symbols/factories.js";
import type { AnnotationMap, TypeRef } from "../types.js";
import { DocWhen } from "./DocComment.js";
import { FieldContext, createFieldRegistry } from "./Field.js";

export interface ServiceProps {
  name: string;
  refkey?: Refkey;
  extends?: TypeRef;
  annotations?: AnnotationMap;
  children?: Children;
  doc?: Children;
}

export interface ServiceFunctionProps {
  name: string;
  returnType?: TypeRef;
  oneway?: boolean;
  annotations?: AnnotationMap;
  children?: Children;
  throws?: Children;
  doc?: Children;
}

export interface ThrowsProps {
  children?: Children;
}

/**
 * Define a Thrift service.
 *
 * @remarks
 * Service methods are declared as {@link ServiceFunction} children. Use `extends`
 * to inherit from another service type.
 *
 * @example Basic service
 * ```tsx
 * <Service name="UserService">
 *   <ServiceFunction name="ping" returnType="void" />
 * </Service>
 * ```
 */
export function Service(props: ServiceProps) {
  const symbol = createServiceSymbol(props.name, props.refkey);
  const annotations = renderAnnotations(props.annotations);
  const annotationText = annotations ? ` ${annotations}` : "";
  const extendsText =
    props.extends ? ` extends ${renderTypeRef(props.extends)}` : "";

  return (
    <>
      <DocWhen doc={props.doc} />
      <Declaration symbol={symbol}>
        service <Name />
        {extendsText}
        {annotationText}{" "}
        <Block>
          <List hardline>{props.children}</List>
        </Block>
      </Declaration>
    </>
  );
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
 *   <Field id={1} type="i64" name="id" />
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

  return (
    <>
      <DocWhen doc={props.doc} />
      {props.oneway ? "oneway " : ""}
      {renderTypeRef(returnType)} {name}(
      <FieldContext.Provider value={paramRegistry}>
        <List comma line>
          {params}
        </List>
      </FieldContext.Provider>
      ){throws ? " " : ""}
      {throws ?
        <FieldContext.Provider value={throwsRegistry}>
          <Throws>{throws}</Throws>
        </FieldContext.Provider>
      : null}
      {annotationText};
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
  return (
    <>
      throws (
      <List comma line>
        {props.children}
      </List>
      )
    </>
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
