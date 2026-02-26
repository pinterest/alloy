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
  /** The service name. */
  name: string;
  /** Optional refkey for cross-file references to this service. */
  refkey?: Refkey;
  /**
   * A parent service to extend.
   *
   * @remarks
   * The generated service will include an `extends` clause referencing the
   * parent. Use a refkey to reference a service defined in another file.
   */
  extends?: TypeRef;
  /** Annotations appended after the service body. */
  annotations?: AnnotationMap;
  /** {@link ServiceFunction} children defining the methods of this service. */
  children?: Children;
  /** Doc comment rendered above the service declaration. */
  doc?: Children;
}

/**
 * Define a Thrift service.
 *
 * @remarks
 * Service methods are declared as {@link ServiceFunction} children. Use the
 * `extends` prop to inherit methods from a parent service.
 *
 * @example Basic service
 * ```tsx
 * <Service name="UserService">
 *   <ServiceFunction name="ping" returnType="void" />
 * </Service>
 * ```
 *
 * Produces:
 * ```thrift
 * service UserService {
 *   void ping(),
 * }
 * ```
 *
 * @example Service with inheritance
 * ```tsx
 * <Service name="AdminService" extends="UserService">
 *   <ServiceFunction name="shutdown" returnType="void" oneway />
 * </Service>
 * ```
 *
 * Produces:
 * ```thrift
 * service AdminService extends UserService {
 *   oneway void shutdown(),
 * }
 * ```
 */
export function Service(props: ServiceProps) {
  const symbol = createServiceSymbol(props.name, props.refkey);
  const annotations = renderAnnotations(props.annotations);
  const annotationText = annotations ? ` ${annotations}` : "";
  const children = childrenArray(() => props.children, {
    preserveFragments: true,
  });
  const hasChildren = children.length > 0;

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
        : ""}{" "}
        {hasChildren ?
          <Block>
            <List doubleHardline>{children}</List>
          </Block>
        : <group>
            {"{"}
            <hbr />
            {"}"}
          </group>
        }
        {annotationText}
      </Declaration>
    </>
  );
}
