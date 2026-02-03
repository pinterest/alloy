import { childrenArray, type Children, type Component } from "@alloy-js/core";
import {
  addInputFieldToType,
  createInputFieldDefinition,
  resolveDeprecationReason,
  useSchemaContext,
  useTypeContext,
  type DeprecatedProps,
  type TypeReference,
} from "../schema.js";
import { applyNonNullType } from "../schema/refs.js";
import { createListSlot } from "./ListSlot.js";

export interface InputFieldProps extends DeprecatedProps {
  name: string;
  type: TypeReference;
  nonNull?: boolean;
  description?: string;
  defaultValue?: unknown;
  children?: Children;
}

export interface InputFieldListProps {
  nonNull?: boolean;
  children?: Children;
}

const inputFieldList = createListSlot<InputFieldListProps>({
  listName: "InputField.List",
});
const InputFieldListSlot = inputFieldList.List;

function resolveInputFieldType(
  type: TypeReference,
  itemNonNull: boolean | undefined,
  listSlot: ReturnType<typeof inputFieldList.findListSlot>,
): TypeReference {
  const baseType = applyNonNullType(type, itemNonNull);
  return inputFieldList.applyListType(baseType, listSlot);
}

function InputFieldBase(props: InputFieldProps) {
  const state = useSchemaContext();
  const typeDefinition = useTypeContext();
  if (typeDefinition.kind !== "input") {
    throw new Error("InputField must be used within an InputObjectType.");
  }

  const children = childrenArray(() => props.children);
  const listSlot = inputFieldList.findListSlot(children, "InputField");
  inputFieldList.assertOnlyListChildren(children, "InputField");
  const type = resolveInputFieldType(props.type, props.nonNull, listSlot);
  const field = createInputFieldDefinition(
    state,
    props.name,
    type,
    props.description,
    props.defaultValue,
    resolveDeprecationReason(props),
  );
  addInputFieldToType(typeDefinition, field);
  return undefined;
}

export interface InputFieldComponent {
  (props: InputFieldProps): Children;
  List: Component<InputFieldListProps> &
    Required<Pick<Component<InputFieldListProps>, "tag">>;
}

/**
 * Adds an input field to the nearest `InputObjectType`.
 *
 * @example
 * ```tsx
 * <InputObjectType name="UserFilter">
 *   <InputField name="name" type={String} />
 * </InputObjectType>
 * ```
 *
 * @remarks
 * This component must be used within an `InputObjectType`. Unlike `Field`, it
 * defines input object fields and does not accept arguments.
 */
export function InputField(props: InputFieldProps) {
  return InputFieldBase(props);
}

/**
 * Marks the input field type as a list.
 *
 * @example
 * ```tsx
 * <InputField name="tags" type={String}>
 *   <InputField.List />
 * </InputField>
 * ```
 */
InputField.List = InputFieldListSlot;
