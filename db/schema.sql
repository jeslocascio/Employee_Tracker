-- Removes the database "company_db" if it exists already
DROP DATABASE IF EXISTS company_db;

-- Makes a new database called "company_db"
CREATE DATABASE company_db;

-- Establishes that we are using "company_db"
USE company_db;

-- Creates the table "department" with the id and name attributes
CREATE TABLE department (
  id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
  name VARCHAR(30) NOT NULL
);

-- Creates a table named "role" with the id, title, salary, and department_id attributes
CREATE TABLE role (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(30),
  salary DECIMAL,
  department_id INT,
  FOREIGN KEY(department_id)
  REFERENCES department(id)
  ON DELETE SET NULL
);

-- Creates a tabled named "employee" with the id, first_name, last_name, role_id, and manager_id attributes
CREATE TABLE employee (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(30),
  last_name VARCHAR(30),
  role_id INT,
  manager_id INT NULL,
  FOREIGN KEY(role_id)
  REFERENCES role(id)
  ON DELETE SET NULL
);