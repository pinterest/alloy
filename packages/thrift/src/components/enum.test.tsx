import { toSourceText } from "#test/utils.jsx";
import { d } from "@alloy-js/core/testing";
import { describe, expect, it } from "vitest";
import { Enum, EnumValue } from "../index.js";

describe("Enum", () => {
  it("renders enum values with explicit assignments", () => {
    const text = toSourceText(
      <Enum name="Color">
        <EnumValue name="RED" value={1} />
        <EnumValue name="GREEN" />
        <EnumValue name="BLUE" value={3} />
      </Enum>,
    );

    expect(text).toBe(d`
      enum Color {
        RED = 1,
        GREEN,
        BLUE = 3
      }
    `);
  });

  it("rejects duplicate enum value names", () => {
    expect(() =>
      toSourceText(
        <Enum name="Color">
          <EnumValue name="RED" />
          <EnumValue name="RED" />
        </Enum>,
      ),
    ).toThrow("Enum has duplicate value 'RED'.");
  });
});
