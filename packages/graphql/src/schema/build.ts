import { isRefkeyable, toRefkey } from "@alloy-js/core";
import {
  GraphQLDirective,
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLInterfaceType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLSchema,
  GraphQLUnionType,
  assertValidSchema,
  isInputType,
  isNamedType,
  isObjectType,
  isOutputType,
  isType,
  specifiedDirectives,
  type GraphQLArgumentConfig,
  type GraphQLField,
  type GraphQLFieldConfig,
  type GraphQLInputFieldConfig,
  type GraphQLInputType,
  type GraphQLNamedType,
  type GraphQLOutputType,
  type GraphQLType,
} from "graphql";
import { isRelayNamePolicy } from "../name-policy.js";
import { builtInScalars, builtInScalarsFallback } from "./constants.js";
import { isTypeRef, normalizeTypeName } from "./refs.js";
import { validateRelaySchema } from "./relay-validation.js";
import type {
  ArgDefinition,
  EnumTypeDefinition,
  FieldDefinition,
  InputObjectTypeDefinition,
  InterfaceTypeDefinition,
  ObjectTypeDefinition,
  SchemaState,
  TypeDefinition,
  TypeReference,
  UnionTypeDefinition,
} from "./types.js";

interface BuildContext {
  namedTypes: Map<string, GraphQLNamedType>;
}

/**
 * Builds a `GraphQLSchema` from a schema state.
 *
 * @remarks
 * Use `renderSchema` for the typical component-driven workflow.
 */
export function buildSchema(
  state: SchemaState,
  validate: boolean,
): GraphQLSchema {
  const context: BuildContext = {
    namedTypes: new Map<string, GraphQLNamedType>(),
  };

  for (const [name] of state.types) {
    resolveNamedType(state, context, name);
  }

  const queryRef =
    state.schema.query ?? (state.types.has("Query") ? "Query" : undefined);
  if (!queryRef) {
    throw new Error("A query root type is required.");
  }

  const queryType = normalizeTypeRef(state, context, queryRef);
  if (!(queryType instanceof GraphQLObjectType)) {
    throw new Error("Query root type must be an object type.");
  }

  const mutationType =
    state.schema.mutation ?
      normalizeTypeRef(state, context, state.schema.mutation)
    : undefined;
  if (mutationType && !(mutationType instanceof GraphQLObjectType)) {
    throw new Error("Mutation root type must be an object type.");
  }

  const subscriptionType =
    state.schema.subscription ?
      normalizeTypeRef(state, context, state.schema.subscription)
    : undefined;
  if (subscriptionType && !(subscriptionType instanceof GraphQLObjectType)) {
    throw new Error("Subscription root type must be an object type.");
  }

  const rootNames = new Set<string>();
  rootNames.add(queryType.name);
  if (mutationType) {
    if (rootNames.has(mutationType.name)) {
      throw new Error("Root types must be distinct.");
    }
    rootNames.add(mutationType.name);
  }
  if (subscriptionType) {
    if (rootNames.has(subscriptionType.name)) {
      throw new Error("Root types must be distinct.");
    }
    rootNames.add(subscriptionType.name);
  }

  const directives = buildDirectives(state, context);

  const schema = new GraphQLSchema({
    query: queryType,
    mutation: mutationType as GraphQLObjectType | undefined,
    subscription: subscriptionType as GraphQLObjectType | undefined,
    types: Array.from(context.namedTypes.values()),
    directives,
    description: state.description,
  });

  if (validate) {
    assertValidSchema(schema);
    if (isRelayNamePolicy(state.namePolicy)) {
      validateRelaySchema(schema);
    }
  }

  return schema;
}

function normalizeNamedType(
  state: SchemaState,
  context: BuildContext,
  type: TypeReference,
): GraphQLNamedType {
  if (isType(type) && isNamedType(type)) {
    return type;
  }

  if (typeof type === "string") {
    return resolveNamedType(state, context, normalizeTypeName(state, type));
  }

  if (isRefkeyable(type)) {
    const refkey = toRefkey(type);
    const name = state.refkeyToName.get(refkey);
    if (!name) {
      throw new Error("Unknown refkey for GraphQL type.");
    }
    return resolveNamedType(state, context, name);
  }

  if (isTypeRef(type) && type.kind === "named") {
    return normalizeNamedType(state, context, type.name);
  }

  throw new Error("Expected a named GraphQL type.");
}

function normalizeTypeRef(
  state: SchemaState,
  context: BuildContext,
  type: TypeReference,
): GraphQLType {
  if (isType(type)) {
    return type;
  }

  if (isTypeRef(type)) {
    switch (type.kind) {
      case "named":
        return normalizeNamedType(state, context, type.name);
      case "list":
        return new GraphQLList(normalizeTypeRef(state, context, type.ofType));
      case "nonNull": {
        const inner = normalizeTypeRef(state, context, type.ofType);
        if (inner instanceof GraphQLNonNull) {
          throw new Error("Non-Null cannot wrap a Non-Null type.");
        }
        return new GraphQLNonNull(inner);
      }
    }
  }

  if (typeof type === "string" || isRefkeyable(type)) {
    return normalizeNamedType(state, context, type);
  }

  throw new Error("Unable to resolve type reference.");
}

function resolveNamedType(
  state: SchemaState,
  context: BuildContext,
  name: string,
): GraphQLNamedType {
  const builtIn = builtInScalars.get(name) ?? builtInScalarsFallback.get(name);
  if (builtIn) {
    return builtIn;
  }

  const definition = state.types.get(name);
  if (!definition) {
    throw new Error(`Unknown GraphQL type "${name}".`);
  }

  if (!context.namedTypes.has(name)) {
    const gqlType = createGraphQLType(state, context, definition);
    context.namedTypes.set(name, gqlType);
  }

  return context.namedTypes.get(name)!;
}

function createGraphQLType(
  state: SchemaState,
  context: BuildContext,
  definition: TypeDefinition,
): GraphQLNamedType {
  switch (definition.kind) {
    case "object":
      return new GraphQLObjectType({
        name: definition.name,
        description: definition.description,
        fields: () => buildFieldMap(state, context, definition),
        interfaces: () =>
          definition.interfaces.map((iface) => {
            const resolved = normalizeNamedType(state, context, iface);
            if (!(resolved instanceof GraphQLInterfaceType)) {
              throw new Error(
                `Interface "${definition.name}" references non-interface type "${resolved.name}".`,
              );
            }
            return resolved;
          }),
      });
    case "interface":
      return new GraphQLInterfaceType({
        name: definition.name,
        description: definition.description,
        fields: () => buildFieldMap(state, context, definition),
        interfaces: () =>
          definition.interfaces.map((iface) => {
            const resolved = normalizeNamedType(state, context, iface);
            if (!(resolved instanceof GraphQLInterfaceType)) {
              throw new Error(
                `Interface "${definition.name}" references non-interface type "${resolved.name}".`,
              );
            }
            return resolved;
          }),
      });
    case "input":
      return new GraphQLInputObjectType({
        name: definition.name,
        description: definition.description,
        fields: () => buildInputFieldMap(state, context, definition),
        isOneOf: definition.isOneOf,
      });
    case "enum":
      return new GraphQLEnumType({
        name: definition.name,
        description: definition.description,
        values: buildEnumValueMap(definition),
      });
    case "union":
      return new GraphQLUnionType({
        name: definition.name,
        description: definition.description,
        types: () => buildUnionMembers(state, context, definition),
      });
    case "scalar":
      return new GraphQLScalarType({
        name: definition.name,
        description: definition.description,
        serialize: definition.serialize,
        parseValue: definition.parseValue,
        parseLiteral: definition.parseLiteral,
        specifiedByURL: definition.specifiedByUrl,
      });
    default:
      throw new Error("Unknown type definition.");
  }
}

function buildFieldMap(
  state: SchemaState,
  context: BuildContext,
  definition: ObjectTypeDefinition | InterfaceTypeDefinition,
): Record<string, GraphQLFieldConfig<unknown, unknown>> {
  const fields = new Map<string, GraphQLFieldConfig<unknown, unknown>>();

  const interfaceFields = collectInterfaceFieldConfigs(
    state,
    context,
    definition,
    new Set(),
  );
  for (const [name, config] of interfaceFields) {
    fields.set(name, config);
  }

  const ownFields = buildFieldConfigsFromDefinitions(
    state,
    context,
    definition,
    definition.fields,
  );
  for (const [name, config] of ownFields) {
    fields.set(name, config);
  }

  if (fields.size === 0) {
    throw new Error(`Type "${definition.name}" must define fields.`);
  }

  return Object.fromEntries(fields);
}

function collectInterfaceFieldConfigs(
  state: SchemaState,
  context: BuildContext,
  definition: ObjectTypeDefinition | InterfaceTypeDefinition,
  visited: Set<string>,
): Map<string, GraphQLFieldConfig<unknown, unknown>> {
  const fields = new Map<string, GraphQLFieldConfig<unknown, unknown>>();

  for (const iface of definition.interfaces) {
    const resolved = normalizeNamedType(state, context, iface);
    if (!(resolved instanceof GraphQLInterfaceType)) {
      throw new Error(
        `Interface "${definition.name}" references non-interface type "${resolved.name}".`,
      );
    }

    if (visited.has(resolved.name)) {
      continue;
    }
    visited.add(resolved.name);

    const ifaceDefinition = state.types.get(resolved.name);
    if (ifaceDefinition && ifaceDefinition.kind === "interface") {
      const inherited = collectInterfaceFieldConfigs(
        state,
        context,
        ifaceDefinition,
        visited,
      );
      for (const [name, config] of inherited) {
        if (!fields.has(name)) {
          fields.set(name, config);
        }
      }

      const own = buildFieldConfigsFromDefinitions(
        state,
        context,
        ifaceDefinition,
        ifaceDefinition.fields,
      );
      for (const [name, config] of own) {
        if (!fields.has(name)) {
          fields.set(name, config);
        }
      }
    } else {
      const external = buildFieldConfigsFromGraphQLInterface(resolved);
      for (const [name, config] of external) {
        if (!fields.has(name)) {
          fields.set(name, config);
        }
      }
    }
  }

  return fields;
}

function buildFieldConfigsFromDefinitions(
  state: SchemaState,
  context: BuildContext,
  definition: ObjectTypeDefinition | InterfaceTypeDefinition,
  fields: FieldDefinition[],
): Map<string, GraphQLFieldConfig<unknown, unknown>> {
  const entries = new Map<string, GraphQLFieldConfig<unknown, unknown>>();

  for (const field of fields) {
    const type = normalizeTypeRef(state, context, field.type);
    if (!isOutputType(type)) {
      throw new Error(
        `Field "${field.name}" on "${definition.name}" must be an output type.`,
      );
    }
    const args = buildArgsMap(state, context, field.args);
    entries.set(field.name, {
      type: type as GraphQLOutputType,
      description: field.description,
      deprecationReason: field.deprecationReason,
      args,
    });
  }

  return entries;
}

function buildFieldConfigsFromGraphQLInterface(
  iface: GraphQLInterfaceType,
): Map<string, GraphQLFieldConfig<unknown, unknown>> {
  const entries = new Map<string, GraphQLFieldConfig<unknown, unknown>>();
  const fields = iface.getFields();
  for (const field of Object.values(fields) as GraphQLField<
    unknown,
    unknown
  >[]) {
    const args = Object.fromEntries(
      field.args.map((arg) => [
        arg.name,
        {
          type: arg.type,
          description: arg.description,
          defaultValue: arg.defaultValue,
          deprecationReason: arg.deprecationReason,
        },
      ]),
    );
    entries.set(field.name, {
      type: field.type,
      description: field.description,
      deprecationReason: field.deprecationReason,
      args,
    });
  }

  return entries;
}

function buildInputFieldMap(
  state: SchemaState,
  context: BuildContext,
  definition: InputObjectTypeDefinition,
): Record<string, GraphQLInputFieldConfig> {
  const entries: [string, GraphQLInputFieldConfig][] = [];
  for (const field of definition.fields) {
    const type = normalizeTypeRef(state, context, field.type);
    if (!isInputType(type)) {
      throw new Error(
        `Input field "${field.name}" on "${definition.name}" must be an input type.`,
      );
    }
    entries.push([
      field.name,
      {
        type: type as GraphQLInputType,
        description: field.description,
        defaultValue: field.defaultValue,
        deprecationReason: field.deprecationReason,
      },
    ]);
  }

  return Object.fromEntries(entries);
}

function buildEnumValueMap(
  definition: EnumTypeDefinition,
): Record<string, { description?: string; deprecationReason?: string }> {
  return Object.fromEntries(
    definition.values.map((value) => [
      value.name,
      {
        description: value.description,
        deprecationReason: value.deprecationReason,
      },
    ]),
  );
}

function buildUnionMembers(
  state: SchemaState,
  context: BuildContext,
  definition: UnionTypeDefinition,
): GraphQLObjectType[] {
  return definition.members.map((member) => {
    const type = normalizeTypeRef(state, context, member.type);
    if (!isObjectType(type)) {
      const name = isNamedType(type) ? type.name : "(unknown)";
      throw new Error(
        `Union "${definition.name}" member "${name}" must be an object type.`,
      );
    }
    return type;
  });
}

function buildArgsMap(
  state: SchemaState,
  context: BuildContext,
  args: ArgDefinition[],
): Record<string, GraphQLArgumentConfig> {
  return Object.fromEntries(
    args.map((arg) => {
      const type = normalizeTypeRef(state, context, arg.type);
      if (!isInputType(type)) {
        throw new Error(`Argument "${arg.name}" must be an input type.`);
      }

      return [
        arg.name,
        {
          type: type as GraphQLInputType,
          description: arg.description,
          defaultValue: arg.defaultValue,
          deprecationReason: arg.deprecationReason,
        },
      ];
    }),
  );
}

function buildDirectives(
  state: SchemaState,
  context: BuildContext,
): GraphQLDirective[] {
  const customDirectives = Array.from(state.directives.values()).map(
    (def) =>
      new GraphQLDirective({
        name: def.name,
        description: def.description,
        isRepeatable: def.repeatable,
        locations: def.locations,
        args: buildArgsMap(state, context, def.args),
      }),
  );

  if (!state.includeSpecifiedDirectives) {
    return customDirectives;
  }

  const directiveMap = new Map<string, GraphQLDirective>();
  for (const directive of specifiedDirectives) {
    directiveMap.set(directive.name, directive);
  }
  for (const directive of customDirectives) {
    directiveMap.set(directive.name, directive);
  }

  return Array.from(directiveMap.values());
}
