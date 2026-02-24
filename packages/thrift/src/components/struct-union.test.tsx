import { toSourceText } from "#test/utils.jsx";
import { d } from "@alloy-js/core/testing";
import { describe, expect, it } from "vitest";
import * as thrift from "../index.js";

describe("Struct/Union", () => {
  it("renders required and optional fields", () => {
    const text = toSourceText(
      <thrift.Struct name="User">
        <thrift.Field id={1} required type="string" name="name" />
        <thrift.Field id={2} required={false} type="string" name="email" />
        <thrift.Field id={3} type="string" name="nickname" />
      </thrift.Struct>,
    );

    expect(text).toBe(d`
      struct User {
        1: required string name;
        2: optional string email;
        3: string nickname;
      }
    `);
  });

  it("rejects duplicate field ids", () => {
    expect(() =>
      toSourceText(
        <thrift.Struct name="User">
          <thrift.Field id={1} type="string" name="name" />
          <thrift.Field id={1} type="string" name="alias" />
        </thrift.Struct>,
      ),
    ).toThrow("struct has duplicate field id 1.");
  });

  it("rejects required fields on unions", () => {
    expect(() =>
      toSourceText(
        <thrift.Union name="Choice">
          <thrift.Field id={1} required type="string" name="name" />
        </thrift.Union>,
      ),
    ).toThrow("Union fields cannot be required.");
  });
});
