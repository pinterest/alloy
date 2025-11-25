import { Children, memo } from "@alloy-js/core";

/**
 * Wraps a description string in GraphQL triple-quote format (BlockString).
 *
 * This function:
 * 1. Converts literal \n sequences to actual newlines
 * 2. Trims leading/trailing whitespace
 * 3. Wraps the content in multi-line format: """\ncontent\n"""
 *
 * @param description - The description content to wrap
 * @returns A memoized function that returns the wrapped description or null
 */
export function wrapDescription(description: Children | undefined) {
  return memo(() => {
    if (!description) return null;

    const desc = String(description);
    // Replace literal \n with actual newlines
    const withNewlines = desc.replace(/\\n/g, "\n");
    const trimmed = withNewlines.trim();

    // Always use multi-line format with triple quotes on separate lines
    return `"""\n${trimmed}\n"""`;
  });
}

/**
 * Checks if a type string represents a non-null type (ends with !).
 *
 * @param type - The type string to check
 * @returns true if the type is non-null
 */
export function isNonNullType(type: Children): boolean {
  const typeStr = String(type).trim();
  return typeStr.endsWith("!");
}

/**
 * Validates that a default value is not null for a non-null type.
 *
 * @param type - The type of the argument/input field
 * @param defaultValue - The default value to validate
 * @param name - The name of the argument/input field for error message
 * @param context - Context for error message (e.g., "argument", "input field")
 * @throws {Error} If a null default value is provided for a non-null type
 */
export function validateNonNullDefault(
  type: Children,
  defaultValue: unknown,
  name: string,
  context: string,
): void {
  if (defaultValue === null && isNonNullType(type)) {
    throw new Error(
      `${context} "${name}" has a non-null type but a null default value. Non-null types cannot have null defaults.`,
    );
  }
}
