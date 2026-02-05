import type { Children, Refkey } from "@alloy-js/core";
import type { GraphQLScalarType } from "graphql";
import { DirectiveLocation } from "graphql";
import {
  DirectiveTargetContext,
  createScalarTypeDefinition,
  registerType,
  useSchemaContext,
  type NameInput,
} from "../schema.js";
import { normalizeRefkeys } from "./utils.js";

export interface ScalarTypeProps {
  name: NameInput;
  description?: string;
  specifiedByUrl?: string;
  serialize?: GraphQLScalarType["serialize"];
  parseValue?: GraphQLScalarType["parseValue"];
  parseLiteral?: GraphQLScalarType["parseLiteral"];
  refkey?: Refkey | Refkey[];
  children?: Children;
}

/**
 * Defines a custom GraphQL scalar type.
 *
 * @example
 * ```tsx
 * <ScalarType name="DateTime" specifiedByUrl="https://example.com" />
 * ```
 *
 * @remarks
 * You can optionally provide `serialize`, `parseValue`, and `parseLiteral`
 * implementations to integrate with `graphql-js`.
 */
export function ScalarType(props: ScalarTypeProps) {
  const state = useSchemaContext();
  const definition = createScalarTypeDefinition(
    state,
    props.name,
    props.description,
    normalizeRefkeys(props.refkey),
  );
  definition.serialize = props.serialize;
  definition.parseValue = props.parseValue;
  definition.parseLiteral = props.parseLiteral;
  definition.specifiedByUrl = props.specifiedByUrl;
  registerType(state, definition);
  return (
    <DirectiveTargetContext.Provider
      value={{
        location: DirectiveLocation.SCALAR,
        directives: definition.directives,
        target: definition,
      }}
    >
      {props.children}
    </DirectiveTargetContext.Provider>
  );
}
