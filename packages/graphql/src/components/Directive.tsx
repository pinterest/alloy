import type { Children } from "@alloy-js/core";
import type { DirectiveLocation } from "graphql";
import {
  ArgTargetContext,
  normalizeDirectiveDefinition,
  registerDirective,
  useSchemaContext,
} from "../schema.js";

export interface DirectiveProps {
  name: string;
  locations: (DirectiveLocation | string)[];
  repeatable?: boolean;
  description?: string;
  children?: Children;
}

/**
 * Defines a directive and its arguments.
 *
 * @example
 * ```tsx
 * <Directive name="auth" locations={["FIELD_DEFINITION"]}>
 *   <Argument name="role" type={String} />
 * </Directive>
 * ```
 */
export function Directive(props: DirectiveProps) {
  const state = useSchemaContext();
  const definition = normalizeDirectiveDefinition(
    state,
    props.name,
    props.locations,
    props.repeatable ?? false,
    props.description,
  );
  registerDirective(state, definition);

  return (
    <ArgTargetContext.Provider
      value={{ args: definition.args, argNames: definition.argNames }}
    >
      {props.children}
    </ArgTargetContext.Provider>
  );
}
