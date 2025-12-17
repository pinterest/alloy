import { Children, Show } from "@alloy-js/core";
import { validateRootType } from "./utils.js";

export interface SchemaDefinitionProps {
  /**
   * The root query type
   */
  query?: Children;
  /**
   * The root mutation type
   */
  mutation?: Children;
  /**
   * The root subscription type
   */
  subscription?: Children;
  /**
   * Description for the schema
   */
  description?: Children;
  /**
   * Directives to apply to the schema
   */
  directives?: Children;
}

/**
 * A schema definition for GraphQL schemas.
 * Defines the root operation types for queries, mutations, and subscriptions.
 *
 * @example
 * ```tsx
 * import { code, refkey } from "@alloy-js/core";
 *
 * const queryRef = refkey();
 * const mutationRef = refkey();
 * const subscriptionRef = refkey();
 *
 * <>
 *   <SchemaDefinition
 *     query={queryRef}
 *     mutation={mutationRef}
 *     subscription={subscriptionRef}
 *     directives={
 *       <Directive
 *         name="link"
 *         args={{ url: "https://specs.apollo.dev/federation/v2.0" }}
 *       />
 *     }
 *   />
 * </>
 * ```
 * renders to
 * ```graphql
 * """
 * Main schema definition
 * """
 * schema @link(url: "https://specs.apollo.dev/federation/v2.0") {
 *   query: Query
 *   mutation: Mutation
 *   subscription: Subscription
 * }
 * ```
 */
export function SchemaDefinition(props: SchemaDefinitionProps) {
  const hasOperations = Boolean(
    props.query || props.mutation || props.subscription,
  );

  if (!hasOperations) {
    throw new Error(
      "SchemaDefinition requires at least one operation type (query, mutation, or subscription)",
    );
  }

  // Validate that root types are object types
  validateRootType(props.query, "query");
  validateRootType(props.mutation, "mutation");
  validateRootType(props.subscription, "subscription");

  return (
    <>
      <Show when={Boolean(props.description)}>
        {props.description}
        <hbr />
      </Show>
      schema
      <Show when={Boolean(props.directives)}>{props.directives}</Show>
      {" {"}
      <hardline />
      <Show when={Boolean(props.query)}>
        {"  "}query: {props.query}
        <hardline />
      </Show>
      <Show when={Boolean(props.mutation)}>
        {"  "}mutation: {props.mutation}
        <hardline />
      </Show>
      <Show when={Boolean(props.subscription)}>
        {"  "}subscription: {props.subscription}
        <hardline />
      </Show>
      {"}"}
    </>
  );
}
