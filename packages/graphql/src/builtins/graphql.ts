import { refkey, type Refkey } from "@alloy-js/core";

/**
 * Describes a module and the named exports that should map to refkeys.
 */
export interface ModuleDescriptor {
  [path: string]: string[];
}

/**
 * Configuration for building a module refkey map.
 */
export interface CreateModuleProps<T extends ModuleDescriptor> {
  name: string;
  descriptor: T;
}

/**
 * Maps a list of names to refkeys.
 */
export type NamedMap<TDescriptor extends readonly string[]> = {
  [S in TDescriptor[number]]: Refkey;
};

/**
 * Maps module paths to name-to-refkey tables.
 */
export type ModuleRefkeys<PD extends Record<string, string[]>> = {
  [P in keyof PD]: NamedMap<PD[P]>;
};

function createModule<const T extends ModuleDescriptor>(
  props: CreateModuleProps<T>,
): ModuleRefkeys<T> {
  const refkeys: Record<string, Record<string, Refkey>> = {};
  for (const [path, symbols] of Object.entries(props.descriptor)) {
    const keys: Record<string, Refkey> = (refkeys[path] = {});
    for (const named of symbols ?? []) {
      keys[named] = refkey(props.name, path, named);
    }
  }
  return refkeys as ModuleRefkeys<T>;
}

/**
 * Refkeys for GraphQL's built-in scalar types from `graphql-js`.
 */
export const graphqlScalars = createModule({
  name: "graphql",
  descriptor: {
    ".": [
      "GraphQLString",
      "GraphQLBoolean",
      "GraphQLInt",
      "GraphQLFloat",
      "GraphQLID",
    ],
  },
});

/** Refkey for `graphql.GraphQLString`. */
export const GraphQLString = graphqlScalars["."].GraphQLString;
/** Refkey for `graphql.GraphQLBoolean`. */
export const GraphQLBoolean = graphqlScalars["."].GraphQLBoolean;
/** Refkey for `graphql.GraphQLInt`. */
export const GraphQLInt = graphqlScalars["."].GraphQLInt;
/** Refkey for `graphql.GraphQLFloat`. */
export const GraphQLFloat = graphqlScalars["."].GraphQLFloat;
/** Refkey for `graphql.GraphQLID`. */
export const GraphQLID = graphqlScalars["."].GraphQLID;

/**
 * Aliases for GraphQL built-in scalar refkeys.
 */
export {
  GraphQLBoolean as Boolean,
  GraphQLFloat as Float,
  GraphQLID as ID,
  GraphQLInt as Int,
  GraphQLString as String,
};

/**
 * Maps built-in scalar refkeys to their canonical GraphQL names.
 */
export const builtInScalarRefkeys = new Map<Refkey, string>([
  [GraphQLString, "String"],
  [GraphQLBoolean, "Boolean"],
  [GraphQLInt, "Int"],
  [GraphQLFloat, "Float"],
  [GraphQLID, "ID"],
]);
