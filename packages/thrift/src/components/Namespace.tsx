import { Children, Show } from "@alloy-js/core";
import { useThriftNamePolicy } from "../name-policy.js";
import { DocWhen } from "./DocComment.js";

export interface NamespaceProps {
  lang: string;
  value: string;
  doc?: Children;
}

/**
 * Emit a Thrift namespace directive.
 *
 * @remarks
 * Use `lang="*"` to declare the default namespace for all languages.
 *
 * @example Namespace
 * ```tsx
 * <Namespace lang="java" value="com.example.api" />
 * ```
 */
export function Namespace(props: NamespaceProps) {
  const namePolicy = useThriftNamePolicy();
  const lang = props.lang === "*" ? "*" : props.lang;
  const value = namePolicy.getName(props.value, "namespace");

  return (
    <>
      <DocWhen doc={props.doc} />
      namespace {lang} {value}
    </>
  );
}
