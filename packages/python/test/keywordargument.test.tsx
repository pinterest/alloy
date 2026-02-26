import { namekey } from "@alloy-js/core";
import { describe, expect, it } from "vitest";
import * as py from "../src/index.js";
import { toSourceText } from "./utils.jsx";

describe("KeywordArgument", () => {
  it("renders a keyword argument with string name", () => {
    const res = toSourceText([
      <py.KeywordArgument name="callStmtVar" value={12} />,
    ]);
    expect(res).toBe(`call_stmt_var=12`);
  });

  it("renders a keyword argument with namekey", () => {
    const paramName = namekey("myParam");
    const res = toSourceText([
      <py.KeywordArgument name={paramName} value={42} />,
    ]);
    expect(res).toBe(`my_param=42`);
  });
});
