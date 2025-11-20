import {
  Children,
  Declaration as CoreDeclaration,
  Indent,
  List,
  Name,
  Show,
  createSymbolSlot,
} from "@alloy-js/core";
import { createGraphQLSymbol } from "../symbol-creation.js";
import { NamedDeclarationProps } from "./common-props.js";
import { wrapDescription } from "./utils.js";

export type OperationType = "query" | "mutation" | "subscription";

export interface OperationDefinitionProps
  extends Partial<NamedDeclarationProps> {
  /**
   * The type of operation (query, mutation, or subscription)
   */
  operationType: OperationType;
  /**
   * Description for the operation (September 2025 spec feature)
   */
  description?: Children;
  /**
   * Variable definitions for the operation
   */
  variableDefinitions?: Children;
  /**
   * Directives to apply to the operation
   */
  directives?: Children;
  /**
   * The selection set (fields to query/mutate)
   */
  children?: Children;
}

/**
 * An operation definition for GraphQL queries, mutations, or subscriptions.
 *
 * @example
 * ```tsx
 * import { code, refkey } from "@alloy-js/core";
 *
 * // Simple query without name or variables
 * <OperationDefinition operationType="query">
 *   <FieldSelection name="user">
 *     <FieldSelection name="id" />
 *     <FieldSelection name="name" />
 *   </FieldSelection>
 * </OperationDefinition>
 *
 * // Named mutation with variables
 * <OperationDefinition
 *   operationType="mutation"
 *   name="CreateUser"
 *   variableDefinitions={
 *     <>
 *       <VariableDefinition name="name" type="String!" />
 *       <VariableDefinition name="email" type="String!" />
 *     </>
 *   }
 * >
 *   <FieldSelection
 *     name="createUser"
 *     arguments={
 *       <>
 *         <Argument name="name" value={<Variable name="name" />} />
 *         <Argument name="email" value={<Variable name="email" />} />
 *       </>
 *     }
 *   >
 *     <FieldSelection name="id" />
 *     <FieldSelection name="name" />
 *   </FieldSelection>
 * </OperationDefinition>
 *
 * // Query with description (September 2025 spec feature)
 * <OperationDefinition
 *   operationType="query"
 *   name="GetUser"
 *   description='"""Fetch a user by ID"""'
 *   variableDefinitions={
 *     <VariableDefinition name="id" type="ID!" />
 *   }
 * >
 *   <FieldSelection name="user">
 *     <FieldSelection name="id" />
 *     <FieldSelection name="name" />
 *   </FieldSelection>
 * </OperationDefinition>
 * ```
 * renders to
 * ```graphql
 * {
 *   user {
 *     id
 *     name
 *   }
 * }
 *
 * mutation CreateUser($name: String!, $email: String!) {
 *   createUser(name: $name, email: $email) {
 *     id
 *     name
 *   }
 * }
 *
 * """
 * Fetch a user by ID
 * """
 * query GetUser($id: ID!) {
 *   user {
 *     id
 *     name
 *   }
 * }
 * ```
 */
export function OperationDefinition(props: OperationDefinitionProps) {
  const TypeSymbolSlot = createSymbolSlot();

  // Anonymous operations (shorthand syntax) don't need a symbol
  const sym =
    props.name ?
      createGraphQLSymbol(
        props.name,
        {
          refkeys: props.refkey,
        },
        "operation",
      )
    : undefined;

  const hasVariables = Boolean(props.variableDefinitions);
  const hasDirectives = Boolean(props.directives);

  // Shorthand syntax: { ... } for anonymous queries
  const isShorthand =
    !props.name &&
    !hasVariables &&
    !hasDirectives &&
    props.operationType === "query";

  const wrappedDescription = wrapDescription(props.description);

  const content = (
    <>
      <Show when={Boolean(wrappedDescription())}>
        {wrappedDescription()}
        <hbr />
      </Show>
      {!isShorthand && (
        <>
          {props.operationType}
          {props.name && (
            <>
              {" "}
              <Name />
            </>
          )}
          {hasVariables && (
            <>
              (
              <List children={props.variableDefinitions} joiner=", " />)
            </>
          )}
          {hasDirectives && <>{props.directives}</>}
          {" {"}
        </>
      )}
      {isShorthand && "{"}
      <Indent hardline>
        <List children={props.children} joiner={<hardline />} />
      </Indent>
      <hardline />
      {"}"}
    </>
  );

  if (sym) {
    return (
      <CoreDeclaration symbol={sym}>
        <TypeSymbolSlot>{content}</TypeSymbolSlot>
      </CoreDeclaration>
    );
  }

  return content;
}
