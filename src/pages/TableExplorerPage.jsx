import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import {
  GET_AVAILABLE_TABLES,
  GET_TABLE_STRUCTURE,
  GET_TABLE_RECORDS,
} from '../graphql/queries.js';
import {
  PageHeader, LoadingBlock, ErrorBlock,
  SectionTitle, Tag, EmptyState
} from '../components/UI.jsx';
import s from './TableExplorerPage.module.css';

/* Maps PostgreSQL data types to colour tokens */
const TYPE_COLOR = {
  bigint:            'accent',
  integer:           'accent',
  'character varying': 'green',
  text:              'green',
  double:            'yellow',
  numeric:           'yellow',
  boolean:           'cyan',
  date:              'orange',
  timestamp:         'orange',
  'timestamp without time zone': 'orange',
};
function typeColor(dt = '') {
  const lc = dt.toLowerCase();
  for (const [k, v] of Object.entries(TYPE_COLOR)) {
    if (lc.includes(k)) return v;
  }
  return 'default';
}

const TABLES = ['department', 'employee', 'employee_profile'];

export default function TableExplorerPage() {
  const [selected, setSelected] = useState('');

  const { data: tablesData, loading: tabLoad, error: tabErr } =
    useQuery(GET_AVAILABLE_TABLES);

  const { data: structData, loading: structLoad, error: structErr } =
    useQuery(GET_TABLE_STRUCTURE, {
      variables: { tableName: selected },
      skip: !selected,
    });

  const { data: recData, loading: recLoad, error: recErr } =
    useQuery(GET_TABLE_RECORDS, {
      variables: { tableName: selected },
      skip: !selected,
    });

  const tables    = tablesData?.availableTables ?? [];
  const structure = structData?.tableStructure;
  const records   = recData?.tableRecords;

  const parsedRows = (records?.rows ?? []).map(r => {
    try { return JSON.parse(r); } catch { return {}; }
  });

  if (tabLoad) return <LoadingBlock />;
  if (tabErr)  return <ErrorBlock message={tabErr.message} />;

  return (
    <div className={s.page}>
      <PageHeader
        title="Table Explorer"
        subtitle="Select a PostgreSQL table — view its structure (information_schema) and first 10 rows"
        badge="INTROSPECTION"
      />

      {/* ── Selector ─────────────────────────────────────────────── */}
      <div className={s.selectorCard}>
        <div className={s.selectorLabel}>Select Database Table</div>

        {/* Quick-pick chips */}
        <div className={s.chips}>
          {TABLES.map(t => {
            const meta = tables.find(x => x.tableName === t);
            return (
              <button
                key={t}
                className={`${s.chip} ${selected === t ? s.chipActive : ''}`}
                onClick={() => setSelected(t)}
              >
                <span className={s.chipName}>{t}</span>
                {meta && <span className={s.chipCount}>{meta.rowCount}</span>}
              </button>
            );
          })}
        </div>

        {/* Dropdown (alternative selector) */}
        <div className={s.dropRow}>
          <select
            className={s.select}
            value={selected}
            onChange={e => setSelected(e.target.value)}
          >
            <option value="">— Choose a table —</option>
            {tables.map(t => (
              <option key={t.tableName} value={t.tableName}>
                {t.tableName}  ({t.rowCount} rows)
              </option>
            ))}
          </select>
          {selected && records && (
            <div className={s.selMeta}>
              <Tag color="accent">{selected}</Tag>
              <Tag color="green">{records.totalRows} total rows</Tag>
              <Tag color="cyan">{structure?.columns?.length ?? '…'} columns</Tag>
            </div>
          )}
        </div>
      </div>

      {!selected && (
        <EmptyState icon="◫" message="Choose a table above to inspect its schema and data" />
      )}

      {selected && (
        <div className={s.sections}>

          {/* ── Table Structure ─────────────────────────────────── */}
          <div className={s.section}>
            <SectionTitle>Column Structure — {selected}</SectionTitle>
            {structLoad && <LoadingBlock />}
            {structErr  && <ErrorBlock message={structErr.message} />}
            {structure  && (
              <>
                <div className={s.metaLine}>
                  <span>{structure.columns.length} columns</span>
                  <span>·</span>
                  <span>{structure.columns.filter(c => c.isPrimaryKey).length} primary key(s)</span>
                  <span>·</span>
                  <span>{structure.columns.filter(c => !c.isNullable).length} NOT NULL columns</span>
                  <span>·</span>
                  <span>PostgreSQL <code>information_schema</code></span>
                </div>

                <div className={s.tableWrap}>
                  <table className={s.schemaTable}>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Column Name</th>
                        <th>Data Type</th>
                        <th>Primary Key</th>
                        <th>Nullable</th>
                        <th>Default</th>
                      </tr>
                    </thead>
                    <tbody>
                      {structure.columns.map((col, idx) => (
                        <tr key={col.columnName} className={col.isPrimaryKey ? s.pkRow : ''}>
                          <td className={s.rowNum}>{idx + 1}</td>
                          <td className={s.colName}>
                            {col.isPrimaryKey && <span className={s.pkIcon}>⚿ </span>}
                            {col.columnName}
                          </td>
                          <td><Tag color={typeColor(col.dataType)}>{col.dataType}</Tag></td>
                          <td>
                            {col.isPrimaryKey
                              ? <Tag color="yellow">PK</Tag>
                              : <span className={s.dash}>—</span>}
                          </td>
                          <td>
                            {col.isNullable
                              ? <Tag color="default">NULL</Tag>
                              : <Tag color="red">NOT NULL</Tag>}
                          </td>
                          <td className={s.defVal}>
                            {col.columnDefault
                              ? <code>{col.columnDefault}</code>
                              : <span className={s.dash}>—</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>

          {/* ── Table Records ────────────────────────────────────── */}
          <div className={s.section}>
            <SectionTitle>First 10 Records — {selected}</SectionTitle>
            {recLoad && <LoadingBlock />}
            {recErr  && <ErrorBlock message={recErr.message} />}
            {records && (
              <>
                <div className={s.metaLine}>
                  Showing {Math.min(parsedRows.length, 10)} of{' '}
                  <strong>{records.totalRows}</strong> rows ·{' '}
                  {records.columns.length} columns · fetched via GraphQL{' '}
                  <code>tableRecords</code> query
                </div>

                {parsedRows.length === 0
                  ? <EmptyState icon="◫" message="No rows in this table" />
                  : (
                    <div className={s.tableWrap}>
                      <table className={s.recordTable}>
                        <thead>
                          <tr>
                            {records.columns.map(c => (
                              <th key={c}>{c}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {parsedRows.map((row, i) => (
                            <tr key={i}>
                              {records.columns.map(c => (
                                <td
                                  key={c}
                                  className={
                                    c.toLowerCase() === 'id' ? s.idCell : ''
                                  }
                                >
                                  {row[c] == null
                                    ? <span className={s.nullVal}>null</span>
                                    : String(row[c]).length > 55
                                      ? `${String(row[c]).slice(0, 55)}…`
                                      : String(row[c])}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
              </>
            )}
          </div>

          {/* ── GraphQL Queries shown ────────────────────────────── */}
          <div className={s.section}>
            <SectionTitle>GraphQL Queries Used on This Page</SectionTitle>
            <div className={s.queryGrid}>
              <div className={s.queryCard}>
                <div className={s.queryTitle}>tableStructure</div>
                <pre className={s.queryCode}>{`query {
  tableStructure(tableName: "${selected}") {
    tableName
    columns {
      columnName
      dataType
      isNullable
      columnDefault
      isPrimaryKey
    }
  }
}`}</pre>
              </div>
              <div className={s.queryCard}>
                <div className={s.queryTitle}>tableRecords</div>
                <pre className={s.queryCode}>{`query {
  tableRecords(tableName: "${selected}") {
    tableName
    columns
    rows       # JSON strings
    totalRows
  }
}`}</pre>
              </div>
              <div className={s.queryCard}>
                <div className={s.queryTitle}>availableTables</div>
                <pre className={s.queryCode}>{`query {
  availableTables {
    tableName
    rowCount
  }
}`}</pre>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
