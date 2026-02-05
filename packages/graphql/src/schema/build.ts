import { isRefkeyable, toRefkey } from "@alloy-js/core";
import {
  DirectiveLocation,
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
  Kind,
  assertValidSchema,
  astFromValue,
  isInputType,
  isNamedType,
  isObjectType,
  isOutputType,
  isRequiredArgument,
  isType,
  specifiedDirectives,
  type ConstArgumentNode,
  type ConstDirectiveNode,
  type DirectiveDefinitionNode,
  type EnumValueDefinitionNode,
  type FieldDefinitionNode,
  type GraphQLArgumentConfig,
  type GraphQLField,
  type GraphQLFieldConfig,
  type GraphQLInputFieldConfig,
  type GraphQLInputType,
  type GraphQLNamedType,
  type GraphQLOutputType,
  type GraphQLType,
  type InputValueDefinitionNode,
  type NameNode,
  type NamedTypeNode,
  type OperationTypeDefinitionNode,
  type SchemaDefinitionNode,
  type TypeDefinitionNode,
  type TypeNode,
} from "graphql";
import { isRelayNamePolicy } from "../name-policy.js";
import { builtInScalars, builtInScalarsFallback } from "./constants.js";
import { isTypeRef, normalizeTypeName } from "./refs.js";
import { validateRelaySchema } from "./relay-validation.js";
import type {
  AppliedDirective,
  ArgDefinition,
  DirectiveDefinition,
  EnumTypeDefinition,
  EnumValueDefinition,
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
  directiveMap?: Map<string, GraphQLDirective>;
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

  const directiveMap = buildDirectiveMap(state, context);
  context.directiveMap = directiveMap;

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

  attachDirectiveDefinitionAstNodes(state, context);
  attachTypeDirectiveAstNodes(state, context);

  const schemaDirectives = buildAppliedDirectiveNodes(
    directiveMap,
    state.schemaDirectives,
    DirectiveLocation.SCHEMA,
    "schema",
  );
  const schemaAstNode =
    schemaDirectives && schemaDirectives.length > 0 ?
      createSchemaDefinitionNode(schemaDirectives, {
        query: queryType,
        mutation: mutationType,
        subscription: subscriptionType,
      })
    : undefined;

  const schema = new GraphQLSchema({
    query: queryType,
    mutation: mutationType as GraphQLObjectType | undefined,
    subscription: subscriptionType as GraphQLObjectType | undefined,
    types: Array.from(context.namedTypes.values()),
    directives: Array.from(directiveMap.values()),
    description: state.description,
    astNode: schemaAstNode,
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
        values: buildEnumValueMap(definition, context),
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
    const args = buildArgsMap(state, context, field.args, {
      ownerLabel: `field "${definition.name}.${field.name}"`,
    });
    const directives = buildAppliedDirectiveNodes(
      getDirectiveMap(context),
      field.directives,
      DirectiveLocation.FIELD_DEFINITION,
      `field "${definition.name}.${field.name}"`,
    );
    const astNode =
      directives && directives.length > 0 ?
        createFieldDefinitionNode(field.name, type, directives)
      : undefined;
    entries.set(field.name, {
      type: type as GraphQLOutputType,
      description: field.description,
      deprecationReason: field.deprecationReason,
      args,
      astNode,
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
          astNode: arg.astNode ?? undefined,
        },
      ]),
    );
    entries.set(field.name, {
      type: field.type,
      description: field.description,
      deprecationReason: field.deprecationReason,
      args,
      astNode: field.astNode ?? undefined,
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
    const directives = buildAppliedDirectiveNodes(
      getDirectiveMap(context),
      field.directives,
      DirectiveLocation.INPUT_FIELD_DEFINITION,
      `input field "${definition.name}.${field.name}"`,
    );
    const astNode =
      directives && directives.length > 0 ?
        createInputValueDefinitionNode(
          field.name,
          type,
          field.defaultValue,
          directives,
        )
      : undefined;
    entries.push([
      field.name,
      {
        type: type as GraphQLInputType,
        description: field.description,
        defaultValue: field.defaultValue,
        deprecationReason: field.deprecationReason,
        astNode,
      },
    ]);
  }

  return Object.fromEntries(entries);
}

function buildEnumValueMap(
  definition: EnumTypeDefinition,
  context: BuildContext,
): Record<string, { description?: string; deprecationReason?: string }> {
  return Object.fromEntries(
    definition.values.map((value) => [
      value.name,
      buildEnumValueConfig(value, definition, context),
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

interface ArgumentBuildOptions {
  ownerLabel?: string;
  directiveMap?: Map<string, GraphQLDirective> | null;
}

function buildArgsMap(
  state: SchemaState,
  context: BuildContext,
  args: ArgDefinition[],
  options?: ArgumentBuildOptions,
): Record<string, GraphQLArgumentConfig> {
  const directiveMap = options?.directiveMap ?? context.directiveMap;
  return Object.fromEntries(
    args.map((arg) => {
      const type = normalizeTypeRef(state, context, arg.type);
      if (!isInputType(type)) {
        throw new Error(`InputValue "${arg.name}" must be an input type.`);
      }

      const directives =
        directiveMap && arg.directives.length > 0 ?
          buildAppliedDirectiveNodes(
            directiveMap,
            arg.directives,
            DirectiveLocation.ARGUMENT_DEFINITION,
            options?.ownerLabel ?
              `argument "${arg.name}" on ${options.ownerLabel}`
            : `argument "${arg.name}"`,
          )
        : undefined;
      const astNode =
        directives && directives.length > 0 ?
          createInputValueDefinitionNode(
            arg.name,
            type,
            arg.defaultValue,
            directives,
          )
        : undefined;

      return [
        arg.name,
        {
          type: type as GraphQLInputType,
          description: arg.description,
          defaultValue: arg.defaultValue,
          deprecationReason: arg.deprecationReason,
          astNode,
        },
      ];
    }),
  );
}

function buildDirectiveMap(
  state: SchemaState,
  context: BuildContext,
): Map<string, GraphQLDirective> {
  const directiveMap = new Map<string, GraphQLDirective>();

  for (const directive of specifiedDirectives) {
    directiveMap.set(directive.name, directive);
  }

  for (const def of state.directives.values()) {
    const directive = new GraphQLDirective({
      name: def.name,
      description: def.description,
      isRepeatable: def.repeatable,
      locations: def.locations,
      args: buildArgsMap(state, context, def.args, { directiveMap: null }),
    });
    directiveMap.set(directive.name, directive);
  }

  return directiveMap;
}

function getDirectiveMap(context: BuildContext): Map<string, GraphQLDirective> {
  if (!context.directiveMap) {
    throw new Error("Directive map is not initialized.");
  }
  return context.directiveMap;
}

function attachDirectiveDefinitionAstNodes(
  state: SchemaState,
  context: BuildContext,
) {
  const directiveMap = getDirectiveMap(context);
  for (const def of state.directives.values()) {
    const directive = directiveMap.get(def.name);
    if (!directive) {
      throw new Error(`Directive "${def.name}" is not registered.`);
    }

    const argNodes = def.args.map((arg) =>
      createInputValueDefinitionNode(
        arg.name,
        normalizeTypeRef(state, context, arg.type) as GraphQLInputType,
        arg.defaultValue,
        arg.directives.length > 0 ?
          buildAppliedDirectiveNodes(
            directiveMap,
            arg.directives,
            DirectiveLocation.ARGUMENT_DEFINITION,
            `argument "${arg.name}" on directive "${def.name}"`,
          )
        : undefined,
      ),
    );

    const argNodeMap = new Map(argNodes.map((node) => [node.name.value, node]));
    for (const arg of directive.args) {
      const node = argNodeMap.get(arg.name);
      if (node) {
        arg.astNode = node;
      }
    }

    directive.astNode = createDirectiveDefinitionNode(def, argNodes);
  }
}

function attachTypeDirectiveAstNodes(
  state: SchemaState,
  context: BuildContext,
) {
  const directiveMap = getDirectiveMap(context);
  for (const definition of state.types.values()) {
    if (definition.directives.length === 0) {
      continue;
    }

    const directives = buildAppliedDirectiveNodes(
      directiveMap,
      definition.directives,
      directiveLocationForType(definition.kind),
      `${definition.kind} type "${definition.name}"`,
    );
    const gqlType = context.namedTypes.get(definition.name);
    if (gqlType && directives.length > 0) {
      gqlType.astNode = createTypeDefinitionNode(definition, directives);
    }
  }
}

function directiveLocationForType(
  kind: TypeDefinition["kind"],
): DirectiveLocation {
  switch (kind) {
    case "object":
      return DirectiveLocation.OBJECT;
    case "interface":
      return DirectiveLocation.INTERFACE;
    case "input":
      return DirectiveLocation.INPUT_OBJECT;
    case "enum":
      return DirectiveLocation.ENUM;
    case "union":
      return DirectiveLocation.UNION;
    case "scalar":
      return DirectiveLocation.SCALAR;
    default:
      throw new Error("Unknown type definition.");
  }
}

function buildEnumValueConfig(
  value: EnumValueDefinition,
  definition: EnumTypeDefinition,
  context: BuildContext,
): {
  description?: string;
  deprecationReason?: string;
  astNode?: EnumValueDefinitionNode;
} {
  const directives =
    value.directives.length > 0 ?
      buildAppliedDirectiveNodes(
        getDirectiveMap(context),
        value.directives,
        DirectiveLocation.ENUM_VALUE,
        `enum value "${definition.name}.${value.name}"`,
      )
    : [];
  const astNode =
    directives.length > 0 ?
      createEnumValueDefinitionNode(value.name, directives)
    : undefined;
  return {
    description: value.description,
    deprecationReason: value.deprecationReason,
    astNode,
  };
}

function buildAppliedDirectiveNodes(
  directiveMap: Map<string, GraphQLDirective>,
  applied: AppliedDirective[],
  location: DirectiveLocation,
  ownerLabel: string,
): ConstDirectiveNode[] {
  if (applied.length === 0) {
    return [];
  }

  const nodes: ConstDirectiveNode[] = [];
  const usageCounts = new Map<string, number>();
  for (const application of applied) {
    const directive = directiveMap.get(application.name);
    if (!directive) {
      throw new Error(
        `Directive "@${application.name}" is not defined for ${ownerLabel}.`,
      );
    }

    if (!directive.locations.includes(location)) {
      throw new Error(
        `Directive "@${application.name}" cannot be applied to ${ownerLabel}.`,
      );
    }

    const count = (usageCounts.get(application.name) ?? 0) + 1;
    usageCounts.set(application.name, count);
    if (!directive.isRepeatable && count > 1) {
      throw new Error(
        `Directive "@${application.name}" cannot be repeated on ${ownerLabel}.`,
      );
    }

    const argMap = new Map(directive.args.map((arg) => [arg.name, arg]));
    const providedArgs = new Set<string>();
    const argNodes = application.args.map((arg) => {
      const argDef = argMap.get(arg.name);
      if (!argDef) {
        throw new Error(
          `Unknown argument "${arg.name}" for directive "@${application.name}" on ${ownerLabel}.`,
        );
      }

      providedArgs.add(arg.name);
      const valueNode = astFromValue(arg.value, argDef.type);
      if (!valueNode) {
        throw new Error(
          `Directive "@${application.name}" argument "${arg.name}" on ${ownerLabel} could not be coerced to ${String(
            argDef.type,
          )}.`,
        );
      }

      return {
        kind: Kind.ARGUMENT,
        name: createNameNode(arg.name),
        value: valueNode,
      } satisfies ConstArgumentNode;
    });

    for (const arg of directive.args) {
      if (isRequiredArgument(arg) && !providedArgs.has(arg.name)) {
        throw new Error(
          `Directive "@${application.name}" on ${ownerLabel} is missing required argument "${arg.name}".`,
        );
      }
    }

    nodes.push({
      kind: Kind.DIRECTIVE,
      name: createNameNode(application.name),
      arguments: argNodes.length > 0 ? argNodes : undefined,
    });
  }

  return nodes;
}

function createSchemaDefinitionNode(
  directives: ConstDirectiveNode[],
  roots: {
    query: GraphQLObjectType;
    mutation?: GraphQLObjectType | undefined;
    subscription?: GraphQLObjectType | undefined;
  },
): SchemaDefinitionNode {
  const operationTypes: OperationTypeDefinitionNode[] = [
    {
      kind: Kind.OPERATION_TYPE_DEFINITION,
      operation: "query",
      type: createNamedTypeNode(roots.query.name),
    },
  ];
  if (roots.mutation) {
    operationTypes.push({
      kind: Kind.OPERATION_TYPE_DEFINITION,
      operation: "mutation",
      type: createNamedTypeNode(roots.mutation.name),
    });
  }
  if (roots.subscription) {
    operationTypes.push({
      kind: Kind.OPERATION_TYPE_DEFINITION,
      operation: "subscription",
      type: createNamedTypeNode(roots.subscription.name),
    });
  }

  return {
    kind: Kind.SCHEMA_DEFINITION,
    directives: directives.length > 0 ? directives : undefined,
    operationTypes,
  };
}

function createDirectiveDefinitionNode(
  definition: DirectiveDefinition,
  args: InputValueDefinitionNode[],
): DirectiveDefinitionNode {
  return {
    kind: Kind.DIRECTIVE_DEFINITION,
    name: createNameNode(definition.name),
    repeatable: definition.repeatable,
    locations: definition.locations.map((location) => createNameNode(location)),
    arguments: args.length > 0 ? args : undefined,
  };
}

function createFieldDefinitionNode(
  name: string,
  type: GraphQLOutputType,
  directives: ConstDirectiveNode[],
): FieldDefinitionNode {
  return {
    kind: Kind.FIELD_DEFINITION,
    name: createNameNode(name),
    type: createTypeNode(type),
    directives: directives.length > 0 ? directives : undefined,
  };
}

function createInputValueDefinitionNode(
  name: string,
  type: GraphQLInputType,
  defaultValue: unknown | undefined,
  directives: ConstDirectiveNode[] | undefined,
): InputValueDefinitionNode {
  const defaultValueNode =
    defaultValue === undefined ? undefined : (
      (astFromValue(defaultValue, type) ?? undefined)
    );
  if (defaultValue !== undefined && defaultValueNode === undefined) {
    throw new Error(
      `Default value for "${name}" could not be coerced to ${String(type)}.`,
    );
  }

  return {
    kind: Kind.INPUT_VALUE_DEFINITION,
    name: createNameNode(name),
    type: createTypeNode(type),
    defaultValue: defaultValueNode,
    directives: directives && directives.length > 0 ? directives : undefined,
  };
}

function createEnumValueDefinitionNode(
  name: string,
  directives: ConstDirectiveNode[],
): EnumValueDefinitionNode {
  return {
    kind: Kind.ENUM_VALUE_DEFINITION,
    name: createNameNode(name),
    directives: directives.length > 0 ? directives : undefined,
  };
}

function createTypeDefinitionNode(
  definition: TypeDefinition,
  directives: ConstDirectiveNode[],
): TypeDefinitionNode {
  switch (definition.kind) {
    case "object":
      return {
        kind: Kind.OBJECT_TYPE_DEFINITION,
        name: createNameNode(definition.name),
        directives: directives.length > 0 ? directives : undefined,
      };
    case "interface":
      return {
        kind: Kind.INTERFACE_TYPE_DEFINITION,
        name: createNameNode(definition.name),
        directives: directives.length > 0 ? directives : undefined,
      };
    case "input":
      return {
        kind: Kind.INPUT_OBJECT_TYPE_DEFINITION,
        name: createNameNode(definition.name),
        directives: directives.length > 0 ? directives : undefined,
      };
    case "enum":
      return {
        kind: Kind.ENUM_TYPE_DEFINITION,
        name: createNameNode(definition.name),
        directives: directives.length > 0 ? directives : undefined,
      };
    case "union":
      return {
        kind: Kind.UNION_TYPE_DEFINITION,
        name: createNameNode(definition.name),
        directives: directives.length > 0 ? directives : undefined,
      };
    case "scalar":
      return {
        kind: Kind.SCALAR_TYPE_DEFINITION,
        name: createNameNode(definition.name),
        directives: directives.length > 0 ? directives : undefined,
      };
    default:
      throw new Error("Unknown type definition.");
  }
}

function createNameNode(value: string): NameNode {
  return { kind: Kind.NAME, value };
}

function createNamedTypeNode(name: string): NamedTypeNode {
  return { kind: Kind.NAMED_TYPE, name: createNameNode(name) };
}

function createTypeNode(type: GraphQLType): TypeNode {
  if (type instanceof GraphQLNonNull) {
    const inner = createTypeNode(type.ofType);
    if (inner.kind === Kind.NON_NULL_TYPE) {
      throw new Error("Non-Null cannot wrap a Non-Null type.");
    }
    return { kind: Kind.NON_NULL_TYPE, type: inner };
  }
  if (type instanceof GraphQLList) {
    return { kind: Kind.LIST_TYPE, type: createTypeNode(type.ofType) };
  }
  return { kind: Kind.NAMED_TYPE, name: createNameNode(type.name) };
}
