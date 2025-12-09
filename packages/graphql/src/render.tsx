import {
  Children,
  OutputDirectory,
  PrintTreeOptions,
  render,
} from "@alloy-js/core";
import {
  clearValidationRegistry,
  collectValidationErrors,
} from "./components/SourceFile.js";

/**
 * Renders GraphQL content and runs schema validation.
 *
 * Automatically validates interface implementations and other schema rules
 * after rendering is complete. Returns both the rendered output and any
 * validation errors for programmatic handling.
 *
 * Validation state is managed by each SourceFile component, so validation
 * works regardless of whether you use this function or plain `render()`.
 * This function simply aggregates errors from all rendered SourceFile components.
 *
 * @param children - The GraphQL content to render (typically SourceFile components)
 * @param options - Print options for formatting the output
 * @returns An object with the rendered output and any validation errors
 */
export function renderGraphQLWithErrors(
  children: Children,
  options?: PrintTreeOptions,
): { output: OutputDirectory; errors: Error[] } {
  // Clear any previous validation state
  clearValidationRegistry();

  // Render children - each SourceFile will register its own validation state
  const output = render(children, options);

  // Collect and run validations from all rendered SourceFile components
  const errors = collectValidationErrors();

  return { output, errors };
}
