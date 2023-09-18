// Import necessary packages and dependencies
require("dotenv").config();
const inquirer = require("inquirer");
const mysql = require("mysql2");

// Establish a connection to the database
const db = mysql.createConnection(
  {
    host: "localhost",
    user: "root",
    password: process.env.PASSWORD,
    database: "company_db",
  },
  console.log(`Connected to the company_db database.`),
);

// Connect to the database and start the main menu
db.connect((err) => {
  if (err) throw err;
  mainMenu();
})

// Define the main menu function to interact with the user
const mainMenu = () => {
  inquirer
    .prompt([
      {
        type: "list",
        name: "options",
        message: "What would you like to do?",
        choices: [
          "View Employee List",
          "View Departments List",
          "View Role List",
          "Add an Employee",
          "Add a Department",
          "Add a Role",
          "Update an Employee's Role",
          "Remove an Employee",
          "Remove a Department",
          "Remove a Role",
          "Exit",
        ],
      },
    ])
    .then((response) => {
      switch (response.options) {
        case "View Employee List":
          viewEmployees();
          break;
        case "View Departments List":
          viewDepartments();
          break;
        case "View Role List":
          viewRoles();
          break;
        case "Add an Employee":
          addEmployee();
          break;
        case "Add a Department":
          addDepartment();
          break;
        case "Add a Role":
          addRole();
          break;
        case "Update an Employee's Role":
          updateRole();
          break;
        case "Remove an Employee":
          removeEmployee();
          break;
        case "Remove a Department":
          removeDepartment();
          break;
        case "Remove a Role":
          removeRole();
          break;
        case "Exit":
          db.end();
          break;
      }
    });
};

// Define a function to view employees
const viewEmployees = () => {
  sql = `SELECT * FROM employee`;
  db.query(sql, (err, rows) => {
    if (err) {
      console.log(err);
    }
    console.table(rows);
    mainMenu();
  });
};


// Define a function to view departments
const viewDepartments = () => {
  sql = `SELECT * FROM department`;
  db.query(sql, (err, rows) => {
    if (err) {
      console.log(err);
    }
    console.table(rows);
    mainMenu();
  });
};

// Define a function to view roles
const viewRoles = () => {
  sql = `SELECT * FROM role`;
  db.query(sql, (err, rows) => {
    if (err) {
      console.log(err);
    }
    console.table(rows);
    mainMenu();
  });
};

// Define a function to add an employee
const addEmployee = () => {
  let getMan =
  `SELECT manager_id, first_name, last_name FROM employee WHERE manager_id IS NOT NULL;`;
  let getRole =
  `SELECT id, title FROM role;`;

  // Query to get all managers and map them into a variable for Inquirer
  const getManPromise = new Promise((resolve, reject) => {
  db.query(getMan, (err, rows) => {
    if (err) {
      reject(err);
    }
    resolve(rows.map(({ manager_id, first_name, last_name }) => ({
      name: `${first_name} ${last_name}`,
      id: `${manager_id}`
    })));
  });
  });
  // Query to get all roles and map them into a variable for Inquirer
  const getRolePromise = new Promise((resolve, reject) => {
  db.query(getRole, (err, rows) => {
    if (err) {
      reject(err);
    }
    resolve(rows.map(({ id, title }) => ({
      name: `${title}`,
      id: `${id}`
    })));
  });
  });
// Use Promise.all to wait for all promises to resolve
Promise.all([getManPromise, getRolePromise])
.then(([managerChoices, roleChoices]) => {
  // Run the Inquirer prompt after the database queries have completed
  inquirer
    .prompt([
      {
        type: "input",
        name: "first_name",
        message: "What is the employee's first name?",
      },
      {
        type: "input",
        name: "last_name",
        message: "What is the employee's last name?",
      },
      {
        type: "list",
        name: "role_id",
        message: "What is the employee's role?",
        choices: roleChoices.map(choice => { return {name: choice.name, value: choice.id}}),
      },
      {
        type: "list",
        name: "manager_id",
        message: "Who is the employee's manager?",
        choices: [...managerChoices.map(choice => { return {name: choice.name, value: choice.id}}), "None"],
      },
    ])
    .then((response) => {
      let sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`;
      let manager_id = response.manager_id === "None" ? null : response.manager_id;
      db.query(
        sql,
        [
          response.first_name,
          response.last_name,
          response.role_id,
          manager_id,
        ],
        (err, rows) => {
          if (err) {
            console.log(err);
          }
          console.log(`Employee ${response.first_name} ${response.last_name} added successfully!`);
          mainMenu();
        }
      );
    });
})
.catch(err => console.log(err));
};


// Define a function to add a role
const addRole = () => {
  // Query to get all employees to pass to the Inquirer prompt
  db.query(`SELECT * FROM employees`, (err, rows) => {
    if (err) {
      console.log(err);
    }
    const employeeChoices = rows.map(({ id, first_name, last_name }) => ({
      name: `${first_name} ${last_name}`,
      id: id,
    }));
  });
  // Pass the employeeChoices array to the Inquirer prompt, which allows the user to update a selected Employee
  inquirer
    .prompt([
      {
        type: "choice",
        name: "employee",
        message: "Which employee's role would you like to update?",
        choices: employeeChoices,
      },
    ])
    .then((response) => {
      inquirer
        .prompt([
          {
            type: "choice",
            name: "role",
            message: "What is the employee's new role?",
            choices: [
              "Sales Lead",
              "Salesperson",
              "Lead Engineer",
              "Software Engineer",
              "Account Manager",
              "Accountant",
              "Legal Team Lead",
              "Lawyer",
            ],
          },
        ])
        .then((response) => {
          sql = `UPDATE employees SET role_id = ? WHERE id = ?`;
          db.query(sql, [response.role, response.employee], (err, rows) => {
            if (err) {
              console.log(err);
            }
            console.table(rows);
            mainMenu();
          });
        });
    });
};

// Define a function to update an employee's role
const updateRole = () => {
  // Query to get all employees to pass to the Inquirer prompt
  db.query(`SELECT * FROM employees`, (err, rows) => {
    if (err) {
      console.log(err);
    }
    const employeeChoices = rows.map(({ id, first_name, last_name }) => ({
      name: `${first_name} ${last_name}`,
      id: id,
    }));
  });
  //Pass the employeeChoices array to the Inquirer prompt to allow the user to select an employee to update
  inquirer
    .prompt([
      {
        type: "choice",
        name: "employee",
        message: "Which employee's role would you like to update?",
        choices: employeeChoices,
      },
    ])
    .then((response) => {
      inquirer
        .prompt([
          {
            type: "choice",
            name: "role",
            message: "What is the employee's new role?",
            choices: [
              "Sales Lead",
              "Salesperson",
              "Lead Engineer",
              "Software Engineer",
              "Account Manager",
              "Accountant",
              "Legal Team Lead",
              "Lawyer",
            ],
          },
        ])
        .then((response) => {
          sql = `UPDATE employees SET role_id = ? WHERE id = ?`;
          db.query(sql, [response.role, response.employee], (err, rows) => {
            if (err) {
              console.log(err);
            }
            console.table(rows);
            mainMenu();
          });
        });
    });
};

// Define a function to remove an employee
const removeEmployee = () => {
  // Query to get all employees to pass to the Inquirer prompt
  db.query(`SELECT * FROM employees`, (err, rows) => {
    if (err) {
      console.log(err);
    }
    const employeeChoices = rows.map(({ id, first_name, last_name }) => ({
      name: `${first_name} ${last_name}`,
      id: id,
    }));
  });
  // Pass the employeeChoices array to the Inquirer prompt, which allows the user to update the selected employee
  inquirer
    .prompt([
      {
        type: "choice",
        name: "employee",
        message: "Which employee would you like to remove?",
        choices: employeeChoices,
      },
    ])
    .then((response) => {
      sql = `DELETE FROM employees WHERE id = ?`;
      db.query(sql, [response.employee], (err, rows) => {
        if (err) {
          console.log(err);
        }
        console.table(rows);
        mainMenu();
      });
    });
};

// Define a function to remove a department
const removeDepartment = () => {
  // Query to get all departments to pass to the Inquirer prompt
  db.query(`SELECT * FROM departments`, (err, rows) => {
    if (err) {
      console.log(err);
    }
    const departmentChoices = rows.map(({ id, department_name }) => ({
      name: `${department_name}`,
      id: id,
    }));
  });
  // Pass the departmentChoices array to the Inquirer prompt, which allows the user to update the selected employee
  inquirer
    .prompt([
      {
        type: "choice",
        name: "department",
        message: "Which department would you like to remove?",
        choices: departmentChoices,
      },
    ])
    .then((response) => {
      sql = `DELETE FROM departments WHERE id = ?`;
      db.query(sql, [response.department], (err, rows) => {
        if (err) {
          console.log(err);
        }
        console.table(rows);
        mainMenu();
      });
    });
};

// Define a function to remove a role
const removeRole = () => {
   // Query to get all roles to pass to the Inquirer prompt
  db.query(`SELECT * FROM role`, (err, rows) => {
    if (err) {
      console.log(err);
    }
    const roleChoices = rows.map(({ id, title }) => ({
      name: `${title}`,
      id: id,
    }));
  });
   // Pass the roleChoices array to the Inquirer prompt, which allows the user to update the selected employee
  inquirer
    .prompt([
      {
        type: "choice",
        name: "role",
        message: "Which role would you like to remove?",
        choices: roleChoices,
      },
    ])
    .then((response) => {
      sql = `DELETE FROM role WHERE id = ?`;
      db.query(sql, [response.role], (err, rows) => {
        if (err) {
          console.log(err);
        }
        console.table(rows);
        mainMenu();
      });
    });
};


