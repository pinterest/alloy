import type { Children, Refkey } from "@alloy-js/core";
import {
  TypeContext,
  createObjectTypeDefinition,
  registerType,
  useSchemaContext,
  type TypeReference,
} from "../schema.js";
import { normalizeRefkeys } from "./utils.js";

export interface ObjectTypeProps {
  name: string;
  description?: string;
  interfaces?: TypeReference[];
  refkey?: Refkey | Refkey[];
  children?: Children;
}

/**
 * Defines a GraphQL object type.
 *
 * @example
 * ```tsx
 * <ObjectType name="User">
 *   <Field name="id" type={ID} nonNull />
 *   <Field name="name" type={String} />
 * </ObjectType>
 * ```
 *
 * @remarks
 * When you pass `interfaces`, the interface fields are applied to the object
 * type automatically.
 */
export function ObjectType(props: ObjectTypeProps) {
  const state = useSchemaContext();
  const definition = createObjectTypeDefinition(
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
