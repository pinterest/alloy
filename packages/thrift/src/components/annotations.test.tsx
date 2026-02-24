import { toSourceText } from "#test/utils.jsx";
import { d } from "@alloy-js/core/testing";
import { describe, expect, it } from "vitest";
import * as thrift from "../index.js";

describe("Annotations", () => {
  it("renders sorted annotations for types and fields", () => {
    const text = toSourceText(
      <thrift.Struct name="Tagged">
        <thrift.Field
          id={1}
          type={thrift.listOf("string", { max: 4, min: 1 })}
          name="items"
          annotations={{ zed: true, alpha: "first" }}
        />
      </thrift.Struct>,
    );

    expect(text).toBe(d`
      struct Tagged {
        1: list<string> (max=4, min=1) items (alpha="first", zed=true);
      }
    `);
  });
});
