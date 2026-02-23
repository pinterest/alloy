# @alloy-js/thrift

Thrift IDL components for Alloy. Build `.thrift` files using JSX and let the
renderer handle formatting, includes, and symbol references.

## Basic usage

```tsx
import { Output, render } from "@alloy-js/core";
import * as thrift from "@alloy-js/thrift";

const res = render(
  <Output namePolicy={thrift.defaultThriftNamePolicy}>
    <thrift.SourceFile path="user.thrift">
      <thrift.Enum name="Role">
        <thrift.EnumValue name="ADMIN" value={1} />
        <thrift.EnumValue name="USER" value={2} />
      </thrift.Enum>
      <thrift.Struct name="User">
        <thrift.Field id={1} required type="i64" name="id" />
        <thrift.Field id={2} type="string" name="name" />
        <thrift.Field id={3} type="Role" name="role" />
      </thrift.Struct>
    </thrift.SourceFile>
  </Output>,
);
```

## Cross-file includes via refkeys

```tsx
import { Output, refkey, render } from "@alloy-js/core";
import * as thrift from "@alloy-js/thrift";

const userRef = refkey();

const res = render(
  <Output namePolicy={thrift.defaultThriftNamePolicy}>
    <thrift.SourceFile path="user.thrift">
      <thrift.Struct name="User" refkey={userRef}>
        <thrift.Field id={1} type="string" name="name" />
      </thrift.Struct>
    </thrift.SourceFile>
    <thrift.SourceFile path="service.thrift">
      <thrift.Service name="UserService">
        <thrift.ServiceFunction name="getUser" returnType={userRef}>
          <thrift.Field id={1} type="i64" name="id" />
        </thrift.ServiceFunction>
      </thrift.Service>
    </thrift.SourceFile>
  </Output>,
);
```

When a refkey targets a symbol declared in a different file, the source file
automatically emits an `include` statement and prefixes the reference with the
include alias.

## Manual includes and namespaces

```tsx
import { Output, render } from "@alloy-js/core";
import * as thrift from "@alloy-js/thrift";

const res = render(
  <Output namePolicy={thrift.defaultThriftNamePolicy}>
    <thrift.SourceFile
      path="api.thrift"
      includes={<thrift.Include path="shared.thrift" />}
      namespaces={<thrift.Namespace lang="js" value="example.api" />}
    >
      <thrift.Typedef name="UserId" type="i64" />
    </thrift.SourceFile>
  </Output>,
);
```
