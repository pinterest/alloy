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
  /**
   * The numeric field identifier.
   *
   * @remarks
   * Must be a signed 16-bit integer (-32768 to 32767). IDs must be unique
   * within the enclosing struct, union, or exception. When omitted, no ID
   * prefix is emitted.
   */
  id?: number;
  /**
   * Mark the field as required.
   *
   * @remarks
   * Cannot be combined with `optional`. Not allowed in unions.
   */
  required?: true;
  /**
   * Mark the field as optional.
   *
   * @remarks
   * Cannot be combined with `required`.
   */
  optional?: true;
  /** The Thrift type of this field. */
  type: TypeRef;
  /** The field name. */
  name: string;
  /** A default value for the field, rendered after `=`. */
  default?: ConstValue;
  /** Annotations appended after the field. */
  annotations?: AnnotationMap;
  /** Doc comment rendered above the field. */
  doc?: Children;
  /** Inline comment appended after the field on the same line. */
  comment?: Children;
}

/**
 * Registry that validates field declarations within a struct-like container.
 *
 * @remarks
 * Created by {@link createFieldRegistry} and provided via {@link FieldContext}.
 * Each {@link Field} component calls `register` to validate its ID and name
 * against the registry's constraints.
 */
export interface FieldRegistry {
  /** Register a field, validating its ID and name for uniqueness. */
  register(field: { id?: number; name: string; required?: true }): void;
  /** The punctuation character appended after each field (`,` or `;`). */
  terminator: string;
}

export const FieldContext = createNamedContext<FieldRegistry | undefined>(
  "@alloy-js/thrift FieldContext",
);

const MIN_I16 = -32768;
const MAX_I16 = 32767;

/**
 * Create a field registry that validates field declarations.
 *
 * @remarks
 * The registry enforces uniqueness of field IDs and names, validates that IDs
 * fall within the signed 16-bit range, and optionally rejects `required` fields
 * (for unions).
 *
 * @param options - Configuration for the registry. Properties:
 *
 *   - `allowRequired` — whether `required` fields are permitted.
 *
 *   - `owner` — a descriptive name for error messages (e.g. `"struct"`, `"union"`).
 *
 *   - `terminator` — the character appended after each field (defaults to `";"`).
 *
 * @returns A {@link FieldRegistry} instance.
 */
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
        throw new Error(`Required fields are not allowed in ${options.owner}.`);
      }
      if (field.id !== undefined) {
        if (
          !Number.isInteger(field.id) ||
          field.id < MIN_I16 ||
          field.id > MAX_I16
        ) {
          throw new Error(
            `Field id ${field.id} is out of range; must be between ${MIN_I16} and ${MAX_I16}.`,
          );
        }
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
 * or {@link ServiceFunction}. The enclosing component provides a field registry
 * that validates IDs and names for uniqueness.
 *
 * Union fields cannot be `required`. A field cannot be both `required` and
 * `optional` at the same time.
 *
 * @example Struct fields with requiredness
 * ```tsx
 * <Struct name="User">
 *   <Field id={1} type={i64} name="id" required />
 *   <Field id={2} type={string} name="email" optional />
 *   <Field id={3} type={string} name="name" />
 * </Struct>
 * ```
 *
 * Produces:
 * ```thrift
 * struct User {
 *   1: required i64 id,
 *   2: optional string email,
 *   3: string name,
 * }
 * ```
 *
 * @example Field with default value
 * ```tsx
 * <Field id={1} type={i32} name="retries" default={3} />
 * ```
 *
 * Produces:
 * ```thrift
 * 1: i32 retries = 3,
 * ```
 */
export function Field(props: FieldProps) {
  const registry = useContext(FieldContext);
  if (!registry) {
    throw new Error(
      "Field must be used inside a Struct, Union, Exception, or ServiceFunction.",
    );
  }

  if (props.required !== undefined && props.required !== true) {
    throw new Error("Field 'required' must be true when provided.");
  }
  if (props.optional !== undefined && props.optional !== true) {
    throw new Error("Field 'optional' must be true when provided.");
  }
  if (props.required && props.optional) {
    throw new Error("Field cannot be both required and optional.");
  }

  const namePolicy = useThriftNamePolicy();
  const name = namePolicy.getName(props.name, "field");

  registry.register({ id: props.id, name, required: props.required });

  const requirement =
    props.required ? "required "
    : props.optional ? "optional "
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
      {props.comment ?
        <>
          <lineSuffix>
            {"  // "}
            {props.comment}
          </lineSuffix>
          <lineSuffixBoundary />
        </>
      : null}
    </>
  );
}
