import { refkey } from "@alloy-js/core";
import { d } from "@alloy-js/core/testing";
import { describe, expect, it } from "vitest";
import { builtInScalars } from "../src/builtins/scalars.js";
import * as gql from "../src/index.js";
import { toGraphQLText } from "./utils.jsx";

describe("Union Type Validation", () => {
  it("renders a valid union with object type members", () => {
    const userRef = refkey();
    const postRef = refkey();

    const result = toGraphQLText(
      <>
        <gql.ObjectTypeDefinition name="User" refkey={userRef}>
          <gql.FieldDefinition
            name="id"
            type={<gql.TypeReference type={builtInScalars.ID} required />}
          />
        </gql.ObjectTypeDefinition>
        <gql.ObjectTypeDefinition name="Post" refkey={postRef}>
          <gql.FieldDefinition
            name="id"
            type={<gql.TypeReference type={builtInScalars.ID} required />}
          />
        </gql.ObjectTypeDefinition>
        <gql.UnionTypeDefinition
          name="SearchResult"
          members={[userRef, postRef]}
        />
      </>,
    );

    expect(result).toRenderTo(d`
      type User {
        id: ID!
      }

      type Post {
        id: ID!
      }

      union SearchResult = User | Post
    `);
  });

  it("throws error when union has no members", () => {
    expect(() => {
      toGraphQLText(<gql.UnionTypeDefinition name="EmptyUnion" members={[]} />);
    }).toThrow(/Union "EmptyUnion" must have at least one member type/);
  });

  it("throws error when union members is undefined", () => {
    expect(() => {
      toGraphQLText(
        <gql.UnionTypeDefinition
          name="EmptyUnion"
          members={undefined as any}
        />,
      );
    }).toThrow(/Union "EmptyUnion" must have at least one member type/);
  });

  it("throws error when union includes an interface", () => {
    const nodeRef = refkey();

    expect(() => {
      toGraphQLText(
        <>
          <gql.InterfaceTypeDefinition name="Node" refkey={nodeRef}>
            <gql.FieldDefinition
              name="id"
              type={<gql.TypeReference type={builtInScalars.ID} required />}
            />
          </gql.InterfaceTypeDefinition>
          <gql.UnionTypeDefinition name="Result" members={[nodeRef]} />
        </>,
      );
    }).toThrow(
      /Union "Result" cannot include "Node".*union members must be object types/,
    );
  });

  it("throws error when union includes a scalar", () => {
    const dateTimeRef = refkey();

    expect(() => {
      toGraphQLText(
        <>
          <gql.ScalarTypeDefinition name="DateTime" refkey={dateTimeRef} />
          <gql.UnionTypeDefinition name="Result" members={[dateTimeRef]} />
        </>,
      );
    }).toThrow(
      /Union "Result" cannot include "DateTime".*union members must be object types/,
    );
  });

  it("throws error when union includes an enum", () => {
    const statusRef = refkey();

    expect(() => {
      toGraphQLText(
        <>
          <gql.EnumTypeDefinition name="Status" refkey={statusRef}>
            <gql.EnumValue name="ACTIVE" />
          </gql.EnumTypeDefinition>
          <gql.UnionTypeDefinition name="Result" members={[statusRef]} />
        </>,
      );
    }).toThrow(
      /Union "Result" cannot include "Status".*union members must be object types/,
    );
  });

  it("throws error when union includes an input object", () => {
    const inputRef = refkey();

    expect(() => {
      toGraphQLText(
        <>
          <gql.InputObjectTypeDefinition name="UserInput" refkey={inputRef}>
            <gql.InputFieldDeclaration
              name="name"
              type={<gql.TypeReference type={builtInScalars.String} required />}
            />
          </gql.InputObjectTypeDefinition>
          <gql.UnionTypeDefinition name="Result" members={[inputRef]} />
        </>,
      );
    }).toThrow(
      /Union "Result" cannot include "UserInput".*union members must be object types/,
    );
  });

  it("throws error when union includes another union", () => {
    const union1Ref = refkey();

    expect(() => {
      toGraphQLText(
        <>
          <gql.UnionTypeDefinition
            name="Union1"
            refkey={union1Ref}
            members={["User", "Post"]}
          />
          <gql.UnionTypeDefinition name="Union2" members={[union1Ref]} />
        </>,
      );
    }).toThrow(
      /Union "Union2" cannot include "Union1".*union members must be object types/,
    );
  });

  it("allows unions with string literal member names", () => {
    // String literals can't be validated, so this should work
    const result = toGraphQLText(
      <gql.UnionTypeDefinition
        name="SearchResult"
        members={["User", "Post", "Comment"]}
      />,
    );

    expect(result).toRenderTo(d`
      union SearchResult = User | Post | Comment
    `);
  });

  it("allows unions with multiple object type members", () => {
    const userRef = refkey();
    const postRef = refkey();
    const commentRef = refkey();

    const result = toGraphQLText(
      <>
        <gql.ObjectTypeDefinition name="User" refkey={userRef}>
          <gql.FieldDefinition
            name="id"
            type={<gql.TypeReference type={builtInScalars.ID} required />}
          />
        </gql.ObjectTypeDefinition>
        <gql.ObjectTypeDefinition name="Post" refkey={postRef}>
          <gql.FieldDefinition
            name="id"
            type={<gql.TypeReference type={builtInScalars.ID} required />}
          />
        </gql.ObjectTypeDefinition>
        <gql.ObjectTypeDefinition name="Comment" refkey={commentRef}>
          <gql.FieldDefinition
            name="id"
            type={<gql.TypeReference type={builtInScalars.ID} required />}
          />
        </gql.ObjectTypeDefinition>
        <gql.UnionTypeDefinition
          name="SearchResult"
          members={[userRef, postRef, commentRef]}
        />
      </>,
    );

    expect(result).toRenderTo(d`
      type User {
        id: ID!
      }

      type Post {
        id: ID!
      }

      type Comment {
        id: ID!
      }

      union SearchResult = User | Post | Comment
    `);
  });
});
