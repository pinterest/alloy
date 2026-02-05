import {
  childrenArray,
  findKeyedChild,
  findKeyedChildren,
  isKeyedChild,
  isNamekey,
  isRefkeyable,
  namekey,
  taggedComponent,
  toRefkey,
  type Children,
  type Component,
  type ComponentCreator,
  type Refkey,
} from "@alloy-js/core";
import { DirectiveLocation } from "graphql";
import pluralize from "pluralize";
import { Int } from "../builtins/graphql.js";
import { useConnectionOptions } from "../connection-options.js";
import { isRelayNamePolicy } from "../name-policy.js";
import {
  ArgTargetContext,
  DirectiveTargetContext,
  addFieldToType,
  createFieldDefinition,
  resolveDeprecationReason,
  useSchemaContext,
  useTypeContext,
  type DeprecatedProps,
  type NameInput,
  type TypeReference,
} from "../schema.js";
import {
  applyNonNullType,
  extractNamedTypeName,
  isTypeRef,
} from "../schema/refs.js";
import type { SchemaState } from "../schema/types.js";
import { Connection } from "./Connection.js";
import { InputValue } from "./InputValue.js";
import { createListSlot } from "./ListSlot.js";

export interface FieldProps extends DeprecatedProps {
  name: NameInput;
  type: TypeReference;
  nonNull?: boolean;
  description?: string;
  children?: Children;
}

function FieldBase(props: FieldProps) {
  const state = useSchemaContext();
  const typeDefinition = useTypeContext();
  if (typeDefinition.kind !== "object" && typeDefinition.kind !== "interface") {
    throw new Error(
      "Field must be used within an ObjectType or InterfaceType.",
    );
  }

  const children = childrenArray(() => props.children);
  const listSlot = fieldList.findListSlot(children, "Field");
  const connectionSlot = findKeyedChild(
    children,
    fieldConnectionTag,
  ) as ComponentCreator<FieldConnectionProps> | null;
  const connectionSlots = findKeyedChildren(
    children,
    fieldConnectionTag,
  ) as ComponentCreator<FieldConnectionProps>[];
  if (connectionSlots.length > 1) {
    throw new Error("Field only supports a single Field.Connection child.");
  }

  if (connectionSlot) {
    const baseName = unwrapNameInput(props.name);
    if (listSlot) {
      throw new Error("Field.Connection cannot be combined with Field.List.");
    }
    const connectionChildren = childrenArray(
      () => connectionSlot.props.children,
    );
    const edgeChildren = findKeyedChildren(
      connectionChildren,
      Connection.Edge.tag,
    );
    const pageInfoChildren = findKeyedChildren(
      connectionChildren,
      Connection.PageInfo.tag,
    );
    if (edgeChildren.length > 0 || pageInfoChildren.length > 0) {
      throw new Error(
        "Field.Connection only supports Connection.Fields. Define a Connection type to customize edges or pageInfo.",
      );
    }
    const hasDisallowedConnectionChildren = connectionChildren.some((child) => {
      if (!isKeyedChild(child)) {
        return true;
      }
      return child.tag !== Connection.Fields.tag;
    });
    if (hasDisallowedConnectionChildren) {
      throw new Error(
        "Field.Connection only supports Connection.Fields children. Place field arguments on Field instead.",
      );
    }

    const pagination = useConnectionOptions();
    const fieldName =
      connectionSlot.props.fieldName ??
      deriveNameInput(props.name, "Connection");
    const rootTypeNames = resolveRootTypeNames(state);
    const isRootType =
      typeDefinition.kind === "object" &&
      rootTypeNames.has(typeDefinition.name);
    const defaultConnectionName = `${capitalize(
      pluralize(baseName),
    )}Connection`;
    const connectionType =
      connectionSlot.props.type ??
      (isRootType ?
        defaultConnectionName
      : `${typeDefinition.name}${defaultConnectionName}`);
    const fieldType = applyNonNullType(connectionType, props.nonNull);
    const field = createFieldDefinition(
      state,
      fieldName,
      fieldType,
      props.description,
      resolveDeprecationReason(props),
    );
    addFieldToType(typeDefinition, field);

    let connectionDefinition: Children | null = null;
    const connectionRefkeys = resolveConnectionRefkeys(
      connectionSlot.props.type,
    );
    const connectionTypeName =
      extractNamedTypeName(state, connectionType) ??
      (typeof connectionType === "string" ? connectionType : undefined);
    if (!connectionTypeName) {
      if (connectionRefkeys.length > 0) {
        throw new Error(
          "Field.Connection cannot refkey auto-generated connection types. Define a Connection type instead.",
        );
      }
      throw new Error(
        "Field.Connection requires a named connection type to define connection types.",
      );
    }
    const connectionSuffix = "Connection";
    const hasConnectionSuffix = connectionTypeName
      .toLowerCase()
      .endsWith(connectionSuffix.toLowerCase());
    if (state.types.has(connectionTypeName)) {
      if (connectionChildren.length > 0) {
        throw new Error(
          "Field.Connection cannot add Connection.Fields when the connection type already exists. Define a Connection type instead.",
        );
      }
      if (isRelayNamePolicy(state.namePolicy) && !hasConnectionSuffix) {
        throw new Error(
          `Connection type name "${connectionTypeName}" must end with "Connection".`,
        );
      }
    } else {
      if (!hasConnectionSuffix) {
        throw new Error(
          `Connection type name "${connectionTypeName}" must end with "Connection".`,
        );
      }
      if (connectionRefkeys.length > 0) {
        throw new Error(
          "Field.Connection cannot refkey auto-generated connection types. Define a Connection type instead.",
        );
      }
      const connectionName = connectionTypeName.slice(
        0,
        -connectionSuffix.length,
      );
      connectionDefinition = (
        <Connection name={connectionName} type={props.type}>
          {connectionChildren.length > 0 ? connectionChildren : null}
        </Connection>
      );
    }

    const fieldChildren = children.filter((child) => {
      if (!isKeyedChild(child)) {
        return true;
      }
      return child.tag !== fieldListTag && child.tag !== fieldConnectionTag;
    });

    return (
      <DirectiveTargetContext.Provider
        value={{
          location: DirectiveLocation.FIELD_DEFINITION,
          directives: field.directives,
          target: field,
        }}
      >
        <ArgTargetContext.Provider
          value={{ args: field.args, argNames: field.argNames }}
        >
          {pagination.forward ?
            <>
              <InputValue name="after" type={pagination.cursorType} />
              <InputValue name="first" type={Int} />
            </>
          : null}
          {pagination.backward ?
            <>
              <InputValue name="before" type={pagination.cursorType} />
              <InputValue name="last" type={Int} />
            </>
          : null}
          {fieldChildren.length > 0 ? fieldChildren : null}
        </ArgTargetContext.Provider>
        {connectionDefinition}
      </DirectiveTargetContext.Provider>
    );
  }

  const type = resolveFieldType(props.type, props.nonNull, listSlot);
  const field = createFieldDefinition(
    state,
    props.name,
    type,
    props.description,
    resolveDeprecationReason(props),
  );
  addFieldToType(typeDefinition, field);

  return (
    <DirectiveTargetContext.Provider
      value={{
        location: DirectiveLocation.FIELD_DEFINITION,
        directives: field.directives,
        target: field,
      }}
    >
      <ArgTargetContext.Provider
        value={{ args: field.args, argNames: field.argNames }}
      >
        {children.filter((child) => {
          if (!isKeyedChild(child)) {
            return true;
          }
          return child.tag !== fieldListTag;
        })}
      </ArgTargetContext.Provider>
    </DirectiveTargetContext.Provider>
  );
}

export interface FieldListProps {
  nonNull?: boolean;
  children?: Children;
}

export interface FieldConnectionProps {
  type?: TypeReference;
  fieldName?: NameInput;
  children?: Children;
}

const fieldList = createListSlot<FieldListProps>({
  listName: "Field.List",
});
const fieldListTag = fieldList.tag;
const FieldListSlot = fieldList.List;
const fieldConnectionTag = Symbol("Field.Connection");
const FieldConnectionSlot = taggedComponent(
  fieldConnectionTag,
  (_props: FieldConnectionProps) => undefined,
);

export interface FieldComponent {
  (props: FieldProps): Children;
  List: Component<FieldListProps> &
    Required<Pick<Component<FieldListProps>, "tag">>;
  Connection: Component<FieldConnectionProps> &
    Required<Pick<Component<FieldConnectionProps>, "tag">>;
}

/**
 * Adds a field to the nearest `ObjectType` or `InterfaceType`.
 *
 * @example
 * ```tsx
 * <ObjectType name="User">
 *   <Field name="id" type={ID} nonNull />
 *   <Field name="name" type={String} />
 * </ObjectType>
 * ```
 *
 * @example List field
 * ```tsx
 * <Field name="tags" type={String}>
 *   <Field.List />
 * </Field>
 * ```
 *
 * @example Connection field
 * ```tsx
 * <Field name="users" type={User}>
 *   <Field.Connection />
 * </Field>
 * ```
 *
 * @remarks
 * Use `Field.List` for list types or `Field.Connection` to define a Relay-style
 * connection. A `Field.Connection` child cannot be combined with `Field.List`.
 * The `nonNull` prop controls whether the field's type is wrapped in `Non-Null`.
 * When using `Field.List`, `nonNull` applies to the list items while
 * `Field.List`'s `nonNull` applies to the list itself.
 */
export function Field(props: FieldProps) {
  return FieldBase(props);
}

/**
 * Marks the field type as a list.
 *
 * @example
 * ```tsx
 * <Field name="items" type={Item}>
 *   <Field.List />
 * </Field>
 * ```
 */
Field.List = FieldListSlot;
/**
 * Declares a connection field and optionally defines the connection type.
 *
 * @example
 * ```tsx
 * <Field name="users" type={User}>
 *   <Field.Connection />
 * </Field>
 * ```
 *
 * @remarks
 * Define connection arguments on `Field` and use `Connection.Fields` to add
 * additional fields to the generated connection type.
 */
Field.Connection = FieldConnectionSlot;

function resolveFieldType(
  type: TypeReference,
  itemNonNull: boolean | undefined,
  listSlot: ReturnType<typeof fieldList.findListSlot>,
): TypeReference {
  const baseType = applyNonNullType(type, itemNonNull);
  return fieldList.applyListType(baseType, listSlot);
}

function capitalize(value: string): string {
  if (value.length === 0) {
    return value;
  }
  return value[0].toUpperCase() + value.slice(1);
}

function resolveRootTypeNames(state: SchemaState): Set<string> {
  const rootNames = new Set<string>();
  const queryRef =
    state.schema.query ?? (state.types.has("Query") ? "Query" : undefined);
  const queryName =
    queryRef ? extractNamedTypeName(state, queryRef) : undefined;
  if (queryName) {
    rootNames.add(queryName);
  }
  const mutationName =
    state.schema.mutation ?
      extractNamedTypeName(state, state.schema.mutation)
    : undefined;
  if (mutationName) {
    rootNames.add(mutationName);
  }
  const subscriptionName =
    state.schema.subscription ?
      extractNamedTypeName(state, state.schema.subscription)
    : undefined;
  if (subscriptionName) {
    rootNames.add(subscriptionName);
  }
  return rootNames;
}

function resolveConnectionRefkeys(connectionType?: TypeReference): Refkey[] {
  if (!connectionType) {
    return [];
  }
  if (isRefkeyable(connectionType)) {
    return [toRefkey(connectionType)];
  }
  if (
    isTypeRef(connectionType) &&
    connectionType.kind === "named" &&
    isRefkeyable(connectionType.name)
  ) {
    return [toRefkey(connectionType.name)];
  }
  return [];
}

function unwrapNameInput(value: NameInput): string {
  return isNamekey(value) ? value.name : value;
}

function deriveNameInput(base: NameInput, suffix: string): NameInput {
  if (isNamekey(base)) {
    return namekey(`${base.name}${suffix}`, { ...base.options });
  }
  return `${base}${suffix}`;
}
