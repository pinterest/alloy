/** @jsxImportSource @alloy-js/core */
import { refkey } from "@alloy-js/core";
import { describe, expect, it } from "vitest";
import * as gql from "../src/index.js";
import { toGraphQLText } from "./utils.jsx";

describe("Fragment Type Condition Validation", () => {
  describe("Valid type conditions", () => {
    it("allows object types as fragment type conditions", () => {
      const userRef = refkey();

      const result = toGraphQLText(
        <>
          <gql.ObjectTypeDefinition name="User" refkey={userRef}>
            <gql.FieldDefinition
              name="id"
              type={<gql.TypeReference type={gql.builtInScalars.ID} />}
            />
            <gql.FieldDefinition
              name="name"
              type={<gql.TypeReference type={gql.builtInScalars.String} />}
            />
          </gql.ObjectTypeDefinition>
          <gql.FragmentDefinition name="UserFields" typeCondition={userRef}>
            <gql.FieldSelection name="id" />
            <gql.FieldSelection name="name" />
          </gql.FragmentDefinition>
        </>,
      );

      expect(result).toContain("fragment UserFields on User");
    });

    it("allows interface types as fragment type conditions", () => {
      const nodeRef = refkey();

      const result = toGraphQLText(
        <>
          <gql.InterfaceTypeDefinition name="Node" refkey={nodeRef}>
            <gql.FieldDefinition
              name="id"
              type={<gql.TypeReference type={gql.builtInScalars.ID} required />}
            />
          </gql.InterfaceTypeDefinition>
          <gql.FragmentDefinition name="NodeFields" typeCondition={nodeRef}>
            <gql.FieldSelection name="id" />
          </gql.FragmentDefinition>
        </>,
      );

      expect(result).toContain("fragment NodeFields on Node");
    });

    it("allows union types as fragment type conditions", () => {
      const searchResultRef = refkey();

      const result = toGraphQLText(
        <>
          <gql.UnionTypeDefinition
            name="SearchResult"
            refkey={searchResultRef}
            members={["User", "Post"]}
          />
          <gql.FragmentDefinition
            name="SearchFields"
            typeCondition={searchResultRef}
          >
            <gql.InlineFragment typeCondition="User">
              <gql.FieldSelection name="username" />
            </gql.InlineFragment>
            <gql.InlineFragment typeCondition="Post">
              <gql.FieldSelection name="title" />
            </gql.InlineFragment>
          </gql.FragmentDefinition>
        </>,
      );

      expect(result).toContain("fragment SearchFields on SearchResult");
    });

    it("allows string literal type conditions (for external types)", () => {
      const result = toGraphQLText(
        <gql.FragmentDefinition name="UserFields" typeCondition="User">
          <gql.FieldSelection name="id" />
          <gql.FieldSelection name="name" />
        </gql.FragmentDefinition>,
      );

      expect(result).toContain("fragment UserFields on User");
    });
  });

  describe("Invalid type conditions for FragmentDefinition", () => {
    it("throws error when scalar type is used as fragment type condition", () => {
      const customScalarRef = refkey();

      expect(() => {
        toGraphQLText(
          <>
            <gql.ScalarTypeDefinition
              name="DateTime"
              refkey={customScalarRef}
            />
            <gql.FragmentDefinition
              name="InvalidFragment"
              typeCondition={customScalarRef}
            >
              <gql.FieldSelection name="something" />
            </gql.FragmentDefinition>
          </>,
        );
      }).toThrow(
        /Fragment "InvalidFragment" cannot have type condition "DateTime" \(scalar type\)/,
      );
    });

    it("throws error when enum type is used as fragment type condition", () => {
      const statusRef = refkey();

      expect(() => {
        toGraphQLText(
          <>
            <gql.EnumTypeDefinition name="Status" refkey={statusRef}>
              <gql.EnumValue name="ACTIVE" />
            </gql.EnumTypeDefinition>
            <gql.FragmentDefinition
              name="InvalidFragment"
              typeCondition={statusRef}
            >
              <gql.FieldSelection name="something" />
            </gql.FragmentDefinition>
          </>,
        );
      }).toThrow(
        /Fragment "InvalidFragment" cannot have type condition "Status" \(enum type\)/,
      );
    });

    it("throws error when input object type is used as fragment type condition", () => {
      const userInputRef = refkey();

      expect(() => {
        toGraphQLText(
          <>
            <gql.InputObjectTypeDefinition
              name="UserInput"
              refkey={userInputRef}
            >
              <gql.InputFieldDeclaration
                name="name"
                type={
                  <gql.TypeReference
                    type={
                      <gql.TypeReference type={gql.builtInScalars.String} />
                    }
                  />
                }
              />
            </gql.InputObjectTypeDefinition>
            <gql.FragmentDefinition
              name="InvalidFragment"
              typeCondition={userInputRef}
            >
              <gql.FieldSelection name="something" />
            </gql.FragmentDefinition>
          </>,
        );
      }).toThrow(
        /Fragment "InvalidFragment" cannot have type condition "UserInput" \(input object type\)/,
      );
    });
  });

  describe("Invalid type conditions for InlineFragment", () => {
    it("allows inline fragments with object type conditions", () => {
      const userRef = refkey();

      const result = toGraphQLText(
        <>
          <gql.ObjectTypeDefinition name="User" refkey={userRef}>
            <gql.FieldDefinition
              name="id"
              type={<gql.TypeReference type={gql.builtInScalars.ID} />}
            />
            <gql.FieldDefinition
              name="name"
              type={<gql.TypeReference type={gql.builtInScalars.String} />}
            />
          </gql.ObjectTypeDefinition>
          <gql.OperationDefinition operationType="query" name="GetData">
            <gql.FieldSelection name="search">
              <gql.InlineFragment typeCondition={userRef}>
                <gql.FieldSelection name="name" />
              </gql.InlineFragment>
            </gql.FieldSelection>
          </gql.OperationDefinition>
        </>,
      );

      expect(result).toContain("... on User");
    });

    it("throws error when scalar type is used in inline fragment", () => {
      const customScalarRef = refkey();

      expect(() => {
        toGraphQLText(
          <>
            <gql.ScalarTypeDefinition
              name="DateTime"
              refkey={customScalarRef}
            />
            <gql.OperationDefinition operationType="query" name="InvalidQuery">
              <gql.FieldSelection name="search">
                <gql.InlineFragment typeCondition={customScalarRef}>
                  <gql.FieldSelection name="something" />
                </gql.InlineFragment>
              </gql.FieldSelection>
            </gql.OperationDefinition>
          </>,
        );
      }).toThrow(
        /Fragment "inline fragment" cannot have type condition "DateTime" \(scalar type\)/,
      );
    });

    it("throws error when enum type is used in inline fragment", () => {
      const statusRef = refkey();

      expect(() => {
        toGraphQLText(
          <>
            <gql.EnumTypeDefinition name="Status" refkey={statusRef}>
              <gql.EnumValue name="ACTIVE" />
            </gql.EnumTypeDefinition>
            <gql.OperationDefinition operationType="query" name="InvalidQuery">
              <gql.FieldSelection name="search">
                <gql.InlineFragment typeCondition={statusRef}>
                  <gql.FieldSelection name="something" />
                </gql.InlineFragment>
              </gql.FieldSelection>
            </gql.OperationDefinition>
          </>,
        );
      }).toThrow(
        /Fragment "inline fragment" cannot have type condition "Status" \(enum type\)/,
      );
    });

    it("throws error when input object type is used in inline fragment", () => {
      const userInputRef = refkey();

      expect(() => {
        toGraphQLText(
          <>
            <gql.InputObjectTypeDefinition
              name="UserInput"
              refkey={userInputRef}
            >
              <gql.InputFieldDeclaration
                name="name"
                type={
                  <gql.TypeReference
                    type={
                      <gql.TypeReference type={gql.builtInScalars.String} />
                    }
                  />
                }
              />
            </gql.InputObjectTypeDefinition>
            <gql.OperationDefinition operationType="query" name="InvalidQuery">
              <gql.FieldSelection name="search">
                <gql.InlineFragment typeCondition={userInputRef}>
                  <gql.FieldSelection name="something" />
                </gql.InlineFragment>
              </gql.FieldSelection>
            </gql.OperationDefinition>
          </>,
        );
      }).toThrow(
        /Fragment "inline fragment" cannot have type condition "UserInput" \(input object type\)/,
      );
    });

    it("allows inline fragments without type conditions (for directives)", () => {
      const result = toGraphQLText(
        <gql.OperationDefinition operationType="query" name="GetData">
          <gql.FieldSelection name="user">
            <gql.InlineFragment
              directives={
                <gql.Directive
                  name="include"
                  args={{ if: <gql.Variable name="showDetails" /> }}
                />
              }
            >
              <gql.FieldSelection name="email" />
            </gql.InlineFragment>
          </gql.FieldSelection>
        </gql.OperationDefinition>,
      );

      expect(result).toContain("... @include(if: $showDetails)");
    });
  });
});
