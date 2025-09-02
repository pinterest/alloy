import { Children, For, memo, Refkey } from "@alloy-js/core";

export interface SingleTypeExpressionProps {
  children: string | Refkey;
  typeArguments?: SingleTypeExpressionProps[];
}

export function SingleTypeExpression(props: SingleTypeExpressionProps) {
  const resolvedChildren = memo(() => props.children);

  return (
    <group>
      <indent>
        <sbr />
        {resolvedChildren()}
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
