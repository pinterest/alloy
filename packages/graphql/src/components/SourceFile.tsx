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

export interface GraphQLSourceFileContext {
  scope: GraphQLModuleScope;
  /**
   * The schema name for this file, e.g. 'schema' for schema.graphql
   */
  schemaName: string;
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
 * A GraphQL source file component that represents a GraphQL schema file.
 * It provides a scope for the file, which is a `GraphQLScope` that contains
 * all the type definitions in the file.
 *
 * @example
 * ```tsx
 * import { code } from "@alloy-js/core";
 *
 * <SourceFile
 *   path="schema.graphql"
 *   headerComment="This file is auto-generated. Do not edit manually."
 *   description='"""Main schema file for the API"""'
 * >
 *   <ObjectType name="User">
 *     <Field name="id" type={code`${builtInScalars.ID}!`} />
 *     <Field name="name" type={builtInScalars.String} />
 *   </ObjectType>
 *
 *   <ObjectType name="Post">
 *     <Field name="id" type={code`${builtInScalars.ID}!`} />
 *     <Field name="title" type={builtInScalars.String} />
 *   </ObjectType>
 * </SourceFile>
 * ```
 * renders to
 * ```graphql
 * # This file is auto-generated. Do not edit manually.
 * """Main schema file for the API"""
 *
 * type User {
 *   id: ID!
 *   name: String
 * }
 *
 * type Post {
 *   id: ID!
 *   title: String
 * }
 * ```
 */
export function SourceFile(props: SourceFileProps) {
  const schemaName = props.path.replace(/\.graphql$/, "");
  const scope = new GraphQLModuleScope(schemaName, undefined);

  return (
    <CoreSourceFile path={props.path} filetype="graphql" reference={Reference}>
      <GraphQLSourceFileContext.Provider value={{ scope, schemaName }}>
        {props.headerComment && (
          <>
            {`# ${props.headerComment}`}
            <hbr />
          </>
        )}
        {props.description && (
          <>
            {props.description}
            <hbr />
          </>
        )}
        <Scope value={scope}>
          <List doubleHardline>{props.children}</List>
        </Scope>
      </GraphQLSourceFileContext.Provider>
    </CoreSourceFile>
  );
}
