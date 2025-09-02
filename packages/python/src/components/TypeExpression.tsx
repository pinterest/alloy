import { Children, For, memo, Refkey } from "@alloy-js/core";
import { resolveTypeExpression } from "../utils.js";

export interface SingleTypeExpressionProps {
  children: string | Refkey;
  typeArguments?: SingleTypeExpressionProps[];
}

export function SingleTypeExpression(props: SingleTypeExpressionProps) {
  const resolvedChildren = memo(() => props.children);
  let resolvedTypeArguments: Children = undefined;
  if (props.typeArguments) {
    const typeArguments = props.typeArguments.map((child) =>
      resolveTypeExpression(child),
    );
    resolvedTypeArguments =
      typeArguments && typeArguments.length > 0 ?
        <>
          [
          <For each={typeArguments} joiner=", ">
            {(arg) => arg}
          </For>
          ]
        </>
      : undefined;
  }

  return (
    <group>
      <indent>
        <sbr />
        {resolvedChildren()}
        {resolvedTypeArguments}
      </indent>
      <sbr />
    </group>
  );
}

export interface UnionTypeExpressionProps {
  children: SingleTypeExpressionProps[];
}

export function UnionTypeExpression(props: UnionTypeExpressionProps) {
  // Map each SingleTypeExpressionProps to a SingleTypeExpression element (Children)
  let childrenElements: Children[] = props.children.map((childProps) => (
    <SingleTypeExpression {...childProps} />
  ));

  return (
    <group>
      <ifBreak>(</ifBreak>
      <indent>
        <sbr />
        <For
          each={childrenElements}
          joiner={
            <>
              <br />|{" "}
            </>
          }
        >
          {(child) => child}
        </For>
      </indent>
      <sbr />
      <ifBreak>)</ifBreak>
    </group>
  );
}
