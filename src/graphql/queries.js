import { gql } from '@apollo/client';

// ── Department Queries ────────────────────────────────────────────────

export const GET_DEPARTMENTS = gql`
  query GetDepartments {
    departments {
      id
      name
      code
      location
      budget
      createdAt
      employeeCount
      employees {
        id
        firstName
        lastName
        jobTitle
        email
        salary
        profile { id bio skills city country }
      }
    }
  }
`;

export const GET_DEPARTMENT = gql`
  query GetDepartment($id: ID!) {
    department(id: $id) {
      id
      name
      code
      location
      budget
      createdAt
      employeeCount
      employees {
        id
        firstName
        lastName
        email
        phone
        salary
        hireDate
        jobTitle
        profile {
          id
          bio
          skills
          linkedinUrl
          githubUrl
          city
          country
        }
      }
    }
  }
`;

// ── Employee Queries ──────────────────────────────────────────────────

export const GET_EMPLOYEES = gql`
  query GetEmployees {
    employees {
      id
      firstName
      lastName
      email
      phone
      salary
      hireDate
      jobTitle
      department {
        id
        name
        code
        location
      }
      profile {
        id
        bio
        skills
        city
        country
        linkedinUrl
        githubUrl
      }
    }
  }
`;

export const GET_EMPLOYEE = gql`
  query GetEmployee($id: ID!) {
    employee(id: $id) {
      id
      firstName
      lastName
      email
      phone
      salary
      hireDate
      jobTitle
      department {
        id
        name
        code
        location
        budget
      }
      profile {
        id
        bio
        skills
        linkedinUrl
        githubUrl
        address
        city
        country
      }
    }
  }
`;

export const GET_EMPLOYEES_BY_DEPT = gql`
  query GetEmployeesByDept($departmentId: ID!) {
    employeesByDepartment(departmentId: $departmentId) {
      id
      firstName
      lastName
      email
      jobTitle
      salary
      hireDate
      profile { id bio skills city }
    }
  }
`;

// ── Table Introspection Queries ───────────────────────────────────────

export const GET_AVAILABLE_TABLES = gql`
  query GetAvailableTables {
    availableTables {
      tableName
      rowCount
    }
  }
`;

export const GET_TABLE_STRUCTURE = gql`
  query GetTableStructure($tableName: String!) {
    tableStructure(tableName: $tableName) {
      tableName
      columns {
        columnName
        dataType
        isNullable
        columnDefault
        isPrimaryKey
      }
    }
  }
`;

export const GET_TABLE_RECORDS = gql`
  query GetTableRecords($tableName: String!) {
    tableRecords(tableName: $tableName) {
      tableName
      columns
      rows
      totalRows
    }
  }
`;

// ── Department Mutations ──────────────────────────────────────────────

export const CREATE_DEPARTMENT = gql`
  mutation CreateDepartment($input: DepartmentInput!) {
    createDepartment(input: $input) {
      id name code location budget
    }
  }
`;

export const UPDATE_DEPARTMENT = gql`
  mutation UpdateDepartment($id: ID!, $input: DepartmentInput!) {
    updateDepartment(id: $id, input: $input) {
      id name code location budget
    }
  }
`;

export const DELETE_DEPARTMENT = gql`
  mutation DeleteDepartment($id: ID!) {
    deleteDepartment(id: $id)
  }
`;

// ── Employee Mutations ────────────────────────────────────────────────

export const CREATE_EMPLOYEE = gql`
  mutation CreateEmployee($input: EmployeeInput!) {
    createEmployee(input: $input) {
      id firstName lastName email jobTitle
      department { id name }
    }
  }
`;

export const UPDATE_EMPLOYEE = gql`
  mutation UpdateEmployee($id: ID!, $input: EmployeeInput!) {
    updateEmployee(id: $id, input: $input) {
      id firstName lastName email jobTitle
      department { id name }
    }
  }
`;

export const DELETE_EMPLOYEE = gql`
  mutation DeleteEmployee($id: ID!) {
    deleteEmployee(id: $id)
  }
`;

// ── Profile Mutations ─────────────────────────────────────────────────

export const CREATE_PROFILE = gql`
  mutation CreateProfile($input: EmployeeProfileInput!) {
    createEmployeeProfile(input: $input) {
      id bio skills city country
      employee { id firstName lastName }
    }
  }
`;

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($employeeId: ID!, $input: EmployeeProfileInput!) {
    updateEmployeeProfile(employeeId: $employeeId, input: $input) {
      id bio skills city country
    }
  }
`;
