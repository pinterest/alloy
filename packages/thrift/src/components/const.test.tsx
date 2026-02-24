import { toSourceText } from "#test/utils.jsx";
import { d } from "@alloy-js/core/testing";
import { describe, expect, it } from "vitest";
import * as thrift from "../index.js";

describe("Const", () => {
  it("renders scalar, list, and map constants", () => {
    const text = toSourceText(
      <>
        <thrift.Const name="MaxRetries" type="i32" value={3} />
        <thrift.Const
          name="Ports"
          type={thrift.listOf("i32")}
          value={[80, 443]}
        />
        <thrift.Const
          name="Settings"
          type={thrift.mapOf("string", "string")}
          value={{ host: "localhost", mode: "dev" }}
        />
      </>,
    );

    expect(text).toBe(d`
      const i32 MaxRetries = 3

      const list<i32> Ports = [ 80, 443 ]

      const map<string, string> Settings = { "host": "localhost", "mode": "dev" }
    `);
  });
});
