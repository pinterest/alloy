import { refkey } from "@alloy-js/core";
import { d } from "@alloy-js/core/testing";
import { describe, expect, it } from "vitest";
import * as py from "../src/index.js";
import { toSourceText } from "./utils.jsx";

describe("FunctionCallExpression", () => {
  it("renders", () => {
    const result = toSourceText([<py.FunctionCallExpression target="foo" />]);
    expect(result).toRenderTo(d`
      foo()
    `);
  });
  it("renders with args", () => {
    const result = toSourceText([
      <py.FunctionCallExpression target="foo" args={["a", "b"]} />,
    ]);
    expect(result).toRenderTo(d`
      foo(a, b)
    `);
  });

  it("function call with variables", () => {
    // Creating the reference separately so the naming policy doesn't interfere
    const methodRef = refkey();
    const result = toSourceText([
      <py.StatementList>
        <py.FunctionDeclaration name="runFunc" refkey={methodRef} />
        <py.FunctionCallExpression
          target={methodRef}
          args={[
            <py.Atom jsValue={"A name"} />,
            <py.Atom jsValue={42} />,
            <py.Atom jsValue={true} />,
          ]}
        />
      </py.StatementList>,
    ]);
    const expected = d`
      def run_func():
          pass
      
      run_func("A name", 42, True)
    `;
    expect(result).toRenderTo(expected);
  });

  it("function call with variables and assignment", () => {
    // Creating the reference separately so the naming policy doesn't interfere
    const methodRef = refkey();
    const result = toSourceText([
      <py.StatementList>
        <py.FunctionDeclaration
          name="runFunc"
          returnType="str"
          refkey={methodRef}
          parameters={[
            { name: "name", type: "str" },
            { name: "number", type: "int" },
            { name: "flag", type: "bool" },
          ]}
        />
        <py.VariableDeclaration
          name="result"
          type="str"
          initializer={
            <py.FunctionCallExpression
              target={methodRef}
              args={[
                <py.Atom jsValue={"A name"} />,
                <py.Atom jsValue={42} />,
                <py.Atom jsValue={true} />,
              ]}
            />
          }
        />
      </py.StatementList>,
    ]);
    const expected = d`
      def run_func(name: str, number: int, flag: bool) -> str:
          pass
      
      result: str = run_func("A name", 42, True)
    `;
    expect(result).toRenderTo(expected);
  });

  it("Method call without a reference and with keyword arguments", () => {
    const result = toSourceText([
      <py.StatementList>
        <py.FunctionCallExpression
          target={"example_method"}
          args={[
            <py.KeywordArgument name="name" value={"A name"} />,
            <py.KeywordArgument name="number" value={42} />,
            <py.KeywordArgument name="flag" value={true} />,
          ]}
        />
      </py.StatementList>,
    ]);
    const expected = d`
      example_method(name="A name", number=42, flag=True)
    `;
    expect(result).toRenderTo(expected);
  });

  it("Method call without a reference mixing unnamed and keyword arguments", () => {
    const result = toSourceText([
      <py.StatementList>
        <py.FunctionCallExpression
          target={"example_method"}
          args={[
            <py.Atom jsValue={"A name"} />,
            <py.KeywordArgument name="number" value={42} />,
            <py.KeywordArgument name="flag" value={true} />,
          ]}
        />
      </py.StatementList>,
    ]);
    const expected = d`
      example_method("A name", number=42, flag=True)
    `;
    expect(result).toRenderTo(expected);
  });

  it("keyword argument name does not conflict with same-named variable", () => {
    const resKey = refkey();
    const kwargsKey = refkey();
    const result = toSourceText([
      <py.StatementList>
        <py.VariableDeclaration
          name="kwargs"
          refkey={kwargsKey}
          initializer={<py.Atom jsValue={{}} />}
        />
        <py.VariableDeclaration
          name="res"
          refkey={resKey}
          initializer={
            <py.FunctionCallExpression
              target="resolve_with_adapter"
              args={[
                "obj",
                "info",
                <py.KeywordArgument
                  name="operation"
                  value={<>Operation.QUERY</>}
                />,
                <py.KeywordArgument name="data" value={kwargsKey} />,
                <py.KeywordArgument name="is_v5" value={true} />,
              ]}
            />
          }
        />
        <py.VariableDeclaration
          name="data"
          initializer={
            <py.MemberExpression>
              <py.MemberExpression.Part refkey={resKey} />
              <py.MemberExpression.Part key={"data"} />
            </py.MemberExpression>
          }
        />
      </py.StatementList>,
    ]);
    const expected = d`
      kwargs = {}
      res = resolve_with_adapter(
          obj,
          info,
          operation=Operation.QUERY,
          data=kwargs,
          is_v5=True
      )
      data = res["data"]
    `;
    expect(result).toRenderTo(expected);
  });
});
