import { refkey } from "@alloy-js/core";
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
  binary,
  bool,
  double,
  i32,
  i64,
  listOf,
  mapOf,
  string,
} from "../src/index.js";
import {
  SnapshotFile,
  loadFixture,
  permissiveNamePolicy,
  renderThriftFiles,
  updateFixture,
} from "./snapshot-utils.jsx";

const consistencyLevel = refkey();
const indexOperator = refkey();
const indexType = refkey();
const compression = refkey();
const cqlResultType = refkey();
const column = refkey();
const superColumn = refkey();
const counterColumn = refkey();
const counterSuperColumn = refkey();
const columnOrSuperColumn = refkey();
const columnParent = refkey();
const columnPath = refkey();
const sliceRange = refkey();
const slicePredicate = refkey();
const indexExpression = refkey();
const indexClause = refkey();
const keyRange = refkey();
const keySlice = refkey();
const keyCount = refkey();
const deletion = refkey();
const mutation = refkey();
const endpointDetails = refkey();
const casResult = refkey();
const columnDef = refkey();
const triggerDef = refkey();
const cfDef = refkey();
const tokenRange = refkey();
const cfSplit = refkey();
const cqlMetadata = refkey();
const cqlPreparedResult = refkey();
const cqlResult = refkey();
const cqlRow = refkey();
const authenticationRequest = refkey();
const authenticationException = refkey();
const authorizationException = refkey();
const invalidRequestException = refkey();
const notFoundException = refkey();
const unavailableException = refkey();
const timedOutException = refkey();
const schemaDisagreementException = refkey();
const multiSliceRequest = refkey();
const ksDef = refkey();
const columnSlice = refkey();
const cassandraService = refkey();

export const files: SnapshotFile[] = [
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
        <Enum name="ConsistencyLevel" refkey={consistencyLevel}>
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
        <Enum name="IndexOperator" refkey={indexOperator}>
          <EnumValue name="EQ" />
          <EnumValue name="GTE" />
          <EnumValue name="GT" />
          <EnumValue name="LTE" />
          <EnumValue name="LT" />
        </Enum>
        <Enum name="IndexType" refkey={indexType}>
          <EnumValue name="KEYS" />
          <EnumValue name="CUSTOM" />
          <EnumValue name="COMPOSITES" />
        </Enum>
        <Enum name="Compression" refkey={compression}>
          <EnumValue name="GZIP" value={1} />
          <EnumValue name="NONE" value={2} />
        </Enum>
        <Enum name="CqlResultType" refkey={cqlResultType}>
          <EnumValue name="ROWS" value={1} />
          <EnumValue name="VOID" value={2} />
          <EnumValue name="INT" value={3} />
        </Enum>
        <Const name="VERSION" type={string} value={"20.1.0"} />
        <Struct name="Column" refkey={column}>
          <Field id={1} required type={binary} name="name" />
          <Field id={2} optional type={binary} name="value" />
          <Field id={3} optional type={i64} name="timestamp" />
          <Field id={4} optional type={i32} name="ttl" />
        </Struct>
        <Struct name="SuperColumn" refkey={superColumn}>
          <Field id={1} required type={binary} name="name" />
          <Field id={2} required type={listOf(column)} name="columns" />
        </Struct>
        <Struct name="CounterColumn" refkey={counterColumn}>
          <Field id={1} required type={binary} name="name" />
          <Field id={2} required type={i64} name="value" />
        </Struct>
        <Struct name="CounterSuperColumn" refkey={counterSuperColumn}>
          <Field id={1} required type={binary} name="name" />
          <Field id={2} required type={listOf(counterColumn)} name="columns" />
        </Struct>
        <Struct name="ColumnOrSuperColumn" refkey={columnOrSuperColumn}>
          <Field id={1} optional type={column} name="column" />
          <Field id={2} optional type={superColumn} name="super_column" />
          <Field id={3} optional type={counterColumn} name="counter_column" />
          <Field
            id={4}
            optional
            type={counterSuperColumn}
            name="counter_super_column"
          />
        </Struct>
        <Struct name="ColumnParent" refkey={columnParent}>
          <Field id={3} required type={string} name="column_family" />
          <Field id={4} optional type={binary} name="super_column" />
        </Struct>
        <Struct name="ColumnPath" refkey={columnPath}>
          <Field id={3} required type={string} name="column_family" />
          <Field id={4} optional type={binary} name="super_column" />
          <Field id={5} optional type={binary} name="column" />
        </Struct>
        <Struct name="SliceRange" refkey={sliceRange}>
          <Field id={1} required type={binary} name="start" />
          <Field id={2} required type={binary} name="finish" />
          <Field id={3} required type={bool} name="reversed" default={0} />
          <Field id={4} required type={i32} name="count" default={100} />
        </Struct>
        <Struct name="SlicePredicate" refkey={slicePredicate}>
          <Field id={1} optional type={listOf(binary)} name="column_names" />
          <Field id={2} optional type={sliceRange} name="slice_range" />
        </Struct>
        <Struct name="IndexExpression" refkey={indexExpression}>
          <Field id={1} required type={binary} name="column_name" />
          <Field id={2} required type={indexOperator} name="op" />
          <Field id={3} required type={binary} name="value" />
        </Struct>
        <Struct name="IndexClause" refkey={indexClause}>
          <Field
            id={1}
            required
            type={listOf(indexExpression)}
            name="expressions"
          />
          <Field id={2} required type={binary} name="start_key" />
          <Field id={3} required type={i32} name="count" default={100} />
        </Struct>
        <Struct name="KeyRange" refkey={keyRange}>
          <Field id={1} optional type={binary} name="start_key" />
          <Field id={2} optional type={binary} name="end_key" />
          <Field id={3} optional type={string} name="start_token" />
          <Field id={4} optional type={string} name="end_token" />
          <Field
            id={6}
            optional
            type={listOf(indexExpression)}
            name="row_filter"
          />
          <Field id={5} required type={i32} name="count" default={100} />
        </Struct>
        <Struct name="KeySlice" refkey={keySlice}>
          <Field id={1} required type={binary} name="key" />
          <Field
            id={2}
            required
            type={listOf(columnOrSuperColumn)}
            name="columns"
          />
        </Struct>
        <Struct name="KeyCount" refkey={keyCount}>
          <Field id={1} required type={binary} name="key" />
          <Field id={2} required type={i32} name="count" />
        </Struct>
        <Struct name="Deletion" refkey={deletion}>
          <Field id={1} optional type={i64} name="timestamp" />
          <Field id={2} optional type={binary} name="super_column" />
          <Field id={3} optional type={slicePredicate} name="predicate" />
        </Struct>
        <Struct name="Mutation" refkey={mutation}>
          <Field
            id={1}
            optional
            type={columnOrSuperColumn}
            name="column_or_supercolumn"
          />
          <Field id={2} optional type={deletion} name="deletion" />
        </Struct>
        <Struct name="EndpointDetails" refkey={endpointDetails}>
          <Field id={1} type={string} name="host" />
          <Field id={2} type={string} name="datacenter" />
          <Field id={3} optional type={string} name="rack" />
        </Struct>
        <Struct name="CASResult" refkey={casResult}>
          <Field id={1} required type={bool} name="success" />
          <Field id={2} optional type={listOf(column)} name="current_values" />
        </Struct>
        <Struct name="TokenRange" refkey={tokenRange}>
          <Field id={1} required type={string} name="start_token" />
          <Field id={2} required type={string} name="end_token" />
          <Field id={3} required type={listOf(string)} name="endpoints" />
          <Field id={4} optional type={listOf(string)} name="rpc_endpoints" />
          <Field
            id={5}
            optional
            type={listOf(endpointDetails)}
            name="endpoint_details"
          />
        </Struct>
        <Struct name="AuthenticationRequest" refkey={authenticationRequest}>
          <Field
            id={1}
            required
            type={mapOf(string, string)}
            name="credentials"
          />
        </Struct>
        <Struct name="ColumnDef" refkey={columnDef}>
          <Field id={1} required type={binary} name="name" />
          <Field id={2} required type={string} name="validation_class" />
          <Field id={3} optional type={indexType} name="index_type" />
          <Field id={4} optional type={string} name="index_name" />
          <Field
            id={5}
            optional
            type={mapOf(string, string)}
            name="index_options"
          />
        </Struct>
        <Struct name="TriggerDef" refkey={triggerDef}>
          <Field id={1} required type={string} name="name" />
          <Field id={2} required type={mapOf(string, string)} name="options" />
        </Struct>
        <Struct name="CfDef" refkey={cfDef}>
          <Field id={1} required type={string} name="keyspace" />
          <Field id={2} required type={string} name="name" />
          <Field
            id={3}
            optional
            type={string}
            name="column_type"
            default={"Standard"}
          />
          <Field
            id={5}
            optional
            type={string}
            name="comparator_type"
            default={"BytesType"}
          />
          <Field id={6} optional type={string} name="subcomparator_type" />
          <Field id={8} optional type={string} name="comment" />
          <Field id={12} optional type={double} name="read_repair_chance" />
          <Field
            id={13}
            optional
            type={listOf(columnDef)}
            name="column_metadata"
          />
          <Field id={14} optional type={i32} name="gc_grace_seconds" />
          <Field
            id={15}
            optional
            type={string}
            name="default_validation_class"
          />
          <Field id={16} optional type={i32} name="id" />
          <Field id={17} optional type={i32} name="min_compaction_threshold" />
          <Field id={18} optional type={i32} name="max_compaction_threshold" />
          <Field id={26} optional type={string} name="key_validation_class" />
          <Field id={28} optional type={binary} name="key_alias" />
          <Field id={29} optional type={string} name="compaction_strategy" />
          <Field
            id={30}
            optional
            type={mapOf(string, string)}
            name="compaction_strategy_options"
          />
          <Field
            id={32}
            optional
            type={mapOf(string, string)}
            name="compression_options"
          />
          <Field id={33} optional type={double} name="bloom_filter_fp_chance" />
          <Field
            id={34}
            optional
            type={string}
            name="caching"
            default={"keys_only"}
          />
          <Field
            id={37}
            optional
            type={double}
            name="dclocal_read_repair_chance"
            default={0}
          />
          <Field
            id={39}
            optional
            type={i32}
            name="memtable_flush_period_in_ms"
          />
          <Field id={40} optional type={i32} name="default_time_to_live" />
          <Field
            id={42}
            optional
            type={string}
            name="speculative_retry"
            default={"NONE"}
          />
          <Field id={43} optional type={listOf(triggerDef)} name="triggers" />
          <Field
            id={44}
            optional
            type={string}
            name="cells_per_row_to_cache"
            default={"100"}
          />
          <Field id={45} optional type={i32} name="min_index_interval" />
          <Field id={46} optional type={i32} name="max_index_interval" />
          <Field id={9} optional type={double} name="row_cache_size" />
          <Field id={11} optional type={double} name="key_cache_size" />
          <Field
            id={19}
            optional
            type={i32}
            name="row_cache_save_period_in_seconds"
          />
          <Field
            id={20}
            optional
            type={i32}
            name="key_cache_save_period_in_seconds"
          />
          <Field id={21} optional type={i32} name="memtable_flush_after_mins" />
          <Field id={22} optional type={i32} name="memtable_throughput_in_mb" />
          <Field
            id={23}
            optional
            type={double}
            name="memtable_operations_in_millions"
          />
          <Field id={24} optional type={bool} name="replicate_on_write" />
          <Field id={25} optional type={double} name="merge_shards_chance" />
          <Field id={27} optional type={string} name="row_cache_provider" />
          <Field id={31} optional type={i32} name="row_cache_keys_to_save" />
          <Field
            id={38}
            optional
            type={bool}
            name="populate_io_cache_on_flush"
          />
          <Field id={41} optional type={i32} name="index_interval" />
        </Struct>
        <Struct name="KsDef" refkey={ksDef}>
          <Field id={1} required type={string} name="name" />
          <Field id={2} required type={string} name="strategy_class" />
          <Field
            id={3}
            optional
            type={mapOf(string, string)}
            name="strategy_options"
          />
          <Field id={4} optional type={i32} name="replication_factor" />
          <Field id={5} required type={listOf(cfDef)} name="cf_defs" />
          <Field
            id={6}
            optional
            type={bool}
            name="durable_writes"
            default={1}
          />
        </Struct>
        <Struct name="CqlRow" refkey={cqlRow}>
          <Field id={1} required type={binary} name="key" />
          <Field id={2} required type={listOf(column)} name="columns" />
        </Struct>
        <Struct name="CqlMetadata" refkey={cqlMetadata}>
          <Field
            id={1}
            required
            type={mapOf(binary, string)}
            name="name_types"
          />
          <Field
            id={2}
            required
            type={mapOf(binary, string)}
            name="value_types"
          />
          <Field id={3} required type={string} name="default_name_type" />
          <Field id={4} required type={string} name="default_value_type" />
        </Struct>
        <Struct name="CqlResult" refkey={cqlResult}>
          <Field id={1} required type={cqlResultType} name="type" />
          <Field id={2} optional type={listOf(cqlRow)} name="rows" />
          <Field id={3} optional type={i32} name="num" />
          <Field id={4} optional type={cqlMetadata} name="schema" />
        </Struct>
        <Struct name="CqlPreparedResult" refkey={cqlPreparedResult}>
          <Field id={1} required type={i32} name="itemId" />
          <Field id={2} required type={i32} name="count" />
          <Field id={3} optional type={listOf(string)} name="variable_types" />
          <Field id={4} optional type={listOf(string)} name="variable_names" />
        </Struct>
        <Struct name="CfSplit" refkey={cfSplit}>
          <Field id={1} required type={string} name="start_token" />
          <Field id={2} required type={string} name="end_token" />
          <Field id={3} required type={i64} name="row_count" />
        </Struct>
        <Struct name="ColumnSlice" refkey={columnSlice}>
          <Field id={1} optional type={binary} name="start" />
          <Field id={2} optional type={binary} name="finish" />
        </Struct>
        <Struct name="MultiSliceRequest" refkey={multiSliceRequest}>
          <Field id={1} optional type={binary} name="key" />
          <Field id={2} optional type={columnParent} name="column_parent" />
          <Field
            id={3}
            optional
            type={listOf(columnSlice)}
            name="column_slices"
          />
          <Field id={4} optional type={bool} name="reversed" default={false} />
          <Field id={5} optional type={i32} name="count" default={1000} />
          <Field
            id={6}
            optional
            type={consistencyLevel}
            name="consistency_level"
            default={1}
          />
        </Struct>
        <Exception
          name="NotFoundException"
          refkey={notFoundException}
        ></Exception>
        <Exception
          name="InvalidRequestException"
          refkey={invalidRequestException}
        >
          <Field id={1} required type={string} name="why" />
        </Exception>
        <Exception
          name="UnavailableException"
          refkey={unavailableException}
        ></Exception>
        <Exception name="TimedOutException" refkey={timedOutException}>
          <Field id={1} optional type={i32} name="acknowledged_by" />
          <Field id={2} optional type={bool} name="acknowledged_by_batchlog" />
          <Field id={3} optional type={bool} name="paxos_in_progress" />
        </Exception>
        <Exception
          name="AuthenticationException"
          refkey={authenticationException}
        >
          <Field id={1} required type={string} name="why" />
        </Exception>
        <Exception
          name="AuthorizationException"
          refkey={authorizationException}
        >
          <Field id={1} required type={string} name="why" />
        </Exception>
        <Exception
          name="SchemaDisagreementException"
          refkey={schemaDisagreementException}
        ></Exception>
        <Service name="Cassandra" refkey={cassandraService}>
          <ServiceFunction name="login">
            <Field
              id={1}
              required
              type={authenticationRequest}
              name="auth_request"
            />
            <Throws>
              <Field id={1} type={authenticationException} name="authnx" />
              <Field id={2} type={authorizationException} name="authzx" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction name="set_keyspace">
            <Field id={1} required type={string} name="keyspace" />
            <Throws>
              <Field id={1} type={invalidRequestException} name="ire" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction name="get" returnType={columnOrSuperColumn}>
            <Field id={1} required type={binary} name="key" />
            <Field id={2} required type={columnPath} name="column_path" />
            <Field
              id={3}
              required
              type={consistencyLevel}
              name="consistency_level"
              default={1}
            />
            <Throws>
              <Field id={1} type={invalidRequestException} name="ire" />
              <Field id={2} type={notFoundException} name="nfe" />
              <Field id={3} type={unavailableException} name="ue" />
              <Field id={4} type={timedOutException} name="te" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction
            name="get_slice"
            returnType={listOf(columnOrSuperColumn)}
          >
            <Field id={1} required type={binary} name="key" />
            <Field id={2} required type={columnParent} name="column_parent" />
            <Field id={3} required type={slicePredicate} name="predicate" />
            <Field
              id={4}
              required
              type={consistencyLevel}
              name="consistency_level"
              default={1}
            />
            <Throws>
              <Field id={1} type={invalidRequestException} name="ire" />
              <Field id={2} type={unavailableException} name="ue" />
              <Field id={3} type={timedOutException} name="te" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction name="get_count" returnType={i32}>
            <Field id={1} required type={binary} name="key" />
            <Field id={2} required type={columnParent} name="column_parent" />
            <Field id={3} required type={slicePredicate} name="predicate" />
            <Field
              id={4}
              required
              type={consistencyLevel}
              name="consistency_level"
              default={1}
            />
            <Throws>
              <Field id={1} type={invalidRequestException} name="ire" />
              <Field id={2} type={unavailableException} name="ue" />
              <Field id={3} type={timedOutException} name="te" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction
            name="multiget_slice"
            returnType={mapOf(binary, listOf(columnOrSuperColumn))}
          >
            <Field id={1} required type={listOf(binary)} name="keys" />
            <Field id={2} required type={columnParent} name="column_parent" />
            <Field id={3} required type={slicePredicate} name="predicate" />
            <Field
              id={4}
              required
              type={consistencyLevel}
              name="consistency_level"
              default={1}
            />
            <Throws>
              <Field id={1} type={invalidRequestException} name="ire" />
              <Field id={2} type={unavailableException} name="ue" />
              <Field id={3} type={timedOutException} name="te" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction
            name="multiget_count"
            returnType={mapOf(binary, i32)}
          >
            <Field id={1} required type={listOf(binary)} name="keys" />
            <Field id={2} required type={columnParent} name="column_parent" />
            <Field id={3} required type={slicePredicate} name="predicate" />
            <Field
              id={4}
              required
              type={consistencyLevel}
              name="consistency_level"
              default={1}
            />
            <Throws>
              <Field id={1} type={invalidRequestException} name="ire" />
              <Field id={2} type={unavailableException} name="ue" />
              <Field id={3} type={timedOutException} name="te" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction
            name="get_range_slices"
            returnType={listOf(keySlice)}
          >
            <Field id={1} required type={columnParent} name="column_parent" />
            <Field id={2} required type={slicePredicate} name="predicate" />
            <Field id={3} required type={keyRange} name="range" />
            <Field
              id={4}
              required
              type={consistencyLevel}
              name="consistency_level"
              default={1}
            />
            <Throws>
              <Field id={1} type={invalidRequestException} name="ire" />
              <Field id={2} type={unavailableException} name="ue" />
              <Field id={3} type={timedOutException} name="te" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction name="get_paged_slice" returnType={listOf(keySlice)}>
            <Field id={1} required type={string} name="column_family" />
            <Field id={2} required type={keyRange} name="range" />
            <Field id={3} required type={binary} name="start_column" />
            <Field
              id={4}
              required
              type={consistencyLevel}
              name="consistency_level"
              default={1}
            />
            <Throws>
              <Field id={1} type={invalidRequestException} name="ire" />
              <Field id={2} type={unavailableException} name="ue" />
              <Field id={3} type={timedOutException} name="te" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction
            name="get_indexed_slices"
            returnType={listOf(keySlice)}
          >
            <Field id={1} required type={columnParent} name="column_parent" />
            <Field id={2} required type={indexClause} name="index_clause" />
            <Field
              id={3}
              required
              type={slicePredicate}
              name="column_predicate"
            />
            <Field
              id={4}
              required
              type={consistencyLevel}
              name="consistency_level"
              default={1}
            />
            <Throws>
              <Field id={1} type={invalidRequestException} name="ire" />
              <Field id={2} type={unavailableException} name="ue" />
              <Field id={3} type={timedOutException} name="te" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction name="insert">
            <Field id={1} required type={binary} name="key" />
            <Field id={2} required type={columnParent} name="column_parent" />
            <Field id={3} required type={column} name="column" />
            <Field
              id={4}
              required
              type={consistencyLevel}
              name="consistency_level"
              default={1}
            />
            <Throws>
              <Field id={1} type={invalidRequestException} name="ire" />
              <Field id={2} type={unavailableException} name="ue" />
              <Field id={3} type={timedOutException} name="te" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction name="add">
            <Field id={1} required type={binary} name="key" />
            <Field id={2} required type={columnParent} name="column_parent" />
            <Field id={3} required type={counterColumn} name="column" />
            <Field
              id={4}
              required
              type={consistencyLevel}
              name="consistency_level"
              default={1}
            />
            <Throws>
              <Field id={1} type={invalidRequestException} name="ire" />
              <Field id={2} type={unavailableException} name="ue" />
              <Field id={3} type={timedOutException} name="te" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction name="cas" returnType={casResult}>
            <Field id={1} required type={binary} name="key" />
            <Field id={2} required type={string} name="column_family" />
            <Field id={3} type={listOf(column)} name="expected" />
            <Field id={4} type={listOf(column)} name="updates" />
            <Field
              id={5}
              required
              type={consistencyLevel}
              name="serial_consistency_level"
              default={9}
            />
            <Field
              id={6}
              required
              type={consistencyLevel}
              name="commit_consistency_level"
              default={2}
            />
            <Throws>
              <Field id={1} type={invalidRequestException} name="ire" />
              <Field id={2} type={unavailableException} name="ue" />
              <Field id={3} type={timedOutException} name="te" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction name="remove">
            <Field id={1} required type={binary} name="key" />
            <Field id={2} required type={columnPath} name="column_path" />
            <Field id={3} required type={i64} name="timestamp" />
            <Field
              id={4}
              type={consistencyLevel}
              name="consistency_level"
              default={1}
            />
            <Throws>
              <Field id={1} type={invalidRequestException} name="ire" />
              <Field id={2} type={unavailableException} name="ue" />
              <Field id={3} type={timedOutException} name="te" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction name="remove_counter">
            <Field id={1} required type={binary} name="key" />
            <Field id={2} required type={columnPath} name="path" />
            <Field
              id={3}
              required
              type={consistencyLevel}
              name="consistency_level"
              default={1}
            />
            <Throws>
              <Field id={1} type={invalidRequestException} name="ire" />
              <Field id={2} type={unavailableException} name="ue" />
              <Field id={3} type={timedOutException} name="te" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction name="batch_mutate">
            <Field
              id={1}
              required
              type={mapOf(binary, mapOf(string, listOf(mutation)))}
              name="mutation_map"
            />
            <Field
              id={2}
              required
              type={consistencyLevel}
              name="consistency_level"
              default={1}
            />
            <Throws>
              <Field id={1} type={invalidRequestException} name="ire" />
              <Field id={2} type={unavailableException} name="ue" />
              <Field id={3} type={timedOutException} name="te" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction name="atomic_batch_mutate">
            <Field
              id={1}
              required
              type={mapOf(binary, mapOf(string, listOf(mutation)))}
              name="mutation_map"
            />
            <Field
              id={2}
              required
              type={consistencyLevel}
              name="consistency_level"
              default={1}
            />
            <Throws>
              <Field id={1} type={invalidRequestException} name="ire" />
              <Field id={2} type={unavailableException} name="ue" />
              <Field id={3} type={timedOutException} name="te" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction name="truncate">
            <Field id={1} required type={string} name="cfname" />
            <Throws>
              <Field id={1} type={invalidRequestException} name="ire" />
              <Field id={2} type={unavailableException} name="ue" />
              <Field id={3} type={timedOutException} name="te" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction
            name="get_multi_slice"
            returnType={listOf(columnOrSuperColumn)}
          >
            <Field id={1} required type={multiSliceRequest} name="request" />
            <Throws>
              <Field id={1} type={invalidRequestException} name="ire" />
              <Field id={2} type={unavailableException} name="ue" />
              <Field id={3} type={timedOutException} name="te" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction
            name="describe_schema_versions"
            returnType={mapOf(string, listOf(string))}
          >
            <Throws>
              <Field id={1} type={invalidRequestException} name="ire" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction name="describe_keyspaces" returnType={listOf(ksDef)}>
            <Throws>
              <Field id={1} type={invalidRequestException} name="ire" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction
            name="describe_cluster_name"
            returnType={string}
          ></ServiceFunction>
          <ServiceFunction
            name="describe_version"
            returnType={string}
          ></ServiceFunction>
          <ServiceFunction name="describe_ring" returnType={listOf(tokenRange)}>
            <Field id={1} required type={string} name="keyspace" />
            <Throws>
              <Field id={1} type={invalidRequestException} name="ire" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction
            name="describe_local_ring"
            returnType={listOf(tokenRange)}
          >
            <Field id={1} required type={string} name="keyspace" />
            <Throws>
              <Field id={1} type={invalidRequestException} name="ire" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction
            name="describe_token_map"
            returnType={mapOf(string, string)}
          >
            <Throws>
              <Field id={1} type={invalidRequestException} name="ire" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction
            name="describe_partitioner"
            returnType={string}
          ></ServiceFunction>
          <ServiceFunction
            name="describe_snitch"
            returnType={string}
          ></ServiceFunction>
          <ServiceFunction name="describe_keyspace" returnType={ksDef}>
            <Field id={1} required type={string} name="keyspace" />
            <Throws>
              <Field id={1} type={notFoundException} name="nfe" />
              <Field id={2} type={invalidRequestException} name="ire" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction name="describe_splits" returnType={listOf(string)}>
            <Field id={1} required type={string} name="cfName" />
            <Field id={2} required type={string} name="start_token" />
            <Field id={3} required type={string} name="end_token" />
            <Field id={4} required type={i32} name="keys_per_split" />
            <Throws>
              <Field id={1} type={invalidRequestException} name="ire" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction
            name="trace_next_query"
            returnType={binary}
          ></ServiceFunction>
          <ServiceFunction
            name="describe_splits_ex"
            returnType={listOf(cfSplit)}
          >
            <Field id={1} required type={string} name="cfName" />
            <Field id={2} required type={string} name="start_token" />
            <Field id={3} required type={string} name="end_token" />
            <Field id={4} required type={i32} name="keys_per_split" />
            <Throws>
              <Field id={1} type={invalidRequestException} name="ire" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction name="system_add_column_family" returnType={string}>
            <Field id={1} required type={cfDef} name="cf_def" />
            <Throws>
              <Field id={1} type={invalidRequestException} name="ire" />
              <Field id={2} type={schemaDisagreementException} name="sde" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction name="system_drop_column_family" returnType={string}>
            <Field id={1} required type={string} name="column_family" />
            <Throws>
              <Field id={1} type={invalidRequestException} name="ire" />
              <Field id={2} type={schemaDisagreementException} name="sde" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction name="system_add_keyspace" returnType={string}>
            <Field id={1} required type={ksDef} name="ks_def" />
            <Throws>
              <Field id={1} type={invalidRequestException} name="ire" />
              <Field id={2} type={schemaDisagreementException} name="sde" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction name="system_drop_keyspace" returnType={string}>
            <Field id={1} required type={string} name="keyspace" />
            <Throws>
              <Field id={1} type={invalidRequestException} name="ire" />
              <Field id={2} type={schemaDisagreementException} name="sde" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction name="system_update_keyspace" returnType={string}>
            <Field id={1} required type={ksDef} name="ks_def" />
            <Throws>
              <Field id={1} type={invalidRequestException} name="ire" />
              <Field id={2} type={schemaDisagreementException} name="sde" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction
            name="system_update_column_family"
            returnType={string}
          >
            <Field id={1} required type={cfDef} name="cf_def" />
            <Throws>
              <Field id={1} type={invalidRequestException} name="ire" />
              <Field id={2} type={schemaDisagreementException} name="sde" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction name="execute_cql_query" returnType={cqlResult}>
            <Field id={1} required type={binary} name="query" />
            <Field id={2} required type={compression} name="compression" />
            <Throws>
              <Field id={1} type={invalidRequestException} name="ire" />
              <Field id={2} type={unavailableException} name="ue" />
              <Field id={3} type={timedOutException} name="te" />
              <Field id={4} type={schemaDisagreementException} name="sde" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction name="execute_cql3_query" returnType={cqlResult}>
            <Field id={1} required type={binary} name="query" />
            <Field id={2} required type={compression} name="compression" />
            <Field id={3} required type={consistencyLevel} name="consistency" />
            <Throws>
              <Field id={1} type={invalidRequestException} name="ire" />
              <Field id={2} type={unavailableException} name="ue" />
              <Field id={3} type={timedOutException} name="te" />
              <Field id={4} type={schemaDisagreementException} name="sde" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction
            name="prepare_cql_query"
            returnType={cqlPreparedResult}
          >
            <Field id={1} required type={binary} name="query" />
            <Field id={2} required type={compression} name="compression" />
            <Throws>
              <Field id={1} type={invalidRequestException} name="ire" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction
            name="prepare_cql3_query"
            returnType={cqlPreparedResult}
          >
            <Field id={1} required type={binary} name="query" />
            <Field id={2} required type={compression} name="compression" />
            <Throws>
              <Field id={1} type={invalidRequestException} name="ire" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction
            name="execute_prepared_cql_query"
            returnType={cqlResult}
          >
            <Field id={1} required type={i32} name="itemId" />
            <Field id={2} required type={listOf(binary)} name="values" />
            <Throws>
              <Field id={1} type={invalidRequestException} name="ire" />
              <Field id={2} type={unavailableException} name="ue" />
              <Field id={3} type={timedOutException} name="te" />
              <Field id={4} type={schemaDisagreementException} name="sde" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction
            name="execute_prepared_cql3_query"
            returnType={cqlResult}
          >
            <Field id={1} required type={i32} name="itemId" />
            <Field id={2} required type={listOf(binary)} name="values" />
            <Field id={3} required type={consistencyLevel} name="consistency" />
            <Throws>
              <Field id={1} type={invalidRequestException} name="ire" />
              <Field id={2} type={unavailableException} name="ue" />
              <Field id={3} type={timedOutException} name="te" />
              <Field id={4} type={schemaDisagreementException} name="sde" />
            </Throws>
          </ServiceFunction>
          <ServiceFunction name="set_cql_version">
            <Field id={1} required type={string} name="version" />
            <Throws>
              <Field id={1} type={invalidRequestException} name="ire" />
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
    updateFixture("cassandra.thrift", output["cassandra.thrift"]);

    expect(output).toEqual({
      "cassandra.thrift": loadFixture("cassandra.thrift"),
    });
    expect(output).toMatchSnapshot();
  });
});
