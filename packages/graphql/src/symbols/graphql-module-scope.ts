import { GraphQLLexicalScope } from "./graphql-lexical-scope.js";

/**
 * A module scope for GraphQL, representing the top-level scope of a schema file.
 *
 * This is a thin wrapper around GraphQLLexicalScope for consistency with other
 * language implementations. Unlike those languages, GraphQL SDL does not
 * have a native import/export system, so this scope does not track imports or
 * exports. Schema composition is typically handled by external tooling (e.g.,
 * Apollo Federation, Schema Stitching).
 *
 * If future support for cross-schema references is needed, import/export tracking
 * can be added here.
 */
export class GraphQLModuleScope extends GraphQLLexicalScope {}
