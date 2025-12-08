import { refkey } from "@alloy-js/core";
import { d } from "@alloy-js/core/testing";
import { describe, expect, it } from "vitest";
import * as gql from "../src/index.js";
import { toGraphQLText } from "./utils.jsx";

describe("Input/Output Type Usage Validation", () => {
  describe("Output position validation (field return types)", () => {
    it("allows scalar types in output positions", () => {
      const result = toGraphQLText(
        <gql.ObjectTypeDefinition name="User">
          <gql.FieldDefinition name="id" type={gql.builtInScalars.ID} />
          <gql.FieldDefinition name="name" type={gql.builtInScalars.String} />
        </gql.ObjectTypeDefinition>,
      );

      expect(result).toRenderTo(d`
        type User {
          id: ID
          name: String
        }
      `);
    });

    it("allows object types in output positions", () => {
      const userRef = refkey();
      const postRef = refkey();

      const result = toGraphQLText(
        <>
          <gql.ObjectTypeDefinition name="User" refkey={userRef}>
            <gql.FieldDefinition name="id" type={gql.builtInScalars.ID} />
          </gql.ObjectTypeDefinition>
          <gql.ObjectTypeDefinition name="Post" refkey={postRef}>
            <gql.FieldDefinition
              name="author"
              type={<gql.TypeReference type={userRef} required />}
            />
          </gql.ObjectTypeDefinition>
        </>,
      );

      expect(result).toRenderTo(d`
        type User {
          id: ID
        }

        type Post {
          author: User!
        }
      `);
    });

    it("allows interface types in output positions", () => {
      const nodeRef = refkey();

      const result = toGraphQLText(
        <>
          <gql.InterfaceTypeDefinition name="Node" refkey={nodeRef}>
            <gql.FieldDefinition
              name="id"
              type={<gql.TypeReference type={gql.builtInScalars.ID} required />}
            />
          </gql.InterfaceTypeDefinition>
          <gql.ObjectTypeDefinition name="User">
            <gql.FieldDefinition name="node" type={nodeRef} />
          </gql.ObjectTypeDefinition>
        </>,
      );

      expect(result).toRenderTo(d`
        interface Node {
          id: ID!
        }

        type User {
          node: Node
        }
      `);
    });

    it("allows union types in output positions", () => {
      const searchResultRef = refkey();

      const result = toGraphQLText(
        <>
          <gql.UnionTypeDefinition
            name="SearchResult"
            refkey={searchResultRef}
            members={["User", "Post"]}
          />
          <gql.ObjectTypeDefinition name="Query">
            <gql.FieldDefinition
              name="search"
              type={
                <gql.TypeReference
                  type={<gql.TypeReference type={searchResultRef} required />}
                  list
                  required
                />
              }
            />
          </gql.ObjectTypeDefinition>
        </>,
      );

      expect(result).toRenderTo(d`
        union SearchResult = User | Post

        type Query {
          search: [SearchResult!]!
        }
      `);
    });

    it("allows enum types in output positions", () => {
      const statusRef = refkey();

      const result = toGraphQLText(
        <>
          <gql.EnumTypeDefinition name="Status" refkey={statusRef}>
            <gql.EnumValue name="ACTIVE" />
            <gql.EnumValue name="INACTIVE" />
          </gql.EnumTypeDefinition>
          <gql.ObjectTypeDefinition name="User">
            <gql.FieldDefinition name="status" type={statusRef} />
          </gql.ObjectTypeDefinition>
        </>,
      );

      expect(result).toRenderTo(d`
        enum Status {
          ACTIVE
          INACTIVE
        }

        type User {
          status: Status
        }
      `);
    });

    it("throws error when input object type is used in output position", () => {
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
                type={gql.builtInScalars.String}
              />
            </gql.InputObjectTypeDefinition>
            <gql.ObjectTypeDefinition name="Query">
              <gql.FieldDefinition name="invalid" type={userInputRef} />
            </gql.ObjectTypeDefinition>
          </>,
        );
      }).toThrow(
        /Field "invalid" on type cannot use input object type "UserInput"/,
      );
    });
  });

  describe("Input position validation (arguments and input fields)", () => {
    it("allows scalar types in input positions", () => {
      const result = toGraphQLText(
        <gql.ObjectTypeDefinition name="Query">
          <gql.FieldDefinition
            name="user"
            type={gql.builtInScalars.String}
            args={
              <gql.InputValueDefinition
                name="id"
                type={
                  <gql.TypeReference type={gql.builtInScalars.ID} required />
                }
              />
            }
          />
        </gql.ObjectTypeDefinition>,
      );

      expect(result).toRenderTo(d`
        type Query {
          user(id: ID!): String
        }
      `);
    });

    it("allows enum types in input positions", () => {
      const statusRef = refkey();

      const result = toGraphQLText(
        <>
          <gql.EnumTypeDefinition name="Status" refkey={statusRef}>
            <gql.EnumValue name="ACTIVE" />
          </gql.EnumTypeDefinition>
          <gql.ObjectTypeDefinition name="Query">
            <gql.FieldDefinition
              name="users"
              type={
                <gql.TypeReference
                  type={
                    <gql.TypeReference
                      type={gql.builtInScalars.String}
                      required
                    />
                  }
                  list
                  required
                />
              }
              args={<gql.InputValueDefinition name="status" type={statusRef} />}
            />
          </gql.ObjectTypeDefinition>
        </>,
      );

      expect(result).toRenderTo(d`
        enum Status {
          ACTIVE
        }

        type Query {
          users(status: Status): [String!]!
        }
      `);
    });

    it("allows input object types in input positions", () => {
      const userInputRef = refkey();

      const result = toGraphQLText(
        <>
          <gql.InputObjectTypeDefinition name="UserInput" refkey={userInputRef}>
            <gql.InputFieldDeclaration
              name="name"
              type={gql.builtInScalars.String}
            />
          </gql.InputObjectTypeDefinition>
          <gql.ObjectTypeDefinition name="Mutation">
            <gql.FieldDefinition
              name="createUser"
              type={gql.builtInScalars.String}
              args={
                <gql.InputValueDefinition
                  name="input"
                  type={<gql.TypeReference type={userInputRef} required />}
                />
              }
            />
          </gql.ObjectTypeDefinition>
        </>,
      );

      expect(result).toRenderTo(d`
        input UserInput {
          name: String
        }

        type Mutation {
          createUser(input: UserInput!): String
        }
      `);
    });

    it("throws error when object type is used in argument", () => {
      const userRef = refkey();

      expect(() => {
        toGraphQLText(
          <>
            <gql.ObjectTypeDefinition name="User" refkey={userRef}>
              <gql.FieldDefinition name="id" type={gql.builtInScalars.ID} />
            </gql.ObjectTypeDefinition>
            <gql.ObjectTypeDefinition name="Query">
              <gql.FieldDefinition
                name="invalid"
                type={gql.builtInScalars.String}
                args={<gql.InputValueDefinition name="user" type={userRef} />}
              />
            </gql.ObjectTypeDefinition>
          </>,
        );
      }).toThrow(/Argument "user" cannot use object type "User"/);
    });

    it("throws error when interface type is used in argument", () => {
      const nodeRef = refkey();

      expect(() => {
        toGraphQLText(
          <>
            <gql.InterfaceTypeDefinition name="Node" refkey={nodeRef}>
              <gql.FieldDefinition
                name="id"
                type={
                  <gql.TypeReference type={gql.builtInScalars.ID} required />
                }
              />
            </gql.InterfaceTypeDefinition>
            <gql.ObjectTypeDefinition name="Query">
              <gql.FieldDefinition
                name="invalid"
                type={gql.builtInScalars.String}
                args={<gql.InputValueDefinition name="node" type={nodeRef} />}
              />
            </gql.ObjectTypeDefinition>
          </>,
        );
      }).toThrow(/Argument "node" cannot use interface type "Node"/);
    });

    it("throws error when union type is used in argument", () => {
      const searchResultRef = refkey();

      expect(() => {
        toGraphQLText(
          <>
            <gql.UnionTypeDefinition
              name="SearchResult"
              refkey={searchResultRef}
              members={["User", "Post"]}
            />
            <gql.ObjectTypeDefinition name="Query">
              <gql.FieldDefinition
                name="invalid"
                type={gql.builtInScalars.String}
                args={
                  <gql.InputValueDefinition
                    name="result"
                    type={searchResultRef}
                  />
                }
              />
            </gql.ObjectTypeDefinition>
          </>,
        );
      }).toThrow(/Argument "result" cannot use union type "SearchResult"/);
    });

    it("throws error when object type is used in input field", () => {
      const userRef = refkey();

      expect(() => {
        toGraphQLText(
          <>
            <gql.ObjectTypeDefinition name="User" refkey={userRef}>
              <gql.FieldDefinition name="id" type={gql.builtInScalars.ID} />
            </gql.ObjectTypeDefinition>
            <gql.InputObjectTypeDefinition name="InvalidInput">
              <gql.InputFieldDeclaration name="user" type={userRef} />
            </gql.InputObjectTypeDefinition>
          </>,
        );
      }).toThrow(/Input field "user" cannot use object type "User"/);
    });

    it("throws error when interface type is used in input field", () => {
      const nodeRef = refkey();

      expect(() => {
        toGraphQLText(
          <>
            <gql.InterfaceTypeDefinition name="Node" refkey={nodeRef}>
              <gql.FieldDefinition
                name="id"
                type={
                  <gql.TypeReference type={gql.builtInScalars.ID} required />
                }
              />
            </gql.InterfaceTypeDefinition>
            <gql.InputObjectTypeDefinition name="InvalidInput">
              <gql.InputFieldDeclaration name="node" type={nodeRef} />
            </gql.InputObjectTypeDefinition>
          </>,
        );
      }).toThrow(/Input field "node" cannot use interface type "Node"/);
    });

    it("throws error when union type is used in input field", () => {
      const searchResultRef = refkey();

      expect(() => {
        toGraphQLText(
          <>
            <gql.UnionTypeDefinition
              name="SearchResult"
              refkey={searchResultRef}
              members={["User", "Post"]}
            />
            <gql.InputObjectTypeDefinition name="InvalidInput">
              <gql.InputFieldDeclaration name="result" type={searchResultRef} />
            </gql.InputObjectTypeDefinition>
          </>,
        );
      }).toThrow(/Input field "result" cannot use union type "SearchResult"/);
    });
  });
});
