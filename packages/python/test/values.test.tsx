import { describe, expect, it } from "vitest";
import * as py from "../src/index.js";
import { toSourceText } from "./utils.jsx";

describe("Atom", () => {
  it("renders string value", () => {
    expect(toSourceText([<py.Atom jsValue={"Test"} />])).toRenderTo('"Test"');
  });

  it("renders null/undefined object", () => {
    expect(toSourceText([<py.Atom jsValue={undefined} />])).toRenderTo("None");
  });

  it("renders number", () => {
    expect(toSourceText([<py.Atom jsValue={123} />])).toRenderTo("123");
  });

  it("renders floating point number", () => {
    expect(toSourceText([<py.Atom jsValue={123.456} />])).toRenderTo("123.456");
  });

  it("renders floating point number with decimal point zero", () => {
    expect(toSourceText([<py.Atom jsValue={"123.0"} />])).toRenderTo("123.0");
  });

  it("renders scientific notation number (lowercase e)", () => {
    expect(toSourceText([<py.Atom jsValue={"1e3"} />])).toRenderTo("1e3");
  });

  it("renders scientific notation number with uppercase E and negative exponent", () => {
    expect(toSourceText([<py.Atom jsValue={"-2E5"} />])).toRenderTo("-2E5");
  });

  it("renders scientific notation number with unary plus and negative exponent", () => {
    expect(toSourceText([<py.Atom jsValue={"+7e-2"} />])).toRenderTo("+7e-2");
  });

  it("renders boolean - True", () => {
    expect(toSourceText([<py.Atom jsValue={true} />])).toRenderTo("True");
  });

  it("renders boolean - False", () => {
    expect(toSourceText([<py.Atom jsValue={false} />])).toRenderTo("False");
  });

  it("renders array", () => {
    expect(toSourceText([<py.Atom jsValue={[1, 2, 3]} />])).toRenderTo(
      "[1, 2, 3]",
    );
  });

  it("renders object", () => {
    expect(toSourceText([<py.Atom jsValue={{ a: 1, b: 2 }} />])).toRenderTo(
      '{"a": 1, "b": 2}',
    );
  });

  it("renders more complex object", () => {
    expect(
      toSourceText([<py.Atom jsValue={{ a: "1", b: 2, c: true }} />]),
    ).toRenderTo('{"a": "1", "b": 2, "c": True}');
  });

  it("renders empty object", () => {
    expect(toSourceText([<py.Atom jsValue={{}} />])).toRenderTo("{}");
  });

  it("renders function", () => {
    function Test() {
      return <>Test</>;
    }

    expect(toSourceText([<py.Atom jsValue={Test} />])).toRenderTo("Test");
  });

  it("renders nested object", () => {
    expect(
      toSourceText([<py.Atom jsValue={{ a: { b: { c: 1 } }, d: 2 }} />]),
    ).toRenderTo('{"a": {"b": {"c": 1}}, "d": 2}');
  });
});
