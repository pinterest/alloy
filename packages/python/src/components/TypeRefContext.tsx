import type { Children, Component } from "@alloy-js/core";
import {
  isTypeRefContext,
  TypeRefContextDef,
} from "../context/type-ref-context.js";

// Re-export for external use
export { isTypeRefContext };

export interface TypeRefContextProps {
  /**
   * Children
   */
  children: Children;
}

/**
 * Set the current context of reference to be type reference.
 *
 * @remarks
 * References used inside the children of this component will be treated as
 * type-only references. When a symbol is only referenced in type contexts,
 * it will be imported inside a `if TYPE_CHECKING:` block.
 *
 * Prefer using {@link ensureTypeRefContext} when wrapping the whole component
 * to reduce tree nodes.
 *
 * @example
 * ```tsx
 * <TypeRefContext>
 *   {someTypeRefkey}
 * </TypeRefContext>
 * ```
 */
export const TypeRefContext = ({ children }: TypeRefContextProps) => {
  return (
    <TypeRefContextDef.Provider value>
      {children}
    </TypeRefContextDef.Provider>
  );
};

/**
 * Ensure the current component is inside a type ref context.
 * If not it will wrap in a {@link TypeRefContext} component.
 * If yes it will not add an extra node and return the original component.
 *
 * This is useful for components that render type annotations, such as
 * return types or parameter types.
 *
 * @example
 * ```tsx
 * const MyTypeComponent = ensureTypeRefContext((props: MyProps) => {
 *   return <>{props.typeRefkey}</>;
 * });
 * ```
 */
export function ensureTypeRefContext<TProps>(
  Comp: Component<TProps>,
): (props: TProps) => Children {
  return (props: TProps) => {
    const ref = isTypeRefContext();
    if (!ref) {
      return (
        <TypeRefContextDef.Provider value>
          <Comp {...props} />
        </TypeRefContextDef.Provider>
      );
    }

    return <Comp {...props} />;
  };
}

