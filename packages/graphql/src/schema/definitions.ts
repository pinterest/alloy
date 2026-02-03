import { inspectRefkey, type Refkey } from "@alloy-js/core";
import {
  DirectiveLocation,
  specifiedDirectives,
  type GraphQLDirective,
} from "graphql";
import type { GraphQLNameElement } from "../name-policy.js";
import {
  builtInScalars,
  builtInScalarsFallback,
  GRAPHQL_NAME_REGEX,
} from "./constants.js";
import { extractNamedTypeName, isNonNullTypeReference } from "./refs.js";
import type {
  ArgDefinition,
  ArgTargetContextValue,
  DeprecatedProps,
  DirectiveDefinition,
  EnumTypeDefinition,
  EnumValueDefinition,
  FieldDefinition,
  InputFieldDefinition,
  InputObjectTypeDefinition,
  InterfaceTypeDefinition,
  ObjectTypeDefinition,
  ScalarTypeDefinition,
  SchemaState,
  TypeDefinition,
  TypeReference,
  UnionMemberDefinition,
  UnionTypeDefinition,
} from "./types.js";

/**
 * Registers a type definition and its refkeys in the schema state.
 */
export function registerType(state: SchemaState, definition: TypeDefinition) {
  ensureNameValid(state, definition.name, "type");
  ensureTypeNameAvailable(state, definition.name);

  state.types.set(definition.name, definition);
  for (const refkey of definition.refkeys) {
    const existing = state.refkeyToName.get(refkey);
    if (existing && existing !== definition.name) {
      throw new Error(
        `Refkey ${inspectRefkey(refkey)} is already bound to "${existing}".`,
      );
    }
    state.refkeyToName.set(refkey, definition.name);
  }
}

/**
 * Registers a directive definition in the schema state.
 */
export function registerDirective(
  state: SchemaState,
  definition: DirectiveDefinition,
) {
  ensureNameValid(state, definition.name, "directive");

  if (state.includeSpecifiedDirectives) {
    const specifiedName = specifiedDirectives.find(
      (directive: GraphQLDirective) => directive.name === definition.name,
    );
    if (specifiedName) {
      throw new Error(
        `Directive name "${definition.name}" conflicts with a specified directive.`,
      );
    }
  }

  if (state.directives.has(definition.name)) {
    throw new Error(`Directive "${definition.name}" is already defined.`);
  }

  if (definition.locations.length === 0) {
    throw new Error(`Directive "${definition.name}" must have locations.`);
  }

  state.directives.set(definition.name, definition);
}

/**
 * Creates an object type definition, applying name policies.
 */
export function createObjectTypeDefinition(
  state: SchemaState,
  name: string,
  description?: string,
  interfaces: TypeReference[] = [],
  refkeys: Refkey[] = [],
): ObjectTypeDefinition {
  const normalizedName = applyNamePolicy(state, name, "type");
  ensureNameValid(state, normalizedName, "type");
  return {
    kind: "object",
    name: normalizedName,
    description,
    refkeys,
    fields: [],
    fieldNames: new Set(),
    interfaces,
  };
}

/**
 * Creates an interface type definition, applying name policies.
 */
export function createInterfaceTypeDefinition(
  state: SchemaState,
  name: string,
  description?: string,
  interfaces: TypeReference[] = [],
  refkeys: Refkey[] = [],
): InterfaceTypeDefinition {
  const normalizedName = applyNamePolicy(state, name, "type");
  ensureNameValid(state, normalizedName, "type");
  return {
    kind: "interface",
    name: normalizedName,
    description,
    refkeys,
    fields: [],
    fieldNames: new Set(),
    interfaces,
  };
}

/**
 * Creates an input object type definition, applying name policies.
 */
export function createInputObjectTypeDefinition(
  state: SchemaState,
  name: string,
  description?: string,
  isOneOf = false,
  refkeys: Refkey[] = [],
): InputObjectTypeDefinition {
  const normalizedName = applyNamePolicy(state, name, "type");
  ensureNameValid(state, normalizedName, "type");
  return {
    kind: "input",
    name: normalizedName,
    description,
    refkeys,
    isOneOf,
    fields: [],
    fieldNames: new Set(),
  };
}

/**
 * Creates an enum type definition, applying name policies.
 */
export function createEnumTypeDefinition(
  state: SchemaState,
  name: string,
  description?: string,
  refkeys: Refkey[] = [],
): EnumTypeDefinition {
  const normalizedName = applyNamePolicy(state, name, "type");
  ensureNameValid(state, normalizedName, "type");
  return {
    kind: "enum",
    name: normalizedName,
    description,
    refkeys,
    values: [],
    valueNames: new Set(),
  };
}

/**
 * Creates a union type definition, applying name policies.
 */
export function createUnionTypeDefinition(
  state: SchemaState,
  name: string,
  description?: string,
  refkeys: Refkey[] = [],
): UnionTypeDefinition {
  const normalizedName = applyNamePolicy(state, name, "type");
  ensureNameValid(state, normalizedName, "type");
  return {
    kind: "union",
    name: normalizedName,
    description,
    refkeys,
    members: [],
    memberNames: new Set(),
  };
}

/**
 * Creates a scalar type definition, applying name policies.
 */
export function createScalarTypeDefinition(
  state: SchemaState,
  name: string,
  description?: string,
  refkeys: Refkey[] = [],
): ScalarTypeDefinition {
  const normalizedName = applyNamePolicy(state, name, "type");
  ensureNameValid(state, normalizedName, "type");
  return {
    kind: "scalar",
    name: normalizedName,
    description,
    refkeys,
  };
}

/**
 * Creates a field definition, applying name policies.
 */
export function createFieldDefinition(
  state: SchemaState,
  name: string,
  type: TypeReference,
  description?: string,
  deprecationReason?: string,
): FieldDefinition {
  const normalizedName = applyNamePolicy(state, name, "field");
  ensureNameValid(state, normalizedName, "field");
  return {
    name: normalizedName,
    type,
    args: [],
    argNames: new Set(),
    description,
    deprecationReason,
  };
}

/**
 * Creates an argument definition, applying name policies.
 */
export function createArgDefinition(
  state: SchemaState,
  name: string,
  type: TypeReference,
  description?: string,
  defaultValue?: unknown,
  deprecationReason?: string,
): ArgDefinition {
  const normalizedName = applyNamePolicy(state, name, "argument");
  ensureNameValid(state, normalizedName, "argument");
  return {
    name: normalizedName,
    type,
    description,
    defaultValue,
    deprecationReason,
  };
}

/**
 * Creates an input field definition, applying name policies.
 */
export function createInputFieldDefinition(
  state: SchemaState,
  name: string,
  type: TypeReference,
  description?: string,
  defaultValue?: unknown,
  deprecationReason?: string,
): InputFieldDefinition {
  const normalizedName = applyNamePolicy(state, name, "inputField");
  ensureNameValid(state, normalizedName, "inputField");
  return {
    name: normalizedName,
    type,
    description,
    defaultValue,
    deprecationReason,
  };
}

/**
 * Creates an enum value definition, applying name policies.
 */
export function createEnumValueDefinition(
  state: SchemaState,
  name: string,
  description?: string,
  deprecationReason?: string,
): EnumValueDefinition {
  const normalizedName = applyNamePolicy(state, name, "enumValue");
  ensureNameValid(state, normalizedName, "enumValue");
  return { name: normalizedName, description, deprecationReason };
}

/**
 * Creates a union member definition.
 */
export function createUnionMemberDefinition(
  type: TypeReference,
): UnionMemberDefinition {
  return { type };
}

/**
 * Creates a directive definition, applying name policies.
 */
export function createDirectiveDefinition(
  state: SchemaState,
  name: string,
  locations: DirectiveLocation[],
  repeatable = false,
  description?: string,
): DirectiveDefinition {
  const normalizedName = applyNamePolicy(state, name, "directive");
  ensureNameValid(state, normalizedName, "directive");
  return {
    name: normalizedName,
    description,
    repeatable,
    locations,
    args: [],
    argNames: new Set(),
  };
}

/**
 * Adds a field to an object or interface type definition.
 */
export function addFieldToType(
  type: ObjectTypeDefinition | InterfaceTypeDefinition,
  field: FieldDefinition,
) {
  if (type.fieldNames.has(field.name)) {
    throw new Error(
      `Field "${field.name}" is already defined on "${type.name}".`,
    );
  }
  type.fieldNames.add(field.name);
  type.fields.push(field);
}

/**
 * Adds an input field to an input object type definition.
 */
export function addInputFieldToType(
  type: InputObjectTypeDefinition,
  field: InputFieldDefinition,
) {
  if (type.fieldNames.has(field.name)) {
    throw new Error(
      `Input field "${field.name}" is already defined on "${type.name}".`,
    );
  }

  const isNonNull = isNonNullTypeReference(field.type);
  const hasDefault = field.defaultValue !== undefined;
  if (type.isOneOf) {
    if (isNonNull) {
      throw new Error(
        `OneOf input "${type.name}" field "${field.name}" must be nullable.`,
      );
    }
    if (hasDefault) {
      throw new Error(
        `OneOf input "${type.name}" field "${field.name}" must not define a default value.`,
      );
    }
  }
  if (field.deprecationReason && isNonNull && !hasDefault) {
    throw new Error(
      `Input field "${field.name}" on "${type.name}" cannot be deprecated because it is required.`,
    );
  }
  type.fieldNames.add(field.name);
  type.fields.push(field);
}

/**
 * Adds a value to an enum type definition.
 */
export function addEnumValueToType(
  type: EnumTypeDefinition,
  value: EnumValueDefinition,
) {
  if (type.valueNames.has(value.name)) {
    throw new Error(
      `Enum value "${value.name}" is already defined on "${type.name}".`,
    );
  }
  type.valueNames.add(value.name);
  type.values.push(value);
}

/**
 * Adds a member to a union type definition.
 */
export function addUnionMemberToType(
  state: SchemaState,
  type: UnionTypeDefinition,
  member: UnionMemberDefinition,
) {
  const memberName = extractNamedTypeName(state, member.type);
  if (memberName && type.memberNames.has(memberName)) {
    throw new Error(
      `Union member "${memberName}" is already defined on "${type.name}".`,
    );
  }
  if (memberName) {
    type.memberNames.add(memberName);
  }
  type.members.push(member);
}

/**
 * Adds an argument to the current argument target.
 */
export function addArgToTarget(
  target: ArgTargetContextValue,
  arg: ArgDefinition,
) {
  if (target.argNames.has(arg.name)) {
    throw new Error(`Argument "${arg.name}" is already defined.`);
  }
  target.argNames.add(arg.name);
  target.args.push(arg);
}

/**
 * Resolves a deprecation reason from `DeprecatedProps`.
 */
export function resolveDeprecationReason(
  props: DeprecatedProps,
): string | undefined {
  if (props.deprecationReason !== undefined) {
    return props.deprecationReason;
  }
  if (props.deprecated === true) {
    return "No longer supported";
  }
  if (typeof props.deprecated === "string") {
    return props.deprecated;
  }
  return undefined;
}

function ensureNameValid(
  state: SchemaState,
  name: string,
  kind: GraphQLNameElement,
) {
  if (!GRAPHQL_NAME_REGEX.test(name)) {
    throw new Error(`Name "${name}" does not match GraphQL naming rules.`);
  }
  if (name.startsWith("__")) {
    throw new Error(`Name "${name}" must not begin with "__".`);
  }
  if (
    kind === "enumValue" &&
    (name === "true" || name === "false" || name === "null")
  ) {
    throw new Error(
      `Enum value name "${name}" is reserved and cannot be used.`,
    );
  }
  const policy = state.namePolicy?.rules?.[kind];
  if (policy && !policy.test(name)) {
    throw new Error(`Name "${name}" does not match the ${kind} naming policy.`);
  }
}

function applyNamePolicy(
  state: SchemaState,
  name: string,
  kind: GraphQLNameElement,
): string {
  if (!state.namePolicy) {
    return name;
  }
  return state.namePolicy.getName(name, kind);
}

function ensureTypeNameAvailable(state: SchemaState, name: string) {
  if (state.types.has(name)) {
    throw new Error(`Type "${name}" is already defined.`);
  }
  if (builtInScalars.has(name) || builtInScalarsFallback.has(name)) {
    throw new Error(
      `Type name "${name}" conflicts with a built-in scalar type.`,
    );
  }
}

function normalizeDirectiveLocations(
  locations: (DirectiveLocation | string)[],
): DirectiveLocation[] {
  const normalized = locations.map((location) => {
    if (typeof location !== "string") {
      return location;
    }
    const key = location as keyof typeof DirectiveLocation;
    if (!(key in DirectiveLocation)) {
      throw new Error(`Unknown directive location "${location}".`);
    }
    return DirectiveLocation[key];
  });
  const seen = new Set<DirectiveLocation>();
  for (const location of normalized) {
    if (seen.has(location)) {
      throw new Error(`Directive location "${location}" cannot be repeated.`);
    }
    seen.add(location);
  }
  return normalized;
}

/**
 * Normalizes directive locations and creates a directive definition.
 */
export function normalizeDirectiveDefinition(
  state: SchemaState,
  name: string,
  locations: (DirectiveLocation | string)[],
  repeatable = false,
  description?: string,
): DirectiveDefinition {
  const normalizedLocations = normalizeDirectiveLocations(locations);
  return createDirectiveDefinition(
    state,
    name,
    normalizedLocations,
    repeatable,
    description,
  );
}
