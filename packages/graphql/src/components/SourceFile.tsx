import {
  ComponentContext,
  SourceFile as CoreSourceFile,
  createNamedContext,
  List,
  Scope,
  useContext,
  type Children,
} from "@alloy-js/core";
import { GraphQLModuleScope } from "../symbols/index.js";
import { Reference } from "./Reference.js";
import { wrapDescription } from "./utils.js";
import {
  createValidationState,
  InterfaceValidationProvider,
  InterfaceValidationState,
  runValidations,
} from "./DeferredInterfaceValidation.js";

// Registry to track all active validation states from SourceFile components
const validationRegistry = new Set<InterfaceValidationState>();

/**
 * Get all validation errors from all rendered SourceFile components.
 * This runs validations on all registered validation states and returns any errors.
 *
 * Call this after rendering is complete to check for schema validation errors.
 */
export function collectValidationErrors(): Error[] {
  const errors: Error[] = [];
  for (const state of validationRegistry) {
    errors.push(...runValidations(state));
  }
  return errors;
}

/**
 * Clear all registered validation states.
 * Useful for testing or when starting a new render.
 */
export function clearValidationRegistry(): void {
  validationRegistry.clear();
}

export interface GraphQLSourceFileContext {
  scope: GraphQLModuleScope;
  /**
   * The schema name for this file, e.g. 'schema' for schema.graphql
   */
  schemaName: string;
  /**
   * The validation state for this source file.
   * Used to collect and run interface implementation validations.
   */
  validationState: InterfaceValidationState;
}

export const GraphQLSourceFileContext: ComponentContext<GraphQLSourceFileContext> =
  createNamedContext("@alloy-js/graphql SourceFile");

export function useSourceFile() {
  return useContext(GraphQLSourceFileContext)!;
}

export interface SourceFileProps {
  /**
   * The path to the file relative to the source directory.
   */
  path: string;
  /**
   * Content to add to the file, such as type definitions, enum definitions, etc.
   */
  children?: Children;
  /**
   * Comment to add at the top of the file (e.g., "Auto-generated. Do not edit.").
   * Rendered as a GraphQL comment with # prefix.
   */
  headerComment?: string;
  /**
   * Schema-level description that documents the purpose of this schema file.
   * Rendered as a GraphQL description using triple-quoted strings.
   */
  description?: Children;
}

/**
 * Defines a GraphQL source file, which can contain multiple GraphQL definitions.
 * It provides a scope for the file, which is a `GraphQLScope` that contains
 * all the type definitions in the file.
 *
 * @example
 * ```tsx
 * import { builtInScalars, TypeReference } from "@alloy-js/graphql";
 * import { ObjectTypeDefinition, FieldDefinition, SourceFile } from "@alloy-js/graphql/components";
 *
 * <SourceFile
 *   path="schema.graphql"
 *   headerComment="This file is auto-generated. Do not edit manually."
 *   description="Main schema file for the API"
 * >
 *   <ObjectTypeDefinition name="User">
 *     <FieldDefinition name="id" type={<TypeReference type={builtInScalars.ID} required />} />
 *   </ObjectTypeDefinition>
 * </SourceFile>
 * ```
 * renders to
 * ```graphql
 * # This file is auto-generated. Do not edit manually.
 * """
 * Main schema file for the API
 * """
 * type User {
 *   id: ID!
 * }
 * ```
 */
export function SourceFile(props: SourceFileProps) {
  const schemaName = props.path.replace(/\.graphql$/, "");
  const scope = new GraphQLModuleScope(schemaName, undefined);
  const wrappedDescription = wrapDescription(props.description);

  // Create validation state for this source file and register it
  const validationState = createValidationState();
  validationRegistry.add(validationState);

  return (
    <CoreSourceFile path={props.path} filetype="graphql" reference={Reference}>
      <GraphQLSourceFileContext.Provider
        value={{ scope, schemaName, validationState }}
      >
        <InterfaceValidationProvider state={validationState}>
          {props.headerComment && (
            <>
              {`# ${props.headerComment}`}
              <hbr />
            </>
          )}
          {wrappedDescription() && (
            <>
              {wrappedDescription()}
              <hbr />
            </>
          )}
          <Scope value={scope}>
            <List doubleHardline>{props.children}</List>
          </Scope>
        </InterfaceValidationProvider>
      </GraphQLSourceFileContext.Provider>
    </CoreSourceFile>
  );
}
