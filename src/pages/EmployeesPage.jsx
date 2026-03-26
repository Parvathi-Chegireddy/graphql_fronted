import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_EMPLOYEES, GET_EMPLOYEE } from '../graphql/queries.js';
import {
  PageHeader, Card, Tag, LoadingBlock, ErrorBlock,
  SectionTitle, DataTable, EmptyState, RelBadge
} from '../components/UI.jsx';
import s from './EmployeesPage.module.css';

export default function EmployeesPage() {
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch]         = useState('');

  const { data, loading, error } = useQuery(GET_EMPLOYEES);
  const { data: dData, loading: dLoad } = useQuery(GET_EMPLOYEE, {
    variables: { id: selectedId },
    skip: !selectedId,
  });

  const employees = data?.employees ?? [];
  const emp       = dData?.employee;

  const filtered = employees.filter(e =>
    `${e.firstName} ${e.lastName} ${e.jobTitle ?? ''} ${e.department?.name ?? ''}`
      .toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingBlock />;
  if (error)   return <ErrorBlock message={error.message} />;

  return (
    <div className={s.page}>
      <PageHeader
        title="Employees"
        subtitle="Many-to-One → Department · One-to-One → Profile"
        badge={`${employees.length} TOTAL`}
      />

      <div className={s.layout}>

        {/* Left — list */}
        <div className={s.listPanel}>
          <div className={s.searchBox}>
            <input
              className={s.search}
              placeholder="Search name, role, department…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className={s.list}>
            {filtered.map(e => (
              <div
                key={e.id}
                className={`${s.row} ${selectedId == e.id ? s.rowActive : ''}`}
                onClick={() => setSelectedId(e.id)}
              >
                <div className={`${s.avatar} ${selectedId == e.id ? s.avatarActive : ''}`}>
                  {e.firstName[0]}{e.lastName[0]}
                </div>
                <div className={s.rowInfo}>
                  <div className={s.rowName}>{e.firstName} {e.lastName}</div>
                  <div className={s.rowRole}>{e.jobTitle}</div>
                  <Tag color="accent">{e.department?.code}</Tag>
                </div>
                {e.profile && <div className={s.profileDot} title="Has profile" />}
              </div>
            ))}
            {filtered.length === 0 && <EmptyState message="No employees match" />}
          </div>
        </div>

        {/* Right — detail */}
        <div className={s.detailPanel}>
          {!selectedId && (
            <EmptyState icon="◉" message="Select an employee to view all nested relationship data" />
          )}
          {selectedId && dLoad && <LoadingBlock />}

          {emp && (
            <div className={s.detail}>
              {/* Header */}
              <div className={s.empHeader}>
                <div className={s.bigAvatar}>{emp.firstName[0]}{emp.lastName[0]}</div>
                <div>
                  <h2 className={s.empName}>{emp.firstName} {emp.lastName}</h2>
                  <div className={s.empRole}>{emp.jobTitle}</div>
                  <div className={s.empTags}>
                    <Tag color="accent">ID: {emp.id}</Tag>
                    {emp.salary && <Tag color="yellow">₹{emp.salary.toLocaleString()}</Tag>}
                    {emp.hireDate && <Tag color="default">Joined {emp.hireDate}</Tag>}
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className={s.grid2}>
                <div className={s.infoBox}>
                  <div className={s.infoLbl}>Email</div>
                  <div className={s.infoVal}>{emp.email}</div>
                </div>
                <div className={s.infoBox}>
                  <div className={s.infoLbl}>Phone</div>
                  <div className={s.infoVal}>{emp.phone ?? '—'}</div>
                </div>
              </div>

              {/* Department — Many-to-One */}
              {emp.department && (
                <div className={s.section}>
                  <div className={s.secHeader}>
                    <RelBadge type="Many-to-One" from="Employee" to="Department" />
                  </div>
                  <div className={s.relTable}>
                    {[
                      ['ID',       emp.department.id],
                      ['Name',     emp.department.name],
                      ['Code',     emp.department.code],
                      ['Location', emp.department.location ?? '—'],
                      ['Budget',   emp.department.budget ? `₹${emp.department.budget.toLocaleString()}` : '—'],
                    ].map(([k, v]) => (
                      <div key={k} className={s.relRow2}>
                        <span className={s.relKey}>{k}</span>
                        <span className={s.relVal}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Profile — One-to-One */}
              <div className={s.section}>
                <div className={s.secHeader}>
                  <RelBadge type="One-to-One" from="Employee" to="EmployeeProfile" />
                </div>
                {emp.profile ? (
                  <div className={s.profileBox}>
                    {emp.profile.bio && <p className={s.bio}>{emp.profile.bio}</p>}
                    {emp.profile.skills && (
                      <div className={s.skills}>
                        {emp.profile.skills.split(',').map(sk => (
                          <Tag key={sk} color="cyan">{sk.trim()}</Tag>
                        ))}
                      </div>
                    )}
                    <div className={s.grid2} style={{ marginTop: '0.75rem' }}>
                      <div className={s.infoBox}>
                        <div className={s.infoLbl}>Location</div>
                        <div className={s.infoVal}>
                          {[emp.profile.address, emp.profile.city, emp.profile.country].filter(Boolean).join(', ') || '—'}
                        </div>
                      </div>
                      <div className={s.infoBox}>
                        <div className={s.infoLbl}>Links</div>
                        <div className={s.linkRow}>
                          {emp.profile.linkedinUrl && <a href={emp.profile.linkedinUrl} target="_blank" rel="noreferrer" className={s.link}>LinkedIn ↗</a>}
                          {emp.profile.githubUrl   && <a href={emp.profile.githubUrl}   target="_blank" rel="noreferrer" className={s.link}>GitHub ↗</a>}
                          {!emp.profile.linkedinUrl && !emp.profile.githubUrl && '—'}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <EmptyState icon="◈" message="No profile linked to this employee" />
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Full flat table */}
      <div style={{ marginTop: '2rem' }}>
        <SectionTitle>All Employees — Flat Table View</SectionTitle>
        <DataTable
          columns={['ID','First','Last','Email','Title','Department','Salary','Profile']}
          pkCols={['ID']}
          rows={employees.map(e => ({
            'ID':         e.id,
            'First':      e.firstName,
            'Last':       e.lastName,
            'Email':      e.email,
            'Title':      e.jobTitle ?? '—',
            'Department': e.department?.name ?? '—',
            'Salary':     e.salary ? `₹${e.salary.toLocaleString()}` : '—',
            'Profile':    e.profile ? '✓' : '✗',
          }))}
        />
      </div>
    </div>
  );
}
