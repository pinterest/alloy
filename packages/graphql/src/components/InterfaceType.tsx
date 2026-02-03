import type { Children, Refkey } from "@alloy-js/core";
import {
  TypeContext,
  createInterfaceTypeDefinition,
  registerType,
  useSchemaContext,
  type TypeReference,
} from "../schema.js";
import { normalizeRefkeys } from "./utils.js";

export interface InterfaceTypeProps {
  name: string;
  description?: string;
  interfaces?: TypeReference[];
  refkey?: Refkey | Refkey[];
  children?: Children;
}

/**
 * Defines a GraphQL interface type.
 *
 * @example
 * ```tsx
 * <InterfaceType name="Node">
 *   <Field name="id" type={ID} nonNull />
 * </InterfaceType>
 * ```
 */
export function InterfaceType(props: InterfaceTypeProps) {
  const state = useSchemaContext();
  const definition = createInterfaceTypeDefinition(
    state,
    props.name,
    props.description,
    props.interfaces ?? [],
    normalizeRefkeys(props.refkey),
  );
  registerType(state, definition);

  return (
    <TypeContext.Provider value={{ definition }}>
      {props.children}
    </TypeContext.Provider>
  );
}
