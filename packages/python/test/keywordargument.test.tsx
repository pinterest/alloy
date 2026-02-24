import { describe, expect, it } from "vitest";
import * as py from "../src/index.js";
import { toSourceText } from "./utils.jsx";

describe("KeywordArgument", () => {
  it("renders a keyword argument", () => {
    const res = toSourceText([
      <py.KeywordArgument name="callStmtVar" value={12} />,
    ]);
    expect(res).toBe(`call_stmt_var=12`);
  });
});
