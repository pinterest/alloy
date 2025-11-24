import { code, refkey } from "@alloy-js/core";
import { d } from "@alloy-js/core/testing";
import { describe, expect, it } from "vitest";
import { builtInDirectives } from "../src/builtins/directives.js";
import * as gql from "../src/index.js";
import {
  assertFileContents,
  toGraphQLText,
  toGraphQLTextMultiple,
} from "./utils.jsx";

describe("EnumTypeDefinition", () => {
  it("renders a simple enum with values", () => {
    const result = toGraphQLText(
      <gql.EnumTypeDefinition name="Status">
        <gql.EnumValue name="ACTIVE" />
        <gql.EnumValue name="INACTIVE" />
        <gql.EnumValue name="PENDING" />
      </gql.EnumTypeDefinition>,
    );
    expect(result).toRenderTo(d`
      enum Status {
        ACTIVE
        INACTIVE
        PENDING
      }
    `);
  });

  it("renders an enum with a description", () => {
    const result = toGraphQLText(
      <gql.EnumTypeDefinition
        name="Status"
        description="User status in the system"
      >
        <gql.EnumValue name="ACTIVE" />
        <gql.EnumValue name="INACTIVE" />
      </gql.EnumTypeDefinition>,
    );
    expect(result).toRenderTo(d`
      """
      User status in the system
      """
      enum Status {
        ACTIVE
        INACTIVE
      }
    `);
  });

  it("renders an enum with multi-line description", () => {
    const result = toGraphQLText(
      <gql.EnumTypeDefinition
        name="Status"
        description="User status in the system.\nCan be used to filter users."
      >
        <gql.EnumValue name="ACTIVE" />
      </gql.EnumTypeDefinition>,
    );
    expect(result).toRenderTo(d`
      """
      User status in the system.
      Can be used to filter users.
      """
      enum Status {
        ACTIVE
      }
    `);
  });

  it("renders an enum with value descriptions", () => {
    const result = toGraphQLText(
      <gql.EnumTypeDefinition name="Status">
        <gql.EnumValue name="ACTIVE" description="User is currently active" />
        <gql.EnumValue
          name="INACTIVE"
          description="User is temporarily inactive"
        />
        <gql.EnumValue name="BANNED" description="User has been banned" />
      </gql.EnumTypeDefinition>,
    );
    expect(result).toRenderTo(d`
      enum Status {
        """
        User is currently active
        """
        ACTIVE
        """
        User is temporarily inactive
        """
        INACTIVE
        """
        User has been banned
        """
        BANNED
      }
    `);
  });

  it("throws error for empty enum (invalid per GraphQL spec)", () => {
    expect(() => {
      toGraphQLText(<gql.EnumTypeDefinition name="EmptyEnum" />);
    }).toThrow(/Enum "EmptyEnum" must have at least one value/);
  });

  it("renders an enum with a directive", () => {
    const result = toGraphQLText(
      <gql.EnumTypeDefinition
        name="Status"
        directives={
          <gql.Directive
            name={builtInDirectives.deprecated}
            args={{ reason: "Use StatusV2 instead" }}
          />
        }
      >
        <gql.EnumValue name="ACTIVE" />
        <gql.EnumValue name="INACTIVE" />
      </gql.EnumTypeDefinition>,
    );
    expect(result).toRenderTo(d`
      enum Status @deprecated(reason: "Use StatusV2 instead") {
        ACTIVE
        INACTIVE
      }
    `);
  });

  it("renders an enum with multiple directives", () => {
    const result = toGraphQLText(
      <gql.EnumTypeDefinition
        name="Status"
        directives={
          <>
            <gql.Directive name="auth" args={{ requires: "ADMIN" }} />
            <gql.Directive name={builtInDirectives.deprecated} />
          </>
        }
      >
        <gql.EnumValue name="ACTIVE" />
      </gql.EnumTypeDefinition>,
    );
    expect(result).toRenderTo(d`
      enum Status @auth(requires: "ADMIN") @deprecated {
        ACTIVE
      }
    `);
  });

  it("renders an enum value with a directive", () => {
    const result = toGraphQLText(
      <gql.EnumTypeDefinition name="Status">
        <gql.EnumValue name="ACTIVE" />
        <gql.EnumValue
          name="DEPRECATED_STATUS"
          directives={
            <gql.Directive
              name={builtInDirectives.deprecated}
              args={{ reason: "Use INACTIVE instead" }}
            />
          }
        />
        <gql.EnumValue name="INACTIVE" />
      </gql.EnumTypeDefinition>,
    );
    expect(result).toRenderTo(d`
      enum Status {
        ACTIVE
        DEPRECATED_STATUS @deprecated(reason: "Use INACTIVE instead")
        INACTIVE
      }
    `);
  });

  it("supports enum references in field types", () => {
    const statusRef = refkey();

    const result = toGraphQLText(
      <>
        <gql.EnumTypeDefinition name="Status" refkey={statusRef}>
          <gql.EnumValue name="ACTIVE" />
          <gql.EnumValue name="INACTIVE" />
        </gql.EnumTypeDefinition>
        <gql.ObjectTypeDefinition name="User">
          <gql.FieldDefinition name="status" type={code`${statusRef}!`} />
        </gql.ObjectTypeDefinition>
      </>,
    );

    expect(result).toRenderTo(d`
      enum Status {
        ACTIVE
        INACTIVE
      }
      
      type User {
        status: Status!
      }
    `);
  });

  it("supports cross-file enum references", () => {
    const statusRef = refkey();

    const res = toGraphQLTextMultiple([
      <gql.SourceFile path="enums.graphql">
        <gql.EnumTypeDefinition name="Status" refkey={statusRef}>
          <gql.EnumValue name="ACTIVE" />
          <gql.EnumValue name="INACTIVE" />
          <gql.EnumValue name="PENDING" />
        </gql.EnumTypeDefinition>
      </gql.SourceFile>,
      <gql.SourceFile path="types.graphql">
        <gql.ObjectTypeDefinition name="User">
          <gql.FieldDefinition name="status" type={code`${statusRef}!`} />
        </gql.ObjectTypeDefinition>
      </gql.SourceFile>,
    ]);

    assertFileContents(res, {
      "enums.graphql": `
        enum Status {
          ACTIVE
          INACTIVE
          PENDING
        }
      `,
      "types.graphql": `
        type User {
          status: Status!
        }
      `,
    });
  });

  it("renders multiple enums in a schema", () => {
    const result = toGraphQLText(
      <>
        <gql.EnumTypeDefinition name="Status">
          <gql.EnumValue name="ACTIVE" />
          <gql.EnumValue name="INACTIVE" />
        </gql.EnumTypeDefinition>
        <gql.EnumTypeDefinition name="Role">
          <gql.EnumValue name="ADMIN" />
          <gql.EnumValue name="USER" />
          <gql.EnumValue name="GUEST" />
        </gql.EnumTypeDefinition>
      </>,
    );
    expect(result).toRenderTo(d`
      enum Status {
        ACTIVE
        INACTIVE
      }
      
      enum Role {
        ADMIN
        USER
        GUEST
      }
    `);
  });

  it("renders an enum used as argument default value", () => {
    const statusRef = refkey();
    const activeRef = refkey();

    const result = toGraphQLText(
      <>
        <gql.EnumTypeDefinition name="Status" refkey={statusRef}>
          <gql.EnumValue name="ACTIVE" refkey={activeRef} />
          <gql.EnumValue name="INACTIVE" />
        </gql.EnumTypeDefinition>
        <gql.ObjectTypeDefinition name="Query">
          <gql.FieldDefinition
            name="users"
            type="[User!]!"
            args={
              <gql.InputValueDefinition
                name="status"
                type={code`${statusRef}`}
                defaultValue={activeRef}
              />
            }
          />
        </gql.ObjectTypeDefinition>
      </>,
    );

    expect(result).toRenderTo(d`
      enum Status {
        ACTIVE
        INACTIVE
      }
      
      type Query {
        users(status: Status = ACTIVE): [User!]!
      }
    `);
  });

  it("renders an enum with mixed documentation and directives", () => {
    const result = toGraphQLText(
      <gql.EnumTypeDefinition
        name="Status"
        description="User status options"
        directives={<gql.Directive name="auth" args={{ requires: "ADMIN" }} />}
      >
        <gql.EnumValue name="ACTIVE" description="Active user" />
        <gql.EnumValue name="INACTIVE" description="Inactive user" />
        <gql.EnumValue
          name="DEPRECATED_PENDING"
          description="Old pending status"
          directives={
            <gql.Directive
              name={builtInDirectives.deprecated}
              args={{ reason: "Use ACTIVE instead" }}
            />
          }
        />
      </gql.EnumTypeDefinition>,
    );

    expect(result).toRenderTo(d`
      """
      User status options
      """
      enum Status @auth(requires: "ADMIN") {
        """
        Active user
        """
        ACTIVE
        """
        Inactive user
        """
        INACTIVE
        """
        Old pending status
        """
        DEPRECATED_PENDING @deprecated(reason: "Use ACTIVE instead")
      }
    `);
  });
});
