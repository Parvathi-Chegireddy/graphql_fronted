import React from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import DashboardPage     from './pages/DashboardPage.jsx';
import DepartmentsPage   from './pages/DepartmentsPage.jsx';
import EmployeesPage     from './pages/EmployeesPage.jsx';
import TableExplorerPage from './pages/TableExplorerPage.jsx';
import styles from './App.module.css';

const NAV = [
  { to: '/',               icon: '◈', label: 'Dashboard',      section: 'MAIN' },
  { to: '/departments',    icon: '⬡', label: 'Departments'     },
  { to: '/employees',      icon: '◉', label: 'Employees'       },
  { to: '/table-explorer', icon: '◫', label: 'Table Explorer', section: 'TOOLS' },
];

export default function App() {
  return (
    <div className={styles.root}>

      <aside className={styles.sidebar}>
        {/* Logo */}
        <div className={styles.logo}>
          <span className={styles.logoHex}>⬡</span>
          <div>
            <div className={styles.logoMain}>GraphQL</div>
            <div className={styles.logoSub}>Spring Boot 4 · PostgreSQL · JDK 26</div>
          </div>
        </div>

        {/* Nav */}
        <nav className={styles.nav}>
          {NAV.map(item => (
            <React.Fragment key={item.to}>
              {item.section && (
                <div className={styles.navSection}>{item.section}</div>
              )}
              <NavLink
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.navActive : ''}`
                }
              >
                <span className={styles.navIcon}>{item.icon}</span>
                {item.label}
              </NavLink>
            </React.Fragment>
          ))}
        </nav>

        {/* Footer */}
        <div className={styles.sideFooter}>
          <div className={styles.techBadge}>
            <span className={styles.liveDot} />
            <span>localhost:8080/graphql</span>
          </div>
          <div className={styles.techStack}>
            <span>Spring Boot 4.0.4</span>
            <span>·</span>
            <span>JDK 26</span>
            <span>·</span>
            <span>PostgreSQL</span>
          </div>
          <a
            href="http://localhost:8080/graphiql"
            target="_blank"
            rel="noreferrer"
            className={styles.graphiqlLink}
          >
            Open GraphiQL IDE ↗
          </a>
        </div>
      </aside>

      <main className={styles.main}>
        <Routes>
          <Route path="/"               element={<DashboardPage />}     />
          <Route path="/departments"    element={<DepartmentsPage />}   />
          <Route path="/employees"      element={<EmployeesPage />}     />
          <Route path="/table-explorer" element={<TableExplorerPage />} />
        </Routes>
      </main>

    </div>
  );
}
