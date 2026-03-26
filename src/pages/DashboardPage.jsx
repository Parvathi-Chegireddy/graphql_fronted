import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_DEPARTMENTS, GET_EMPLOYEES } from '../graphql/queries.js';
import {
  PageHeader, StatCard, Card, Tag, RelBadge,
  LoadingBlock, ErrorBlock, SectionTitle
} from '../components/UI.jsx';
import s from './DashboardPage.module.css';

export default function DashboardPage() {
  const { data: dData, loading: dLoad, error: dErr } = useQuery(GET_DEPARTMENTS);
  const { data: eData, loading: eLoad, error: eErr } = useQuery(GET_EMPLOYEES);

  if (dLoad || eLoad) return <LoadingBlock />;
  if (dErr) return <ErrorBlock message={dErr.message} />;
  if (eErr) return <ErrorBlock message={eErr.message} />;

  const departments = dData?.departments ?? [];
  const employees   = eData?.employees   ?? [];

  const totalBudget   = departments.reduce((a, d) => a + (d.budget ?? 0), 0);
  const avgSalary     = employees.length
    ? Math.round(employees.reduce((a, e) => a + (e.salary ?? 0), 0) / employees.length) : 0;
  const profiledCount = employees.filter(e => e.profile).length;

  return (
    <div className={s.page}>
      <PageHeader
        title="Dashboard"
        subtitle="Live data fetched from GraphQL · Spring Boot 4.0.4 · PostgreSQL · JDK 26"
        badge="LIVE"
      />

      {/* Stats */}
      <div className={s.stats}>
        <StatCard icon="⬡" label="Departments"  value={departments.length} sub="One-to-Many owners"      color="accent" />
        <StatCard icon="◉" label="Employees"    value={employees.length}   sub="Many-to-One + One-to-One" color="green"  />
        <StatCard icon="◈" label="With Profiles" value={profiledCount}     sub="One-to-One linked"        color="cyan"   />
        <StatCard icon="₹" label="Avg Salary"   value={`₹${avgSalary.toLocaleString()}`} sub="Across all staff" color="yellow" />
        <StatCard icon="⬡" label="Total Budget" value={`₹${(totalBudget/1e6).toFixed(1)}M`} sub="Sum of dept budgets" color="orange" />
      </div>

      {/* Relationship overview */}
      <div className={s.relRow}>
        <RelBadge type="One-to-Many" from="Department" to="Employee[]" />
        <RelBadge type="Many-to-One" from="Employee"   to="Department" />
        <RelBadge type="One-to-One"  from="Employee"   to="EmployeeProfile" />
      </div>

      <div className={s.cols}>
        {/* Departments column */}
        <div>
          <SectionTitle>Departments → Employees (One-to-Many)</SectionTitle>
          <div className={s.deptList}>
            {departments.map(dept => (
              <Card key={dept.id} className={s.deptCard}>
                <div className={s.deptTop}>
                  <div>
                    <div className={s.deptName}>{dept.name}</div>
                    <div className={s.deptMeta}>
                      <Tag color="accent">{dept.code}</Tag>
                      {dept.location && <span className={s.metaTxt}>◎ {dept.location}</span>}
                    </div>
                  </div>
                  <div className={s.empBubble}>{dept.employeeCount}</div>
                </div>
                {dept.budget && (
                  <div className={s.budget}>Budget: <strong>₹{dept.budget.toLocaleString()}</strong></div>
                )}
                {/* Nested employees */}
                {dept.employees?.slice(0, 3).map(emp => (
                  <div key={emp.id} className={s.empChip}>
                    <div className={s.chipAvatar}>{emp.firstName[0]}{emp.lastName[0]}</div>
                    <div>
                      <div className={s.chipName}>{emp.firstName} {emp.lastName}</div>
                      <div className={s.chipRole}>{emp.jobTitle}</div>
                    </div>
                  </div>
                ))}
                {dept.employees?.length > 3 && (
                  <div className={s.moreEmp}>+{dept.employees.length - 3} more employees</div>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Profiles column */}
        <div>
          <SectionTitle>Employees with Profiles (One-to-One)</SectionTitle>
          <div className={s.profileList}>
            {employees.filter(e => e.profile).map(emp => (
              <Card key={emp.id} className={s.profileCard}>
                <div className={s.profHeader}>
                  <div className={s.profAvatar}>{emp.firstName[0]}{emp.lastName[0]}</div>
                  <div className={s.profInfo}>
                    <div className={s.profName}>{emp.firstName} {emp.lastName}</div>
                    <div className={s.profRole}>{emp.jobTitle}</div>
                    <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.2rem' }}>
                      <Tag color="default">{emp.department?.name}</Tag>
                    </div>
                  </div>
                </div>
                {emp.profile?.bio && (
                  <p className={s.bio}>{emp.profile.bio.slice(0, 85)}…</p>
                )}
                {emp.profile?.skills && (
                  <div className={s.skillsRow}>
                    {emp.profile.skills.split(',').slice(0, 4).map(sk => (
                      <Tag key={sk} color="cyan">{sk.trim()}</Tag>
                    ))}
                  </div>
                )}
                <div className={s.profLinks}>
                  {emp.profile?.linkedinUrl && <a href={emp.profile.linkedinUrl} target="_blank" rel="noreferrer" className={s.link}>LinkedIn ↗</a>}
                  {emp.profile?.githubUrl   && <a href={emp.profile.githubUrl}   target="_blank" rel="noreferrer" className={s.link}>GitHub ↗</a>}
                  {emp.profile?.city && <span className={s.metaTxt}>◎ {emp.profile.city}</span>}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Query info bar */}
      <div className={s.queryBar}>
        <span className={s.queryLabel}>GraphQL Queries active on this page</span>
        <span className={s.queryChip}>GET_DEPARTMENTS (nested employees)</span>
        <span className={s.queryChip}>GET_EMPLOYEES (nested department + profile)</span>
      </div>
    </div>
  );
}
