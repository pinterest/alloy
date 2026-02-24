import { describe, expect, it } from "vitest";
import {
  Const,
  Enum,
  EnumValue,
  Exception,
  Field,
  Namespace,
  Service,
  ServiceFunction,
  SourceFile,
  Struct,
  Throws,
  listOf,
  mapOf,
} from "../src/index.js";
import {
  SnapshotFile,
  loadFixture,
  permissiveNamePolicy,
  renderThriftFiles,
} from "./snapshot-utils.jsx";

const files: SnapshotFile[] = [
  {
    path: "cassandra.thrift",
    file: (
      <SourceFile
        path="cassandra.thrift"
        namePolicy={permissiveNamePolicy}
        namespaces={[
          <Namespace lang="java" value="org.apache.cassandra.thrift" />,
          <Namespace lang="cpp" value="org.apache.cassandra" />,
          <Namespace lang="csharp" value="Apache.Cassandra" />,
          <Namespace lang="py" value="cassandra" />,
          <Namespace lang="php" value="cassandra" />,
          <Namespace lang="perl" value="Cassandra" />,
          <Namespace lang="rb" value="CassandraThrift" />,
        ]}
      >
        <Enum name="ConsistencyLevel">
          <EnumValue name="ONE" value={1} />
          <EnumValue name="QUORUM" value={2} />
          <EnumValue name="LOCAL_QUORUM" value={3} />
          <EnumValue name="EACH_QUORUM" value={4} />
          <EnumValue name="ALL" value={5} />
          <EnumValue name="ANY" value={6} />
          <EnumValue name="TWO" value={7} />
          <EnumValue name="THREE" value={8} />
          <EnumValue name="SERIAL" value={9} />
          <EnumValue name="LOCAL_SERIAL" value={10} />
          <EnumValue name="LOCAL_ONE" value={11} />
        </Enum>
        <Enum name="IndexOperator">
          <EnumValue name="EQ" />
          <EnumValue name="GTE" />
          <EnumValue name="GT" />
          <EnumValue name="LTE" />
          <EnumValue name="LT" />
        </Enum>
        <Enum name="IndexType">
          <EnumValue name="KEYS" />
          <EnumValue name="CUSTOM" />
          <EnumValue name="COMPOSITES" />
        </Enum>
        <Enum name="Compression">
          <EnumValue name="GZIP" value={1} />
          <EnumValue name="NONE" value={2} />
        </Enum>
        <Enum name="CqlResultType">
          <EnumValue name="ROWS" value={1} />
          <EnumValue name="VOID" value={2} />
          <EnumValue name="INT" value={3} />
        </Enum>
        <Const name="VERSION" type="string" value={"20.1.0"} />
        <Struct name="Column">
          <Field id={1} required type="binary" name="name" />
          <Field id={2} required={false} type="binary" name="value" />
          <Field id={3} required={false} type="i64" name="timestamp" />
          <Field id={4} required={false} type="i32" name="ttl" />
        </Struct>
        <Struct name="SuperColumn">
          <Field id={1} required type="binary" name="name" />
          <Field id={2} required type={listOf("Column")} name="columns" />
        </Struct>
        <Struct name="CounterColumn">
          <Field id={1} required type="binary" name="name" />
          <Field id={2} required type="i64" name="value" />
        </Struct>
        <Struct name="CounterSuperColumn">
          <Field id={1} required type="binary" name="name" />
          <Field
            id={2}
            required
            type={listOf("CounterColumn")}
            name="columns"
          />
        </Struct>
        <Struct name="ColumnOrSuperColumn">
          <Field id={1} required={false} type="Column" name="column" />
          <Field
            id={2}
            required={false}
            type="SuperColumn"
            name="super_column"
          />
          <Field
            id={3}
            required={false}
            type="CounterColumn"
            name="counter_column"
          />
          <Field
            id={4}
            required={false}
            type="CounterSuperColumn"
            name="counter_super_column"
          />
        </Struct>
        <Struct name="ColumnParent">
          <Field id={3} required type="string" name="column_family" />
          <Field id={4} required={false} type="binary" name="super_column" />
        </Struct>
        <Struct name="ColumnPath">
          <Field id={3} required type="string" name="column_family" />
          <Field id={4} required={false} type="binary" name="super_column" />
          <Field id={5} required={false} type="binary" name="column" />
        </Struct>
        <Struct name="SliceRange">
          <Field id={1} required type="binary" name="start" />
          <Field id={2} required type="binary" name="finish" />
          <Field id={3} required type="bool" name="reversed" default={0} />
          <Field id={4} required type="i32" name="count" default={100} />
        </Struct>
        <Struct name="SlicePredicate">
          <Field
            id={1}
            required={false}
            type={listOf("binary")}
            name="column_names"
          />
          <Field id={2} required={false} type="SliceRange" name="slice_range" />
        </Struct>
        <Struct name="IndexExpression">
          <Field id={1} required type="binary" name="column_name" />
          <Field id={2} required type="IndexOperator" name="op" />
          <Field id={3} required type="binary" name="value" />
        </Struct>
        <Struct name="IndexClause">
          <Field
            id={1}
            required
            type={listOf("IndexExpression")}
            name="expressions"
          />
          <Field id={2} required type="binary" name="start_key" />
          <Field id={3} required type="i32" name="count" default={100} />
        </Struct>
        <Struct name="KeyRange">
          <Field id={1} required={false} type="binary" name="start_key" />
          <Field id={2} required={false} type="binary" name="end_key" />
          <Field id={3} required={false} type="string" name="start_token" />
          <Field id={4} required={false} type="string" name="end_token" />
          <Field
            id={6}
            required={false}
            type={listOf("IndexExpression")}
            name="row_filter"
          />
          <Field id={5} required type="i32" name="count" default={100} />
        </Struct>
        <Struct name="KeySlice">
          <Field id={1} required type="binary" name="key" />
          <Field
            id={2}
            required
            type={listOf("ColumnOrSuperColumn")}
            name="columns"
          />
        </Struct>
        <Struct name="KeyCount">
          <Field id={1} required type="binary" name="key" />
          <Field id={2} required type="i32" name="count" />
        </Struct>
        <Struct name="Deletion">
          <Field id={1} required={false} type="i64" name="timestamp" />
          <Field id={2} required={false} type="binary" name="super_column" />
          <Field
            id={3}
            required={false}
            type="SlicePredicate"
            name="predicate"
          />
        </Struct>
        <Struct name="Mutation">
          <Field
            id={1}
            required={false}
            type="ColumnOrSuperColumn"
            name="column_or_supercolumn"
          />
          <Field id={2} required={false} type="Deletion" name="deletion" />
        </Struct>
        <Struct name="EndpointDetails">
          <Field id={1} type="string" name="host" />
          <Field id={2} type="string" name="datacenter" />
          <Field id={3} required={false} type="string" name="rack" />
        </Struct>
        <Struct name="CASResult">
          <Field id={1} required type="bool" name="success" />
          <Field
            id={2}
            required={false}
            type={listOf("Column")}
            name="current_values"
          />
        </Struct>
        <Struct name="TokenRange">
          <Field id={1} required type="string" name="start_token" />
          <Field id={2} required type="string" name="end_token" />
          <Field id={3} required type={listOf("string")} name="endpoints" />
          <Field
            id={4}
            required={false}
            type={listOf("string")}
            name="rpc_endpoints"
          />
          <Field
            id={5}
            required={false}
            type={listOf("EndpointDetails")}
            name="endpoint_details"
          />
        </Struct>
        <Struct name="AuthenticationRequest">
          <Field
            id={1}
            required
            type={mapOf("string", "string")}
            name="credentials"
          />
        </Struct>
        <Struct name="ColumnDef">
          <Field id={1} required type="binary" name="name" />
          <Field id={2} required type="string" name="validation_class" />
          <Field id={3} required={false} type="IndexType" name="index_type" />
          <Field id={4} required={false} type="string" name="index_name" />
          <Field
            id={5}
            required={false}
            type={mapOf("string", "string")}
            name="index_options"
          />
        </Struct>
        <Struct name="TriggerDef">
          <Field id={1} required type="string" name="name" />
          <Field
            id={2}
            required
            type={mapOf("string", "string")}
            name="options"
          />
        </Struct>
        <Struct name="CfDef">
          <Field id={1} required type="string" name="keyspace" />
          <Field id={2} required type="string" name="name" />
          <Field
            id={3}
            required={false}
            type="string"
            name="column_type"
            default={"Standard"}
          />
          <Field
            id={5}
            required={false}
            type="string"
            name="comparator_type"
            default={"BytesType"}
          />
          <Field
            id={6}
            required={false}
            type="string"
            name="subcomparator_type"
          />
          <Field id={8} required={false} type="string" name="comment" />
          <Field
            id={12}
            required={false}
            type="double"
            name="read_repair_chance"
          />
          <Field
            id={13}
            required={false}
            type={listOf("ColumnDef")}
            name="column_metadata"
          />
          <Field id={14} required={false} type="i32" name="gc_grace_seconds" />
          <Field
            id={15}
            required={false}
            type="string"
            name="default_validation_class"
          />
          <Field id={16} required={false} type="i32" name="id" />
          <Field
            id={17}
            required={false}
            type="i32"
            name="min_compaction_threshold"
          />
          <Field
            id={18}
            required={false}
            type="i32"
            name="max_compaction_threshold"
          />
          <Field
            id={26}
            required={false}
            type="string"
            name="key_validation_class"
          />
          <Field id={28} required={false} type="binary" name="key_alias" />
          <Field
            id={29}
            required={false}
            type="string"
            name="compaction_strategy"
          />
          <Field
            id={30}
            required={false}
            type={mapOf("string", "string")}
            name="compaction_strategy_options"
          />
          <Field
            id={32}
            required={false}
            type={mapOf("string", "string")}
            name="compression_options"
          />
          <Field
            id={33}
            required={false}
            type="double"
            name="bloom_filter_fp_chance"
          />
          <Field
            id={34}
            required={false}
            type="string"
            name="caching"
            default={"keys_only"}
          />
          <Field
            id={37}
            required={false}
            type="double"
            name="dclocal_read_repair_chance"
            default={0}
          />
          <Field
            id={39}
            required={false}
            type="i32"
            name="memtable_flush_period_in_ms"
          />
          <Field
            id={40}
            required={false}
            type="i32"
            name="default_time_to_live"
          />
          <Field
            id={42}
            required={false}
            type="string"
            name="speculative_retry"
            default={"NONE"}
          />
          <Field
            id={43}
            required={false}
            type={listOf("TriggerDef")}
            name="triggers"
          />
          <Field
            id={44}
            required={false}
            type="string"
            name="cells_per_row_to_cache"
            default={"100"}
          />
          <Field
            id={45}
            required={false}
            type="i32"
            name="min_index_interval"
          />
          <Field
            id={46}
            required={false}
            type="i32"
            name="max_index_interval"
          />
          <Field id={9} required={false} type="double" name="row_cache_size" />
          <Field id={11} required={false} type="double" name="key_cache_size" />
          <Field
            id={19}
            required={false}
            type="i32"
            name="row_cache_save_period_in_seconds"
          />
          <Field
            id={20}
            required={false}
            type="i32"
            name="key_cache_save_period_in_seconds"
          />
          <Field
            id={21}
            required={false}
            type="i32"
            name="memtable_flush_after_mins"
          />
          <Field
            id={22}
            required={false}
            type="i32"
            name="memtable_throughput_in_mb"
          />
          <Field
            id={23}
            required={false}
            type="double"
            name="memtable_operations_in_millions"
          />
          <Field
            id={24}
            required={false}
            type="bool"
            name="replicate_on_write"
          />
          <Field
            id={25}
            required={false}
            type="double"
            name="merge_shards_chance"
          />
          <Field
            id={27}
            required={false}
            type="string"
            name="row_cache_provider"
          />
          <Field
            id={31}
            required={false}
            type="i32"
            name="row_cache_keys_to_save"
          />
          <Field
            id={38}
            required={false}
            type="bool"
            name="populate_io_cache_on_flush"
          />
          <Field id={41} required={false} type="i32" name="index_interval" />
        </Struct>
        <Struct name="KsDef">
          <Field id={1} required type="string" name="name" />
          <Field id={2} required type="string" name="strategy_class" />
          <Field
            id={3}
            required={false}
            type={mapOf("string", "string")}
            name="strategy_options"
          />
          <Field id={4} required={false} type="i32" name="replication_factor" />
          <Field id={5} required type={listOf("CfDef")} name="cf_defs" />
          <Field
            id={6}
            required={false}
            type="bool"
            name="durable_writes"
            default={1}
          />
        </Struct>
        <Struct name="CqlRow">
          <Field id={1} required type="binary" name="key" />
          <Field id={2} required type={listOf("Column")} name="columns" />
        </Struct>
        <Struct name="CqlMetadata">
          <Field
            id={1}
            required
            type={mapOf("binary", "string")}
            name="name_types"
          />
          <Field
            id={2}
            required
            type={mapOf("binary", "string")}
            name="value_types"
          />
          <Field id={3} required type="string" name="default_name_type" />
          <Field id={4} required type="string" name="default_value_type" />
        </Struct>
        <Struct name="CqlResult">
          <Field id={1} required type="CqlResultType" name="type" />
          <Field id={2} required={false} type={listOf("CqlRow")} name="rows" />
          <Field id={3} required={false} type="i32" name="num" />
          <Field id={4} required={false} type="CqlMetadata" name="schema" />
        </Struct>
        <Struct name="CqlPreparedResult">
          <Field id={1} required type="i32" name="itemId" />
          <Field id={2} required type="i32" name="count" />
          <Field
            id={3}
            required={false}
            type={listOf("string")}
            name="variable_types"
          />
          <Field
            id={4}
            required={false}
            type={listOf("string")}
            name="variable_names"
          />
        </Struct>
        <Struct name="CfSplit">
          <Field id={1} required type="string" name="start_token" />
          <Field id={2} required type="string" name="end_token" />
          <Field id={3} required type="i64" name="row_count" />
        </Struct>
        <Struct name="ColumnSlice">
          <Field id={1} required={false} type="binary" name="start" />
          <Field id={2} required={false} type="binary" name="finish" />
        </Struct>
        <Struct name="MultiSliceRequest">
          <Field id={1} required={false} type="binary" name="key" />
          <Field
            id={2}
            required={false}
            type="ColumnParent"
            name="column_parent"
          />
          <Field
            id={3}
            required={false}
            type={listOf("ColumnSlice")}
            name="column_slices"
          />
          <Field
            id={4}
            required={false}
            type="bool"
            name="reversed"
            default={false}
          />
          <Field
            id={5}
            required={false}
            type="i32"
            name="count"
            default={1000}
          />
          <Field
            id={6}
            required={false}
            type="ConsistencyLevel"
            name="consistency_level"
            default={1}
          />
        </Struct>
        <Exception name="NotFoundException"></Exception>
        <Exception name="InvalidRequestException">
          <Field id={1} required type="string" name="why" />
        </Exception>
        <Exception name="UnavailableException"></Exception>
        <Exception name="TimedOutException">
          <Field id={1} required={false} type="i32" name="acknowledged_by" />
          <Field
            id={2}
            required={false}
            type="bool"
            name="acknowledged_by_batchlog"
          />
          <Field id={3} required={false} type="bool" name="paxos_in_progress" />
        </Exception>
        <Exception name="AuthenticationException">
          <Field id={1} required type="string" name="why" />
        </Exception>
        <Exception name="AuthorizationException">
          <Field id={1} required type="string" name="why" />
        </Exception>
        <Exception name="SchemaDisagreementException"></Exception>
        <Service name="Cassandra">
          <ServiceFunction name="login">
            <Field
              id={1}
              required
              type="AuthenticationRequest"
              name="auth_request"
            />
            <Throws>
              <Field id={1} type="AuthenticationException" name="authnx" />
              <Field id={2} type="AuthorizationException" name="authzx" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction name="set_keyspace">
            <Field id={1} required type="string" name="keyspace" />
            <Throws>
              <Field id={1} type="InvalidRequestException" name="ire" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction name="get" returnType="ColumnOrSuperColumn">
            <Field id={1} required type="binary" name="key" />
            <Field id={2} required type="ColumnPath" name="column_path" />
            <Field
              id={3}
              required
              type="ConsistencyLevel"
              name="consistency_level"
              default={1}
            />
            <Throws>
              <Field id={1} type="InvalidRequestException" name="ire" />
              <Field id={2} type="NotFoundException" name="nfe" />
              <Field id={3} type="UnavailableException" name="ue" />
              <Field id={4} type="TimedOutException" name="te" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction
            name="get_slice"
            returnType={listOf("ColumnOrSuperColumn")}
          >
            <Field id={1} required type="binary" name="key" />
            <Field id={2} required type="ColumnParent" name="column_parent" />
            <Field id={3} required type="SlicePredicate" name="predicate" />
            <Field
              id={4}
              required
              type="ConsistencyLevel"
              name="consistency_level"
              default={1}
            />
            <Throws>
              <Field id={1} type="InvalidRequestException" name="ire" />
              <Field id={2} type="UnavailableException" name="ue" />
              <Field id={3} type="TimedOutException" name="te" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction name="get_count" returnType="i32">
            <Field id={1} required type="binary" name="key" />
            <Field id={2} required type="ColumnParent" name="column_parent" />
            <Field id={3} required type="SlicePredicate" name="predicate" />
            <Field
              id={4}
              required
              type="ConsistencyLevel"
              name="consistency_level"
              default={1}
            />
            <Throws>
              <Field id={1} type="InvalidRequestException" name="ire" />
              <Field id={2} type="UnavailableException" name="ue" />
              <Field id={3} type="TimedOutException" name="te" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction
            name="multiget_slice"
            returnType={mapOf("binary", listOf("ColumnOrSuperColumn"))}
          >
            <Field id={1} required type={listOf("binary")} name="keys" />
            <Field id={2} required type="ColumnParent" name="column_parent" />
            <Field id={3} required type="SlicePredicate" name="predicate" />
            <Field
              id={4}
              required
              type="ConsistencyLevel"
              name="consistency_level"
              default={1}
            />
            <Throws>
              <Field id={1} type="InvalidRequestException" name="ire" />
              <Field id={2} type="UnavailableException" name="ue" />
              <Field id={3} type="TimedOutException" name="te" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction
            name="multiget_count"
            returnType={mapOf("binary", "i32")}
          >
            <Field id={1} required type={listOf("binary")} name="keys" />
            <Field id={2} required type="ColumnParent" name="column_parent" />
            <Field id={3} required type="SlicePredicate" name="predicate" />
            <Field
              id={4}
              required
              type="ConsistencyLevel"
              name="consistency_level"
              default={1}
            />
            <Throws>
              <Field id={1} type="InvalidRequestException" name="ire" />
              <Field id={2} type="UnavailableException" name="ue" />
              <Field id={3} type="TimedOutException" name="te" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction
            name="get_range_slices"
            returnType={listOf("KeySlice")}
          >
            <Field id={1} required type="ColumnParent" name="column_parent" />
            <Field id={2} required type="SlicePredicate" name="predicate" />
            <Field id={3} required type="KeyRange" name="range" />
            <Field
              id={4}
              required
              type="ConsistencyLevel"
              name="consistency_level"
              default={1}
            />
            <Throws>
              <Field id={1} type="InvalidRequestException" name="ire" />
              <Field id={2} type="UnavailableException" name="ue" />
              <Field id={3} type="TimedOutException" name="te" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction
            name="get_paged_slice"
            returnType={listOf("KeySlice")}
          >
            <Field id={1} required type="string" name="column_family" />
            <Field id={2} required type="KeyRange" name="range" />
            <Field id={3} required type="binary" name="start_column" />
            <Field
              id={4}
              required
              type="ConsistencyLevel"
              name="consistency_level"
              default={1}
            />
            <Throws>
              <Field id={1} type="InvalidRequestException" name="ire" />
              <Field id={2} type="UnavailableException" name="ue" />
              <Field id={3} type="TimedOutException" name="te" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction
            name="get_indexed_slices"
            returnType={listOf("KeySlice")}
          >
            <Field id={1} required type="ColumnParent" name="column_parent" />
            <Field id={2} required type="IndexClause" name="index_clause" />
            <Field
              id={3}
              required
              type="SlicePredicate"
              name="column_predicate"
            />
            <Field
              id={4}
              required
              type="ConsistencyLevel"
              name="consistency_level"
              default={1}
            />
            <Throws>
              <Field id={1} type="InvalidRequestException" name="ire" />
              <Field id={2} type="UnavailableException" name="ue" />
              <Field id={3} type="TimedOutException" name="te" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction name="insert">
            <Field id={1} required type="binary" name="key" />
            <Field id={2} required type="ColumnParent" name="column_parent" />
            <Field id={3} required type="Column" name="column" />
            <Field
              id={4}
              required
              type="ConsistencyLevel"
              name="consistency_level"
              default={1}
            />
            <Throws>
              <Field id={1} type="InvalidRequestException" name="ire" />
              <Field id={2} type="UnavailableException" name="ue" />
              <Field id={3} type="TimedOutException" name="te" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction name="add">
            <Field id={1} required type="binary" name="key" />
            <Field id={2} required type="ColumnParent" name="column_parent" />
            <Field id={3} required type="CounterColumn" name="column" />
            <Field
              id={4}
              required
              type="ConsistencyLevel"
              name="consistency_level"
              default={1}
            />
            <Throws>
              <Field id={1} type="InvalidRequestException" name="ire" />
              <Field id={2} type="UnavailableException" name="ue" />
              <Field id={3} type="TimedOutException" name="te" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction name="cas" returnType="CASResult">
            <Field id={1} required type="binary" name="key" />
            <Field id={2} required type="string" name="column_family" />
            <Field id={3} type={listOf("Column")} name="expected" />
            <Field id={4} type={listOf("Column")} name="updates" />
            <Field
              id={5}
              required
              type="ConsistencyLevel"
              name="serial_consistency_level"
              default={9}
            />
            <Field
              id={6}
              required
              type="ConsistencyLevel"
              name="commit_consistency_level"
              default={2}
            />
            <Throws>
              <Field id={1} type="InvalidRequestException" name="ire" />
              <Field id={2} type="UnavailableException" name="ue" />
              <Field id={3} type="TimedOutException" name="te" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction name="remove">
            <Field id={1} required type="binary" name="key" />
            <Field id={2} required type="ColumnPath" name="column_path" />
            <Field id={3} required type="i64" name="timestamp" />
            <Field
              id={4}
              type="ConsistencyLevel"
              name="consistency_level"
              default={1}
            />
            <Throws>
              <Field id={1} type="InvalidRequestException" name="ire" />
              <Field id={2} type="UnavailableException" name="ue" />
              <Field id={3} type="TimedOutException" name="te" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction name="remove_counter">
            <Field id={1} required type="binary" name="key" />
            <Field id={2} required type="ColumnPath" name="path" />
            <Field
              id={3}
              required
              type="ConsistencyLevel"
              name="consistency_level"
              default={1}
            />
            <Throws>
              <Field id={1} type="InvalidRequestException" name="ire" />
              <Field id={2} type="UnavailableException" name="ue" />
              <Field id={3} type="TimedOutException" name="te" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction name="batch_mutate">
            <Field
              id={1}
              required
              type={mapOf("binary", mapOf("string", listOf("Mutation")))}
              name="mutation_map"
            />
            <Field
              id={2}
              required
              type="ConsistencyLevel"
              name="consistency_level"
              default={1}
            />
            <Throws>
              <Field id={1} type="InvalidRequestException" name="ire" />
              <Field id={2} type="UnavailableException" name="ue" />
              <Field id={3} type="TimedOutException" name="te" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction name="atomic_batch_mutate">
            <Field
              id={1}
              required
              type={mapOf("binary", mapOf("string", listOf("Mutation")))}
              name="mutation_map"
            />
            <Field
              id={2}
              required
              type="ConsistencyLevel"
              name="consistency_level"
              default={1}
            />
            <Throws>
              <Field id={1} type="InvalidRequestException" name="ire" />
              <Field id={2} type="UnavailableException" name="ue" />
              <Field id={3} type="TimedOutException" name="te" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction name="truncate">
            <Field id={1} required type="string" name="cfname" />
            <Throws>
              <Field id={1} type="InvalidRequestException" name="ire" />
              <Field id={2} type="UnavailableException" name="ue" />
              <Field id={3} type="TimedOutException" name="te" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction
            name="get_multi_slice"
            returnType={listOf("ColumnOrSuperColumn")}
          >
            <Field id={1} required type="MultiSliceRequest" name="request" />
            <Throws>
              <Field id={1} type="InvalidRequestException" name="ire" />
              <Field id={2} type="UnavailableException" name="ue" />
              <Field id={3} type="TimedOutException" name="te" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction
            name="describe_schema_versions"
            returnType={mapOf("string", listOf("string"))}
          >
            <Throws>
              <Field id={1} type="InvalidRequestException" name="ire" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction
            name="describe_keyspaces"
            returnType={listOf("KsDef")}
          >
            <Throws>
              <Field id={1} type="InvalidRequestException" name="ire" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction
            name="describe_cluster_name"
            returnType="string"
          ></ServiceFunction>
          <ServiceFunction
            name="describe_version"
            returnType="string"
          ></ServiceFunction>
          <ServiceFunction
            name="describe_ring"
            returnType={listOf("TokenRange")}
          >
            <Field id={1} required type="string" name="keyspace" />
            <Throws>
              <Field id={1} type="InvalidRequestException" name="ire" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction
            name="describe_local_ring"
            returnType={listOf("TokenRange")}
          >
            <Field id={1} required type="string" name="keyspace" />
            <Throws>
              <Field id={1} type="InvalidRequestException" name="ire" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction
            name="describe_token_map"
            returnType={mapOf("string", "string")}
          >
            <Throws>
              <Field id={1} type="InvalidRequestException" name="ire" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction
            name="describe_partitioner"
            returnType="string"
          ></ServiceFunction>
          <ServiceFunction
            name="describe_snitch"
            returnType="string"
          ></ServiceFunction>
          <ServiceFunction name="describe_keyspace" returnType="KsDef">
            <Field id={1} required type="string" name="keyspace" />
            <Throws>
              <Field id={1} type="NotFoundException" name="nfe" />
              <Field id={2} type="InvalidRequestException" name="ire" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction name="describe_splits" returnType={listOf("string")}>
            <Field id={1} required type="string" name="cfName" />
            <Field id={2} required type="string" name="start_token" />
            <Field id={3} required type="string" name="end_token" />
            <Field id={4} required type="i32" name="keys_per_split" />
            <Throws>
              <Field id={1} type="InvalidRequestException" name="ire" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction
            name="trace_next_query"
            returnType="binary"
          ></ServiceFunction>
          <ServiceFunction
            name="describe_splits_ex"
            returnType={listOf("CfSplit")}
          >
            <Field id={1} required type="string" name="cfName" />
            <Field id={2} required type="string" name="start_token" />
            <Field id={3} required type="string" name="end_token" />
            <Field id={4} required type="i32" name="keys_per_split" />
            <Throws>
              <Field id={1} type="InvalidRequestException" name="ire" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction name="system_add_column_family" returnType="string">
            <Field id={1} required type="CfDef" name="cf_def" />
            <Throws>
              <Field id={1} type="InvalidRequestException" name="ire" />
              <Field id={2} type="SchemaDisagreementException" name="sde" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction name="system_drop_column_family" returnType="string">
            <Field id={1} required type="string" name="column_family" />
            <Throws>
              <Field id={1} type="InvalidRequestException" name="ire" />
              <Field id={2} type="SchemaDisagreementException" name="sde" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction name="system_add_keyspace" returnType="string">
            <Field id={1} required type="KsDef" name="ks_def" />
            <Throws>
              <Field id={1} type="InvalidRequestException" name="ire" />
              <Field id={2} type="SchemaDisagreementException" name="sde" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction name="system_drop_keyspace" returnType="string">
            <Field id={1} required type="string" name="keyspace" />
            <Throws>
              <Field id={1} type="InvalidRequestException" name="ire" />
              <Field id={2} type="SchemaDisagreementException" name="sde" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction name="system_update_keyspace" returnType="string">
            <Field id={1} required type="KsDef" name="ks_def" />
            <Throws>
              <Field id={1} type="InvalidRequestException" name="ire" />
              <Field id={2} type="SchemaDisagreementException" name="sde" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction
            name="system_update_column_family"
            returnType="string"
          >
            <Field id={1} required type="CfDef" name="cf_def" />
            <Throws>
              <Field id={1} type="InvalidRequestException" name="ire" />
              <Field id={2} type="SchemaDisagreementException" name="sde" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction name="execute_cql_query" returnType="CqlResult">
            <Field id={1} required type="binary" name="query" />
            <Field id={2} required type="Compression" name="compression" />
            <Throws>
              <Field id={1} type="InvalidRequestException" name="ire" />
              <Field id={2} type="UnavailableException" name="ue" />
              <Field id={3} type="TimedOutException" name="te" />
              <Field id={4} type="SchemaDisagreementException" name="sde" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction name="execute_cql3_query" returnType="CqlResult">
            <Field id={1} required type="binary" name="query" />
            <Field id={2} required type="Compression" name="compression" />
            <Field id={3} required type="ConsistencyLevel" name="consistency" />
            <Throws>
              <Field id={1} type="InvalidRequestException" name="ire" />
              <Field id={2} type="UnavailableException" name="ue" />
              <Field id={3} type="TimedOutException" name="te" />
              <Field id={4} type="SchemaDisagreementException" name="sde" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction
            name="prepare_cql_query"
            returnType="CqlPreparedResult"
          >
            <Field id={1} required type="binary" name="query" />
            <Field id={2} required type="Compression" name="compression" />
            <Throws>
              <Field id={1} type="InvalidRequestException" name="ire" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction
            name="prepare_cql3_query"
            returnType="CqlPreparedResult"
          >
            <Field id={1} required type="binary" name="query" />
            <Field id={2} required type="Compression" name="compression" />
            <Throws>
              <Field id={1} type="InvalidRequestException" name="ire" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction
            name="execute_prepared_cql_query"
            returnType="CqlResult"
          >
            <Field id={1} required type="i32" name="itemId" />
            <Field id={2} required type={listOf("binary")} name="values" />
            <Throws>
              <Field id={1} type="InvalidRequestException" name="ire" />
              <Field id={2} type="UnavailableException" name="ue" />
              <Field id={3} type="TimedOutException" name="te" />
              <Field id={4} type="SchemaDisagreementException" name="sde" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction
            name="execute_prepared_cql3_query"
            returnType="CqlResult"
          >
            <Field id={1} required type="i32" name="itemId" />
            <Field id={2} required type={listOf("binary")} name="values" />
            <Field id={3} required type="ConsistencyLevel" name="consistency" />
            <Throws>
              <Field id={1} type="InvalidRequestException" name="ire" />
              <Field id={2} type="UnavailableException" name="ue" />
              <Field id={3} type="TimedOutException" name="te" />
              <Field id={4} type="SchemaDisagreementException" name="sde" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction name="set_cql_version">
            <Field id={1} required type="string" name="version" />
            <Throws>
              <Field id={1} type="InvalidRequestException" name="ire" />
            </Throws>
          </ServiceFunction>
        </Service>
      </SourceFile>
    ),
  },
];

describe("Thrift snapshots", () => {
  it("renders cassandra.thrift", () => {
    const output = renderThriftFiles(files);

    expect(output).toEqual({
      "cassandra.thrift": loadFixture("cassandra.thrift"),
    });
    expect(output).toMatchSnapshot();
  });
});
