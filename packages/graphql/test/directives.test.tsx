/** @jsxImportSource @alloy-js/core */
import { describe, expect, it } from "vitest";
import {
  builtInDirectiveNames,
  builtInDirectives,
} from "../src/builtins/directives.js";

describe("Built-in Directives", () => {
  it("has all expected directive names", () => {
    expect(builtInDirectiveNames).toEqual([
      "deprecated",
      "skip",
      "include",
      "specifiedBy",
    ]);
  });

  it("exports directives as string constants", () => {
    expect(builtInDirectives.deprecated).toBe("deprecated");
    expect(builtInDirectives.skip).toBe("skip");
    expect(builtInDirectives.include).toBe("include");
    expect(builtInDirectives.specifiedBy).toBe("specifiedBy");
  });
});
