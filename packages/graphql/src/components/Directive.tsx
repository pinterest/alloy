import {
  Children,
  createSymbolSlot,
  For,
  isRefkey,
  memo,
  Refkey,
  Show,
} from "@alloy-js/core";
import { ref } from "../symbols/reference.js";
import { runDirectiveValidation } from "./Directives.js";
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
 * \@deprecated
 * \@deprecated(reason: "Use newField instead")
 * \@auth(requires: "ADMIN")
 * \@rateLimit(max: 100, window: 60, scopes: ["api", "admin"])
 * \@customDirective(enabled: true)
 * ```
 */
export function Directive(props: DirectiveProps) {
  const NameSlot = createSymbolSlot();

  // Extract directive name for validation
  const directiveName = extractDirectiveName(props.name);
  if (directiveName) {
    runDirectiveValidation(directiveName, props.args);
  }

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

/**
 * Extracts the directive name from a Children value
 */
function extractDirectiveName(name: Children): string | null {
  // If name is a refkey, resolve it
  if (isRefkey(name)) {
    const reference = ref(name as Refkey);
    const [resolvedName] = reference();
    return String(resolvedName);
  }

  // If name is a string, return it directly
  if (typeof name === "string") {
    return name;
  }

  return null;
}
