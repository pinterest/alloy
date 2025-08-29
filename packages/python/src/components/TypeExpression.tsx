import { Children, For, memo, Refkey } from "@alloy-js/core";

export interface SingleTypeExpressionProps {
  children: string | Refkey;
}

export function SingleTypeExpression(props: SingleTypeExpressionProps) {
  const resolvedChildren = memo(() => props.children);

  return (
    <group>
      <indent>
        <sbr />
        {resolvedChildren}
      </indent>
      <sbr />
    </group>
  );
}

export interface UnionTypeExpressionProps {
  children: SingleTypeExpressionProps[];
  optional?: boolean;
}

export function UnionTypeExpression(props: UnionTypeExpressionProps) {
  // Map each SingleTypeExpressionProps to a SingleTypeExpression element (Children)
  let childrenElements: Children[] = props.children.map((childProps) => (
    <SingleTypeExpression {...childProps} />
  ));

  if (props.optional) {
    childrenElements = [...childrenElements, "None"];
  }

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

export type TypeExpressionProps =
  | SingleTypeExpressionProps
  | UnionTypeExpressionProps;

export function TypeExpression(props: TypeExpressionProps) {
  if (Array.isArray(props.children)) {
    // Ensure children is an array of SingleTypeExpressionProps
    const childrenPropsArray = props.children as SingleTypeExpressionProps[];
    return <UnionTypeExpression {...props} children={childrenPropsArray} />;
  }
  // Only pass SingleTypeExpressionProps to SingleTypeExpression
  const singleTypeProps = props as SingleTypeExpressionProps;
  return <SingleTypeExpression {...singleTypeProps} />;
}
