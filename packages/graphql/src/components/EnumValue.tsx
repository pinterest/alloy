import {
  addEnumValueToType,
  createEnumValueDefinition,
  resolveDeprecationReason,
  useSchemaContext,
  useTypeContext,
  type DeprecatedProps,
} from "../schema.js";

export interface EnumValueProps extends DeprecatedProps {
  name: string;
  description?: string;
}

/**
 * Adds a value to the nearest `EnumType`.
 *
 * @example
 * ```tsx
 * <EnumType name="Role">
 *   <EnumValue name="ADMIN" />
 * </EnumType>
 * ```
 *
 * @remarks
 * This component must be used within an `EnumType`.
 */
export function EnumValue(props: EnumValueProps) {
  const state = useSchemaContext();
  const typeDefinition = useTypeContext();
  if (typeDefinition.kind !== "enum") {
    throw new Error("EnumValue must be used within an EnumType.");
  }

  const value = createEnumValueDefinition(
    state,
    props.name,
    props.description,
    resolveDeprecationReason(props),
  );
  addEnumValueToType(typeDefinition, value);
  return undefined;
}
