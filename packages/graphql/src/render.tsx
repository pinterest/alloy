import {
  Children,
  OutputDirectory,
  PrintTreeOptions,
  render,
} from "@alloy-js/core";
import {
  getValidationErrors,
  resetValidationState,
  runPendingValidations,
} from "./components/DeferredInterfaceValidation.js";

/**
 * Renders GraphQL content and runs schema validation.
 *
 * Automatically validates interface implementations and other schema rules
 * after rendering is complete. Returns both the rendered output and any
 * validation errors for programmatic handling.
 *
 * @param children - The GraphQL content to render (typically SourceFile components)
 * @param options - Print options for formatting the output
 * @returns An object with the rendered output and any validation errors
 */
export function renderGraphQLWithErrors(
  children: Children,
  options?: PrintTreeOptions,
): { output: OutputDirectory; errors: Error[] } {
  resetValidationState();
  const output = render(children, options);
  runPendingValidations();
  return { output, errors: getValidationErrors() };
}
