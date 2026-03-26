import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_DEPARTMENTS, GET_DEPARTMENT } from '../graphql/queries.js';
import {
  PageHeader, Card, Tag, LoadingBlock, ErrorBlock,
  SectionTitle, DataTable, EmptyState, RelBadge
} from '../components/UI.jsx';
import s from './DepartmentsPage.module.css';

export default function DepartmentsPage() {
  const [selectedId, setSelectedId] = useState(null);

  const { data: listData, loading: listLoad, error: listErr } = useQuery(GET_DEPARTMENTS);
  const { data: detailData, loading: detailLoad } = useQuery(GET_DEPARTMENT, {
    variables: { id: selectedId },
    skip: !selectedId,
  });

  const departments = listData?.departments ?? [];
  const detail      = detailData?.department;

  if (listLoad) return <LoadingBlock />;
  if (listErr)  return <ErrorBlock message={listErr.message} />;

  const empCols = ['ID', 'Name', 'Job Title', 'Email', 'Salary', 'Hire Date', 'City'];
  const empRows = (detail?.employees ?? []).map(e => ({
    'ID':       e.id,
    'Name':     `${e.firstName} ${e.lastName}`,
    'Job Title': e.jobTitle ?? '—',
    'Email':    e.email,
    'Salary':   e.salary ? `₹${e.salary.toLocaleString()}` : '—',
    'Hire Date': e.hireDate ?? '—',
    'City':     e.profile?.city ?? '—',
  }));

  return (
    <div className={s.page}>
      <PageHeader
        title="Departments"
        subtitle="Select a department to view nested employee data (One-to-Many)"
        badge={`${departments.length} TOTAL`}
      />

      <div className={s.layout}>
        {/* Left — list */}
        <div className={s.listCol}>
          <SectionTitle>All Departments</SectionTitle>
          {departments.map(dept => (
            <Card
              key={dept.id}
              className={s.deptCard}
              onClick={() => setSelectedId(dept.id)}
              active={selectedId == dept.id}
            >
              <div className={s.cardTop}>
                <div>
                  <div className={s.deptName}>{dept.name}</div>
                  <div className={s.deptMeta}>
                    <Tag color="accent">{dept.code}</Tag>
                    {dept.location && <span className={s.loc}>◎ {dept.location}</span>}
                  </div>
                </div>
                <div className={s.bubble}>{dept.employeeCount}</div>
              </div>
              {dept.budget && (
                <div className={s.budget}>Budget <strong>₹{dept.budget.toLocaleString()}</strong></div>
              )}
              {dept.createdAt && (
                <div className={s.createdAt}>Created {dept.createdAt.split('T')[0]}</div>
              )}
            </Card>
          ))}
        </div>

        {/* Right — detail */}
        <div className={s.detailCol}>
          {!selectedId && (
            <EmptyState icon="⬡" message="Click a department on the left to view its employees" />
          )}
          {selectedId && detailLoad && <LoadingBlock />}

          {detail && (
            <div className={s.detailContent}>
              {/* Header */}
              <div className={s.detailHeader}>
                <div>
                  <h2 className={s.detailTitle}>{detail.name}</h2>
                  <div className={s.detailTags}>
                    <Tag color="accent">{detail.code}</Tag>
                    {detail.location && <Tag color="default">◎ {detail.location}</Tag>}
                  </div>
                </div>
                <div className={s.detailNumbers}>
                  {detail.budget && (
                    <div className={s.dNum}>
                      <span className={s.dNumVal}>₹{(detail.budget / 1e6).toFixed(1)}M</span>
                      <span className={s.dNumLbl}>Budget</span>
                    </div>
                  )}
                  <div className={s.dNum}>
                    <span className={s.dNumVal}>{detail.employeeCount}</span>
                    <span className={s.dNumLbl}>Employees</span>
                  </div>
                </div>
              </div>

              {/* Relationship label */}
              <div className={s.relRow}>
                <RelBadge type="One-to-Many" from={`Department #${detail.id}`} to={`${detail.employeeCount} Employees`} />
              </div>

              <SectionTitle>Employees in this Department</SectionTitle>
              {empRows.length === 0
                ? <EmptyState message="No employees found" />
                : <DataTable columns={empCols} rows={empRows} pkCols={['ID']} />
              }

              {/* One-to-One profiles */}
              {detail.employees?.some(e => e.profile) && (
                <>
                  <div style={{ marginTop: '1.5rem' }}>
                    <SectionTitle>One-to-One: Employee Profiles</SectionTitle>
                  </div>
                  <div className={s.profileGrid}>
                    {detail.employees.filter(e => e.profile).map(emp => (
                      <div key={emp.id} className={s.profileMini}>
                        <div className={s.miniAvatar}>{emp.firstName[0]}{emp.lastName[0]}</div>
                        <div>
                          <div className={s.miniName}>{emp.firstName} {emp.lastName}</div>
                          <div className={s.miniSkills}>
                            {emp.profile.skills?.split(',').slice(0, 2).join(', ')}
                          </div>
                          {emp.profile.city && (
                            <div className={s.miniCity}>◎ {emp.profile.city}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
