import { Children, createContext, useContext } from "@alloy-js/core";

/**
 * Context to track if we're inside a @oneOf input object
 */
const OneOfInputContext = createContext<boolean>(false);

/**
 * Hook to check if we're inside a @oneOf input object
 */
export function useOneOfInputContext(): boolean {
  return useContext(OneOfInputContext) ?? false;
}

/**
 * Provider component to mark that we're inside a @oneOf input object
 */
export interface OneOfInputProviderProps {
  children: Children;
}

export function OneOfInputProvider(props: OneOfInputProviderProps) {
  return (
    <OneOfInputContext.Provider value={true}>
      {props.children}
    </OneOfInputContext.Provider>
  );
}

/**
 * Checks if a directives prop contains a directive with the given name.
 * This is a simple heuristic check that works for most cases.
 */
export function hasDirective(
  name: string,
  directives: Children | undefined,
): boolean {
  if (!directives) return false;

  if (typeof directives === "object") {
    if (Array.isArray(directives)) {
      return directives.some((d) => hasDirective(name, d));
    }

    const { props } = directives as {
      props?: { name?: string; children?: Children };
    };
    if (props?.name === name) return true;
    if (props?.children) {
      return hasDirective(name, props.children);
    }
  }

  return false;
}

/**
 * Validates that a field type is nullable (doesn't end with !)
 * @param type - The type to check
 * @param fieldName - The field name for error messaging
 * @throws {Error} If the type is non-nullable
 */
export function validateOneOfFieldNullable(
  type: Children,
  fieldName: string,
): void {
  const typeStr = String(type).trim();
  if (typeStr.endsWith("!")) {
    throw new Error(
      `Input field "${fieldName}" in a @oneOf input object must be nullable. ` +
        `Remove the "!" from the type "${typeStr}". `,
    );
  }
}

/**
 * Validates that a field doesn't have a default value
 * @param defaultValue - The default value to check
 * @param fieldName - The field name for error messaging
 * @throws {Error} If a default value is provided
 */
export function validateOneOfFieldNoDefault(
  defaultValue: unknown,
  fieldName: string,
): void {
  if (defaultValue !== undefined) {
    throw new Error(
      `Input field "${fieldName}" in a @oneOf input object cannot have a default value. `,
    );
  }
}
