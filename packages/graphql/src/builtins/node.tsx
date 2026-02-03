import { refkey } from "@alloy-js/core";

/**
 * Refkey for the canonical `Node` interface.
 * Kept in builtins to provide a shared identity without pulling in JSX helpers.
 */
export const Node = refkey("Node");
