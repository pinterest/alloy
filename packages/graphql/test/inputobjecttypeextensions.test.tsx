/** @jsxImportSource @alloy-js/core */
import { code, refkey } from "@alloy-js/core";
import { d } from "@alloy-js/core/testing";
import { describe, expect, it } from "vitest";
import { builtInScalars } from "../src/builtins/scalars.js";
import * as gql from "../src/index.js";
import { toGraphQLText } from "./utils.jsx";

describe("InputObjectTypeExtension", () => {
  it("renders an input object extension with additional fields", () => {
    const result = toGraphQLText(
      <gql.InputObjectTypeExtension name="FilterInput">
        <gql.InputFieldDeclaration
          name="createdAfter"
          type={builtInScalars.String}
        />
        <gql.InputFieldDeclaration
          name="createdBefore"
          type={builtInScalars.String}
        />
      </gql.InputObjectTypeExtension>,
    );
    expect(result).toRenderTo(d`
      extend input FilterInput {
        createdAfter: String
        createdBefore: String
      }
    `);
  });

  it("renders an input object extension with field descriptions", () => {
    const result = toGraphQLText(
      <gql.InputObjectTypeExtension name="UserInput">
        <gql.InputFieldDeclaration
          name="timezone"
          type={builtInScalars.String}
          description="User timezone preference"
        />
      </gql.InputObjectTypeExtension>,
    );
    expect(result).toRenderTo(d`
      extend input UserInput {
        """
        User timezone preference
        """
        timezone: String
      }
    `);
  });

  it("renders an input object extension with only directives", () => {
    const result = toGraphQLText(
      <gql.InputObjectTypeExtension
        name="CreateUserInput"
        directives={<gql.Directive name="deprecated" />}
      />,
    );
    expect(result).toRenderTo(d`
      extend input CreateUserInput @deprecated
    `);
  });

  it("renders an input object extension with fields and directives", () => {
    const result = toGraphQLText(
      <gql.InputObjectTypeExtension
        name="FilterInput"
        directives={<gql.Directive name="oneOf" />}
      >
        <gql.InputFieldDeclaration name="byId" type={builtInScalars.ID} />
        <gql.InputFieldDeclaration
          name="byEmail"
          type={builtInScalars.String}
        />
      </gql.InputObjectTypeExtension>,
    );
    expect(result).toRenderTo(d`
      extend input FilterInput @oneOf {
        byId: ID
        byEmail: String
      }
    `);
  });

  it("renders an input object extension with default values", () => {
    const result = toGraphQLText(
      <gql.InputObjectTypeExtension name="OptionsInput">
        <gql.InputFieldDeclaration
          name="limit"
          type={builtInScalars.Int}
          defaultValue={100}
        />
        <gql.InputFieldDeclaration
          name="sortAscending"
          type={builtInScalars.Boolean}
          defaultValue={true}
        />
      </gql.InputObjectTypeExtension>,
    );
    expect(result).toRenderTo(d`
      extend input OptionsInput {
        limit: Int = 100
        sortAscending: Boolean = true
      }
    `);
  });

  it("renders an input object extension with refkey", () => {
    const filterRef = refkey();

    const result = toGraphQLText(
      <gql.InputObjectTypeExtension name="FilterInput" refkey={filterRef}>
        <gql.InputFieldDeclaration
          name="archived"
          type={builtInScalars.Boolean}
        />
      </gql.InputObjectTypeExtension>,
    );
    expect(result).toRenderTo(d`
      extend input FilterInput {
        archived: Boolean
      }
    `);
  });

  it("renders an input object extension with enum default values", () => {
    const statusRef = refkey();
    const activeRef = refkey();

    const result = toGraphQLText(
      <>
        <gql.EnumTypeDefinition name="Status" refkey={statusRef}>
          <gql.EnumValue name="ACTIVE" refkey={activeRef} />
          <gql.EnumValue name="INACTIVE" />
        </gql.EnumTypeDefinition>
        <gql.InputObjectTypeExtension name="UserInput">
          <gql.InputFieldDeclaration
            name="status"
            type={code`${statusRef}`}
            defaultValue={code`${activeRef}`}
          />
        </gql.InputObjectTypeExtension>
      </>,
    );
    expect(result).toRenderTo(d`
      enum Status {
        ACTIVE
        INACTIVE
      }
      
      extend input UserInput {
        status: Status = ACTIVE
      }
    `);
  });
});
