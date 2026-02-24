import { Children, createNamedContext, useContext } from "@alloy-js/core";
import { useThriftNamePolicy } from "../name-policy.js";
import {
  renderAnnotations,
  renderConstValue,
  renderTypeRef,
} from "../render.js";
import type { AnnotationMap, ConstValue, TypeRef } from "../types.js";
import { DocWhen } from "./DocComment.js";

export interface FieldProps {
  id?: number;
  required?: boolean;
  type: TypeRef;
  name: string;
  default?: ConstValue;
  annotations?: AnnotationMap;
  doc?: Children;
}

export interface FieldRegistry {
  register(field: { id?: number; name: string; required?: boolean }): void;
  terminator: string;
}

export const FieldContext = createNamedContext<FieldRegistry | undefined>(
  "@alloy-js/thrift FieldContext",
);

export function createFieldRegistry(options: {
  allowRequired: boolean;
  owner: string;
  terminator?: string;
}): FieldRegistry {
  const ids = new Set<number>();
  const names = new Set<string>();

  return {
    register(field) {
      if (field.required && !options.allowRequired) {
        throw new Error(`Union fields cannot be required.`);
      }
      if (field.id !== undefined) {
        if (ids.has(field.id)) {
          throw new Error(
            `${options.owner} has duplicate field id ${field.id}.`,
          );
        }
        ids.add(field.id);
      }
      if (names.has(field.name)) {
        throw new Error(
          `${options.owner} has duplicate field name '${field.name}'.`,
        );
      }
      names.add(field.name);
    },
    terminator: options.terminator ?? ";",
  };
}

/**
 * Define a Thrift field.
 *
 * @remarks
 * Fields must appear within a {@link Struct}, {@link Union}, {@link Exception},
 * or {@link ServiceFunction}. Union fields cannot be `required`.
 *
 * @example Struct field
 * ```tsx
 * <Struct name="User">
 *   <Field id={1} type="i64" name="id" required />
 *   <Field id={2} type="string" name="email" optional />
 * </Struct>
 * ```
 */
export function Field(props: FieldProps) {
  const registry = useContext(FieldContext);
  if (!registry) {
    throw new Error(
      "Field must be used inside a Struct, Union, Exception, or ServiceFunction.",
    );
  }

  const namePolicy = useThriftNamePolicy();
  const name = namePolicy.getName(props.name, "field");

  registry.register({ id: props.id, name, required: props.required });

  const requirement =
    props.required === true ? "required "
    : props.required === false ? "optional "
    : "";
  const defaultValue =
    props.default !== undefined ? ` = ${renderConstValue(props.default)}` : "";
  const annotations = renderAnnotations(props.annotations);
  const annotationText = annotations ? ` ${annotations}` : "";

  const terminator = registry.terminator ?? ";";

  return (
    <>
      <DocWhen doc={props.doc} />
      {props.id !== undefined ? `${props.id}: ` : ""}
      {requirement}
      {renderTypeRef(props.type)} {name}
      {defaultValue}
      {annotationText}
      {terminator}
    </>
  );
}
