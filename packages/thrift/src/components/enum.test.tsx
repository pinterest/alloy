import { toSourceText } from "#test/utils.jsx";
import { d } from "@alloy-js/core/testing";
import { describe, expect, it } from "vitest";
import { Enum, EnumValue } from "../index.js";

describe("Enum", () => {
  it("renders enum values with explicit assignments", () => {
    const text = toSourceText(
      <Enum name="Color">
        <EnumValue name="RED" value={1} />
        <EnumValue name="GREEN" value={2} />
        <EnumValue name="BLUE" value={3} />
      </Enum>,
    );

    expect(text).toBe(d`
      enum Color {
        RED = 1,
        GREEN = 2,
        BLUE = 3,
      }
    `);
  });

  it("rejects duplicate enum value names", () => {
    expect(() =>
      toSourceText(
        <Enum name="Color">
          <EnumValue name="RED" value={1} />
          <EnumValue name="RED" value={2} />
        </Enum>,
      ),
    ).toThrow("Enum has duplicate value 'RED'.");
  });

  it("rejects missing enum value numbers", () => {
    expect(() =>
      toSourceText(
        <Enum name="Color">
          {/* @ts-expect-error value is required */}
          <EnumValue name="RED" />
        </Enum>,
      ),
    ).toThrow("Enum value 'RED' must be an integer.");
  });

  it("rejects duplicate enum value numbers", () => {
    expect(() =>
      toSourceText(
        <Enum name="Color">
          <EnumValue name="RED" value={1} />
          <EnumValue name="GREEN" value={1} />
        </Enum>,
      ),
    ).toThrow("Enum has duplicate value number 1.");
  });

  it("rejects enum values outside int32 range", () => {
    expect(() =>
      toSourceText(
        <Enum name="Color">
          <EnumValue name="RED" value={2147483648} />
        </Enum>,
      ),
    ).toThrow("Enum value 'RED' must be a 32-bit signed integer.");
  });
});
