import { Children } from "@alloy-js/core";
import { renderAnnotations } from "../render.js";
import type { AnnotationMap } from "../types.js";
import { DocWhen } from "./DocComment.js";

export interface NamespaceProps {
  /**
   * The target language or scope identifier.
   *
   * @remarks
   * Use `"*"` for a wildcard namespace that applies to all languages.
   * Common values include `"java"`, `"py"`, `"cpp"`, `"js"`, `"go"`, etc.
   */
  lang: string;
  /** The namespace value (e.g. `"com.example.api"`). */
  value: string;
  /** Optional annotations on the namespace directive. */
  annotations?: AnnotationMap;
  /** Doc comment rendered above the namespace directive. */
  doc?: Children;
  /** Inline comment appended after the namespace directive. */
  comment?: Children;
}

const NAMESPACE_VALUE_REGEX = /^[A-Za-z_][A-Za-z0-9_.]*$/;

/**
 * Emit a Thrift namespace directive.
 *
 * @remarks
 * Namespace directives tell the Thrift compiler which package or module name to
 * use for generated code in each target language. Use `lang="*"` to declare a
 * default namespace for all languages.
 *
 * @example Single language
 * ```tsx
 * <Namespace lang="java" value="com.example.api" />
 * ```
 *
 * Produces:
 * ```thrift
 * namespace java com.example.api
 * ```
 *
 * @example Wildcard namespace
 * ```tsx
 * <Namespace lang="*" value="example.api" />
 * ```
 *
 * Produces:
 * ```thrift
 * namespace * example.api
 * ```
 */
export function Namespace(props: NamespaceProps) {
  const lang = props.lang === "*" ? "*" : props.lang;
  const value = props.value;

  if (!NAMESPACE_VALUE_REGEX.test(value)) {
    throw new Error(`Invalid Thrift namespace value '${value}'.`);
  }
  const annotations = renderAnnotations(props.annotations);
  const annotationText = annotations ? ` ${annotations}` : "";

  return (
    <>
      <DocWhen doc={props.doc} />
      namespace {lang} {value}
      {annotationText}
      {props.comment ?
        <>
          <lineSuffix>
            {" // "}
            {props.comment}
          </lineSuffix>
          <lineSuffixBoundary />
        </>
      : null}
    </>
  );
}
