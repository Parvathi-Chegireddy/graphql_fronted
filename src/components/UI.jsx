import React from 'react';
import s from './UI.module.css';

/* ── Page Header ──────────────────────────────────────────────────── */
export function PageHeader({ title, subtitle, badge, action }) {
  return (
    <header className={s.pageHeader}>
      <div>
        <h1 className={s.pageTitle}>{title}</h1>
        {subtitle && <p className={s.pageSub}>{subtitle}</p>}
      </div>
      <div className={s.pageHeaderRight}>
        {badge && <span className={s.badge}>{badge}</span>}
        {action}
      </div>
    </header>
  );
}

/* ── Stat Card ────────────────────────────────────────────────────── */
export function StatCard({ icon, label, value, sub, color = 'accent' }) {
  return (
    <div className={`${s.statCard} ${s[`c_${color}`]}`}>
      {icon && <div className={s.statIcon}>{icon}</div>}
      <div className={s.statValue}>{value}</div>
      <div className={s.statLabel}>{label}</div>
      {sub && <div className={s.statSub}>{sub}</div>}
    </div>
  );
}

/* ── Card ─────────────────────────────────────────────────────────── */
export function Card({ children, className = '', onClick, active }) {
  return (
    <div
      className={`${s.card} ${active ? s.cardActive : ''} ${className}`}
      onClick={onClick}
      style={onClick ? { cursor: 'pointer' } : undefined}
    >
      {children}
    </div>
  );
}

/* ── Tag / Pill ───────────────────────────────────────────────────── */
export function Tag({ children, color = 'default' }) {
  return <span className={`${s.tag} ${s[`tag_${color}`]}`}>{children}</span>;
}

/* ── Loading / Error ──────────────────────────────────────────────── */
export function Spinner({ size = 20 }) {
  return (
    <div
      className={s.spinner}
      style={{ width: size, height: size, borderWidth: size > 20 ? 3 : 2 }}
    />
  );
}

export function LoadingBlock({ message = 'Loading from GraphQL…' }) {
  return (
    <div className={s.loadingBlock}>
      <Spinner />
      <span>{message}</span>
    </div>
  );
}

export function ErrorBlock({ message }) {
  return (
    <div className={s.errorBlock}>
      <span className={s.errorIcon}>⚠</span>
      <div>
        <div className={s.errorTitle}>GraphQL / Network Error</div>
        <div className={s.errorMsg}>{message || 'Something went wrong.'}</div>
        <div className={s.errorHint}>
          Ensure Spring Boot is running on <code>http://localhost:8080</code>
          {' '}and PostgreSQL is reachable.
        </div>
      </div>
    </div>
  );
}

/* ── Section Title ────────────────────────────────────────────────── */
export function SectionTitle({ children }) {
  return <h2 className={s.sectionTitle}>{children}</h2>;
}

/* ── Select ───────────────────────────────────────────────────────── */
export function Select({ value, onChange, options, placeholder, wide }) {
  return (
    <select
      className={s.select}
      style={wide ? { minWidth: 280 } : undefined}
      value={value}
      onChange={e => onChange(e.target.value)}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

/* ── Data Table ───────────────────────────────────────────────────── */
export function DataTable({ columns, rows, pkCols = [] }) {
  if (!rows || rows.length === 0) return <EmptyState message="No data" />;
  return (
    <div className={s.tableWrap}>
      <table className={s.table}>
        <thead>
          <tr>
            {columns.map(c => (
              <th key={c} className={pkCols.includes(c) ? s.thPk : ''}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {columns.map(c => (
                <td key={c} className={pkCols.includes(c) ? s.tdPk : ''}>
                  {row[c] == null
                    ? <span className={s.null}>null</span>
                    : String(row[c])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Empty State ──────────────────────────────────────────────────── */
export function EmptyState({ icon = '◎', message }) {
  return (
    <div className={s.empty}>
      <span className={s.emptyIcon}>{icon}</span>
      <p>{message || 'Nothing here yet'}</p>
    </div>
  );
}

/* ── Divider ──────────────────────────────────────────────────────── */
export function Divider() {
  return <hr className={s.divider} />;
}

/* ── Rel Badge ────────────────────────────────────────────────────── */
export function RelBadge({ type, from: f, to: t }) {
  const colorMap = {
    'One-to-Many':  'green',
    'Many-to-One':  'accent',
    'One-to-One':   'cyan',
  };
  return (
    <div className={s.relBadge}>
      <Tag color={colorMap[type] || 'default'}>{type}</Tag>
      <span className={s.relFrom}>{f}</span>
      <span className={s.relArrow}>→</span>
      <span className={s.relTo}>{t}</span>
    </div>
  );
}
