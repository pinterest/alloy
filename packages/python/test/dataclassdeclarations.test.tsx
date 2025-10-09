import { Prose } from "@alloy-js/core";
import { d } from "@alloy-js/core/testing";
import { describe, expect, it } from "vitest";
import * as py from "../src/index.js";
import { dataclassesModule } from "../src/builtins/python.js";
import { toSourceText } from "./utils.jsx";

describe("DataclassDeclaration", () => {
  it("Creates a dataclass with a class doc", () => {
    const doc = (
      <py.ClassDoc description={[<Prose>Represents a user.</Prose>]} />
    );
    const res = toSourceText([
      <py.SourceFile path="user.py">
        <py.DataclassDeclaration name="User" doc={doc} />
      </py.SourceFile>,
    ], { externals: [dataclassesModule] });

    expect(res).toRenderTo(
      d`
        from dataclasses import dataclass

        @dataclass
        class User:
            """
            Represents a user.
            """

            pass


      `,
    );
  });

  it("Creates a dataclass with fields and defaults", () => {
    const res = toSourceText([
      <py.SourceFile path="user.py">
        <py.DataclassDeclaration name="User">
          <py.VariableDeclaration instanceVariable omitNone name="id" type="int" />
          <py.DataclassKWOnly />
          <py.VariableDeclaration
            instanceVariable
            name="name"
            type="str"
            initializer={"Anonymous"}
          />
        </py.DataclassDeclaration>
      </py.SourceFile>,
    ], { externals: [dataclassesModule] });

    expect(res).toRenderTo(
      d`
        from dataclasses import dataclass
        from dataclasses import KW_ONLY

        @dataclass
        class User:
            id: int
            _: KW_ONLY
            name: str = "Anonymous"


      `,
    );
  });

  it("Creates a dataclass with keyword arguments", () => {
    const res = toSourceText([
      <py.SourceFile path="user.py">
        <py.DataclassDeclaration
          name="User"
          decoratorKwargs={{ frozen: true, slots: true, kw_only: true }}
        >
          <py.VariableDeclaration instanceVariable omitNone name="id" type="int" />
        </py.DataclassDeclaration>
      </py.SourceFile>,
    ], { externals: [dataclassesModule] });

    expect(res).toRenderTo(
      d`
        from dataclasses import dataclass

        @dataclass(frozen=True, slots=True, kw_only=True)
        class User:
            id: int


      `,
    );
  });

  it("Creates a dataclass with kw_only=True on decorator (sentinel not used)", () => {
    const res = toSourceText([
      <py.SourceFile path="user.py">
        <py.DataclassDeclaration
          name="User"
          decoratorKwargs={{ kw_only: true }}
        >
          <py.VariableDeclaration instanceVariable omitNone name="id" type="int" />
        </py.DataclassDeclaration>
      </py.SourceFile>,
    ], { externals: [dataclassesModule] });
    expect(res).toRenderTo(
      d`
        from dataclasses import dataclass

        @dataclass(kw_only=True)
        class User:
            id: int


      `,
    );
  });

  it("Creates a dataclass with base classes", () => {
    const res = toSourceText([
      <py.SourceFile path="user.py">
        <py.DataclassDeclaration name="User" bases={["Base"]} />
      </py.SourceFile>,
    ], { externals: [dataclassesModule] });

    expect(res).toRenderTo(
      d`
        from dataclasses import dataclass

        @dataclass
        class User(Base):
            pass


      `,
    );
  });
});


