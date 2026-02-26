import { toSourceText } from "#test/utils.jsx";
import { d } from "@alloy-js/core/testing";
import { describe, expect, it } from "vitest";
import {
  Const,
  constRef,
  i32,
  listOf,
  mapEntries,
  mapOf,
  rawConst,
  string,
} from "../index.js";

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

  it("renders mapEntries as a map literal", () => {
    const text = toSourceText(
      <Const
        name="Defaults"
        type={mapOf(string, i32)}
        value={mapEntries([
          ["timeout", 30],
          ["retries", 3],
        ])}
      />,
    );

    expect(text).toBe(d`
      const map<string, i32> Defaults = { "timeout" : 30 , "retries" : 3 }
    `);
  });

  it("renders arrays of two-element arrays as lists, not maps", () => {
    const text = toSourceText(
      <Const
        name="Pairs"
        type={listOf(listOf(i32))}
        value={[
          [1, 2],
          [3, 4],
        ]}
      />,
    );

    expect(text).toBe(d`
      const list<list<i32>> Pairs = [ [ 1 , 2 ] , [ 3 , 4 ] ]
    `);
  });

  it("escapes control characters in string values", () => {
    const text = toSourceText(
      <Const
        name="Msg"
        type={string}
        value={'line1\nline2\ttab\r"quoted"\\'}
      />,
    );

    expect(text).toBe(d`
      const string Msg = "line1\\nline2\\ttab\\r\\"quoted\\"\\\\"
    `);
  });

  it("renders constRef as an unquoted name", () => {
    const text = toSourceText(
      <Const name="Limit" type={i32} value={constRef("shared.MAX_SIZE")} />,
    );

    expect(text).toBe(d`
      const i32 Limit = shared.MAX_SIZE
    `);
  });

  it("renders rawConst as an unquoted literal", () => {
    const text = toSourceText(
      <Const name="Mask" type={i32} value={rawConst("0xFF")} />,
    );

    expect(text).toBe(d`
      const i32 Mask = 0xFF
    `);
  });
});
