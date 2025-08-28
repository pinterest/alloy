import { code, refkey } from "@alloy-js/core";
import { d } from "@alloy-js/core/testing";
import { describe, expect, it } from "vitest";
import * as py from "../src/index.js";
import { toSourceText } from "./utils.jsx";

describe("TypeExpression", () => {
  it("renders a Python type expression", () => {
    const type = code`int`;
    expect(
      toSourceText([
        <py.SingleTypeExpression>{type}</py.SingleTypeExpression>,
      ]),
    ).toRenderTo("int");
  });
  it("renders a Python type expression with a reference", () => {
    const classRefkey = refkey();

    expect(
      toSourceText([
        <py.StatementList>
          <py.ClassDeclaration name="Bar" refkey={classRefkey}></py.ClassDeclaration>
          <py.SingleTypeExpression>{classRefkey}</py.SingleTypeExpression>
        </py.StatementList>
      ]),
    ).toRenderTo(d`
        class Bar:
            pass

        Bar
    `);
  });
});

describe("UnionTypeExpression", () => {
  it("renders a Python union expression - 1 item", () => {
    const elements = [{children: 'int'}];
    expect(
      toSourceText([
        <py.UnionTypeExpression>{elements}</py.UnionTypeExpression>,
      ]),
    ).toRenderTo("int");
  });
  it("renders a Python union expression - 2 items", () => {
    const elements = [{children: 'int'}, {children: 'str'}];
    expect(
      toSourceText([
        <py.UnionTypeExpression>{elements}</py.UnionTypeExpression>,
      ]),
    ).toRenderTo("int | str");
  });
  it("renders a Python union expression - N items", () => {
    const elements = [
      {children: 'int'},
      {children: 'str'},
      {children: 'float'},
      {children: 'bool'},
      {children: 'list'},
      {children: 'dict'},
      {children: 'set'},
      {children: 'tuple'},
      {children: 'frozenset'},
      {children: 'bytes'},
      {children: 'bytearray'},
      {children: 'memoryview'},
      {children: 'complex'},
    ];
    expect(
      toSourceText([
        <py.UnionTypeExpression>{elements}</py.UnionTypeExpression>,
      ]),
    ).toRenderTo(d`
        (
            int
            | str
            | float
            | bool
            | list
            | dict
            | set
            | tuple
            | frozenset
            | bytes
            | bytearray
            | memoryview
            | complex
        )`);
  });
  it("renders a Python union expression - 2 items", () => {
    const elements = [{children: 'int'}, {children: 'str'}];
    expect(
      toSourceText([
        <py.UnionTypeExpression>{elements}</py.UnionTypeExpression>,
      ]),
    ).toRenderTo("int | str");
  });
  it("renders a Python union expression - 2 items with optional", () => {
    const elements = [{children: 'int'}, {children: 'str'}];
    expect(
      toSourceText([
        <py.UnionTypeExpression optional>{elements}</py.UnionTypeExpression>,
      ]),
    ).toRenderTo("int | str | None");
  });
  it("renders a Python type expression with a reference", () => {
    const classRefkey = refkey();
    const otherClassRefkey = refkey();
    const elements = [
      {children: classRefkey},
      {children: otherClassRefkey}
    ];

    expect(
      toSourceText([
        <py.StatementList>
          <py.ClassDeclaration name="Bar" refkey={classRefkey}></py.ClassDeclaration>
          <py.ClassDeclaration name="Foo" refkey={otherClassRefkey}></py.ClassDeclaration>
          <py.UnionTypeExpression>{elements}</py.UnionTypeExpression>
        </py.StatementList>
      ])).toRenderTo(d`
        class Bar:
            pass

        class Foo:
            pass

        Bar | Foo
    `);
  });
});