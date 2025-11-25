import { describe, expect, it } from "vitest";
import { builtInScalarNames, builtInScalars } from "../src/builtins/scalars.js";

describe("Built-in Scalars", () => {
  it("exports scalars as string constants", () => {
    expect(builtInScalars.Int).toBe("Int");
    expect(builtInScalars.Float).toBe("Float");
    expect(builtInScalars.String).toBe("String");
    expect(builtInScalars.Boolean).toBe("Boolean");
    expect(builtInScalars.ID).toBe("ID");
  });

  it("has all expected scalar names", () => {
    expect(builtInScalarNames).toEqual([
      "Int",
      "Float",
      "String",
      "Boolean",
      "ID",
    ]);
  });
});
