import { toSourceText } from "#test/utils.jsx";
import { d } from "@alloy-js/core/testing";
import { describe, expect, it } from "vitest";
import {
  Field,
  Struct,
  Typedef,
  Union,
  i32,
  i64,
  listOf,
  string,
} from "../index.js";

describe("Struct/Union", () => {
  it("renders required and optional fields", () => {
    const text = toSourceText(
      <Struct name="User">
        <Field id={1} required type={string} name="name" />
        <Field id={2} optional type={string} name="email" />
        <Field id={3} type={string} name="nickname" />
      </Struct>,
    );

    expect(text).toBe(d`
      struct User {
        1: required string name,
        2: optional string email,
        3: string nickname,
      }
    `);
  });

  it("rejects duplicate field ids", () => {
    expect(() =>
      toSourceText(
        <Struct name="User">
          <Field id={1} type={string} name="name" />
          <Field id={1} type={string} name="alias" />
        </Struct>,
      ),
    ).toThrow("struct has duplicate field id 1.");
  });

  it("rejects field ids outside int16 range", () => {
    expect(() =>
      toSourceText(
        <Struct name="User">
          <Field id={40000} type={string} name="name" />
        </Struct>,
      ),
    ).toThrow(
      "Field id 40000 is out of range; must be between -32768 and 32767.",
    );
  });

  it("rejects required fields on unions", () => {
    expect(() =>
      toSourceText(
        <Union name="Choice">
          <Field id={1} required type={string} name="name" />
        </Union>,
      ),
    ).toThrow("Required fields are not allowed in union.");
  });

  it("rejects required={false}", () => {
    expect(() =>
      toSourceText(
        <Struct name="User">
          {/* @ts-expect-error invalid required value */}
          <Field id={1} required={false} type={string} name="name" />
        </Struct>,
      ),
    ).toThrow("Field 'required' must be true when provided.");
  });

  it("rejects optional={false}", () => {
    expect(() =>
      toSourceText(
        <Struct name="User">
          {/* @ts-expect-error invalid optional value */}
          <Field id={1} optional={false} type={string} name="name" />
        </Struct>,
      ),
    ).toThrow("Field 'optional' must be true when provided.");
  });

  it("rejects required and optional together", () => {
    expect(() =>
      toSourceText(
        <Struct name="User">
          <Field id={1} required optional type={string} name="name" />
        </Struct>,
      ),
    ).toThrow("Field cannot be both required and optional.");
  });

  it("renders field default values", () => {
    const text = toSourceText(
      <Struct name="Config">
        <Field id={1} type={i32} name="retries" default={3} />
        <Field id={2} type={string} name="host" default="localhost" />
      </Struct>,
    );

    expect(text).toBe(d`
      struct Config {
        1: i32 retries = 3,
        2: string host = "localhost",
      }
    `);
  });
});

describe("Typedef", () => {
  it("renders a primitive typedef", () => {
    const text = toSourceText(<Typedef name="UserId" type={i64} />);

    expect(text).toBe("typedef i64 UserId");
  });

  it("renders a container typedef", () => {
    const text = toSourceText(
      <Typedef name="StringList" type={listOf(string)} />,
    );

    expect(text).toBe("typedef list<string> StringList");
  });
});
