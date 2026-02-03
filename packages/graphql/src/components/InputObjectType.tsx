import type { Children, Refkey } from "@alloy-js/core";
import {
  TypeContext,
  createInputObjectTypeDefinition,
  registerType,
  useSchemaContext,
  useTypeContext,
} from "../schema.js";
import { normalizeRefkeys } from "./utils.js";

export interface InputObjectTypeProps {
  name: string;
  description?: string;
  oneOf?: boolean;
  refkey?: Refkey | Refkey[];
  children?: Children;
}

function EnsureInputFields() {
  const definition = useTypeContext();
  if (definition.kind !== "input") {
    throw new Error(
      "InputObjectType validation must be used within an InputObjectType.",
    );
  }
  if (definition.fields.length === 0) {
    throw new Error(`Input "${definition.name}" must define fields.`);
  }
  return undefined;
}

/**
 * Defines a GraphQL input object type.
 *
 * @example
 * ```tsx
 * <InputObjectType name="UserFilter">
 *   <InputField name="name" type={String} />
 * </InputObjectType>
 * ```
 *
 * @remarks
 * Set `oneOf` to true to create a GraphQL `@oneOf`-style input object.
 */
export function InputObjectType(props: InputObjectTypeProps) {
  const state = useSchemaContext();
  const definition = createInputObjectTypeDefinition(
    state,
    props.name,
    props.description,
    props.oneOf ?? false,
    normalizeRefkeys(props.refkey),
  );
  registerType(state, definition);

  return (
    <TypeContext.Provider value={{ definition }}>
      {props.children}
      <EnsureInputFields />
    </TypeContext.Provider>
  );
}
