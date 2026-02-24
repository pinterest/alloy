import { toSourceText } from "#test/utils.jsx";
import { d } from "@alloy-js/core/testing";
import { describe, expect, it } from "vitest";
import { Const, i32, listOf, mapOf, string } from "../index.js";

describe("Const", () => {
  it("renders scalar, list, and map constants", () => {
    const text = toSourceText(
      <>
        <Const name="MaxRetries" type={i32} value={3} />
        <Const name="Ports" type={listOf(i32)} value={[80, 443]} />
        <Const
          name="Settings"
          type={mapOf(string, string)}
          value={{ host: "localhost", mode: "dev" }}
        />
      </>,
    );

    expect(text).toBe(d`
      const i32 MaxRetries = 3

      const list<i32> Ports = [ 80 , 443 ]

      const map<string, string> Settings = { "host" : "localhost" , "mode" : "dev" }
    `);
  });
});
