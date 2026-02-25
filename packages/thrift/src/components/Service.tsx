import {
  Block,
  Children,
  Declaration,
  List,
  Name,
  Refkey,
  childrenArray,
} from "@alloy-js/core";
import { renderAnnotations, renderTypeRef } from "../render.js";
import { createServiceSymbol } from "../symbols/factories.js";
import type { AnnotationMap, TypeRef } from "../types.js";
import { DocWhen } from "./DocComment.js";

export interface ServiceProps {
  name: string;
  refkey?: Refkey;
  extends?: TypeRef;
  annotations?: AnnotationMap;
  children?: Children;
  doc?: Children;
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
  const children = childrenArray(() => props.children, {
    preserveFragments: true,
  });

  return (
    <>
      <DocWhen doc={props.doc} />
      <Declaration symbol={symbol}>
        service <Name />
        {props.extends ?
          <>
            {" extends "}
            {renderTypeRef(props.extends)}
          </>
        : ""}
        {annotationText}{" "}
        <Block>
          <List doubleHardline>{children}</List>
        </Block>
      </Declaration>
    </>
  );
}
