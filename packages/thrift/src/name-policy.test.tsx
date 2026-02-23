import { describe, expect, it } from "vitest";
import { createThriftNamePolicy } from "./name-policy.js";

describe("Thrift name policy", () => {
  it("rejects reserved words", () => {
    const policy = createThriftNamePolicy();

    expect(() => policy.getName("struct", "type")).toThrow(
      "Thrift identifier 'struct' is a reserved word and cannot be used for type.",
    );
    expect(() => policy.getName("service", "service")).toThrow(
      "Thrift identifier 'service' is a reserved word and cannot be used for service.",
    );
  });

  it("rejects invalid identifiers", () => {
    const policy = createThriftNamePolicy();

    expect(() => policy.getName("1bad", "type")).toThrow(
      "Invalid Thrift identifier '1bad'.",
    );
    expect(() => policy.getName("has-dash", "type")).toThrow(
      "Invalid Thrift identifier 'has-dash'.",
    );
  });

  it("applies formatter before validation", () => {
    const policy = createThriftNamePolicy({
      format: (name) => name.toUpperCase(),
    });

    expect(policy.getName("user", "type")).toBe("USER");
  });
});
