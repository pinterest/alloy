import { Children, For, Show, createSymbolSlot, memo } from "@alloy-js/core";
import { ValueExpression } from "./ValueExpression.js";

export interface DirectiveProps {
  /**
   * The directive name. Can be a string or refkey for built-in directives.
   */
  name: Children;
  /**
   * Arguments for the directive as key-value pairs
   */
  args?: Record<string, unknown>;
}

/**
 * A GraphQL directive that can be applied to fields, types, arguments, etc.
 *
 * @example
 * ```tsx
 * import { builtInDirectives } from "@alloy-js/graphql";
 *
 * <>
 *   <Directive name={builtInDirectives.deprecated} />
 *   <Directive
 *     name={builtInDirectives.deprecated}
 *     args={{ reason: "Use newField instead" }}
 *   />
 *   <Directive name="auth" args={{ requires: "ADMIN" }} />
 *   <Directive
 *     name="rateLimit"
 *     args={{
 *       max: 100,
 *       window: 60,
 *       scopes: ["api", "admin"]
 *     }}
 *   />
 *   <Directive name={customDirectiveRef} args={{ enabled: true }} />
 * </>
 * ```
 * renders to:
 * ```graphql
 * @deprecated
 * @deprecated(reason: "Use newField instead")
 * @auth(requires: "ADMIN")
 * @rateLimit(max: 100, window: 60, scopes: ["api", "admin"])
 * @customDirective(enabled: true)
 * ```
 */
export function Directive(props: DirectiveProps) {
  const NameSlot = createSymbolSlot();

  const hasArgs = props.args && Object.keys(props.args).length > 0;
  const argEntries = memo(() => (hasArgs ? Object.entries(props.args!) : []));

  return (
    <>
      {" "}
      @<NameSlot>{props.name}</NameSlot>
      <Show when={hasArgs}>
        (
        <For each={argEntries} comma space>
          {([key, value]) => (
            <>
              {key}: <ValueExpression jsValue={value} />
            </>
          )}
        </For>
        )
      </Show>
    </>
  );
}
