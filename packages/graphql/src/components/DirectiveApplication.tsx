import { Children, For, Show, createSymbolSlot, memo } from "@alloy-js/core";
import { ValueExpression } from "./ValueExpression.js";

export interface DirectiveApplicationProps {
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
 * A GraphQL directive application that can be applied to fields, types, arguments, etc.
 *
 * @example
 * ```tsx
 * import { builtInDirectives } from "@alloy-js/graphql";
 *
 * <>
 *   <DirectiveApplication name={builtInDirectives.deprecated} />
 *   <DirectiveApplication
 *     name={builtInDirectives.deprecated}
 *     args={{ reason: "Use newField instead" }}
 *   />
 *   <DirectiveApplication name="auth" args={{ requires: "ADMIN" }} />
 *   <DirectiveApplication
 *     name="rateLimit"
 *     args={{
 *       max: 100,
 *       window: 60,
 *       scopes: ["api", "admin"]
 *     }}
 *   />
 *   <DirectiveApplication name={customDirectiveRef} args={{ enabled: true }} />
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
export function DirectiveApplication(props: DirectiveApplicationProps) {
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
