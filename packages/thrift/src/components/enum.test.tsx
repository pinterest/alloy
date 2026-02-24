import { toSourceText } from "#test/utils.jsx";
import { d } from "@alloy-js/core/testing";
import { describe, expect, it } from "vitest";
import * as thrift from "../index.js";

describe("Enum", () => {
  it("renders enum values with explicit assignments", () => {
    const text = toSourceText(
      <thrift.Enum name="Color">
        <thrift.EnumValue name="RED" value={1} />
        <thrift.EnumValue name="GREEN" />
        <thrift.EnumValue name="BLUE" value={3} />
      </thrift.Enum>,
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
        <thrift.Enum name="Color">
          <thrift.EnumValue name="RED" />
          <thrift.EnumValue name="RED" />
        </thrift.Enum>,
      ),
    ).toThrow("Enum has duplicate value 'RED'.");
  });
});
