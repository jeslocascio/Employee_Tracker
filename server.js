// Import necessary packages and dependencies
require("dotenv").config();
const inquirer = require("inquirer");
const mysql = require("mysql2");

// Function to display the title
const displayTitle = () => {
  console.log(
    `
 #######                                                 
 #       #    # #####  #       ####  #   # ###### ###### 
 #       ##  ## #    # #      #    #  # #  #      #      
 #####   # ## # #    # #      #    #   #   #####  #####  
 #       #    # #####  #      #    #   #   #      #      
 #       #    # #      #      #    #   #   #      #      
 ####### #    # #      ######  ####    #   ###### ###### 
 #######                                                 
    #    #####    ##    ####  #    # ###### #####        
    #    #    #  #  #  #    # #   #  #      #    #       
    #    #    # #    # #      ####   #####  #    #       
    #    #####  ###### #      #  #   #      #####        
    #    #   #  #    # #    # #   #  #      #   #        
    #    #    # #    #  ####  #    # ###### #    # 
    ------------------------------------------------------
    ------------------------------------------------------


    `
  )
}

//Call the displayTitle function to display the title
displayTitle();

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
  sql = 
  `SELECT employee.id, employee.first_name, employee.last_name, role.title AS role, role.salary, department.name AS department, CONCAT(manager.first_name, ' ', manager.last_name) AS manager
  FROM employee
  LEFT JOIN employee AS manager ON employee.manager_id = manager.id  
  LEFT JOIN role ON employee.role_id = role.id
  LEFT JOIN department ON role.department_id = department.id;
  `;
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
  sql = 
  `SELECT role.id, role.title AS role, role.salary, department.name AS department
  FROM role
  LEFT JOIN department ON role.department_id = department.id`;
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
            choices: roleChoices.map(choice => { return { name: choice.name, value: choice.id } }),
          },
          {
            type: "list",
            name: "manager_id",
            message: "Who is the employee's manager?",
            choices: [...managerChoices.map(choice => { return { name: choice.name, value: choice.id } }), "None"],
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


//Define a function to add a department
const addDepartment = () => {
  inquirer
    .prompt([
      {
        type: "input",
        name: "department_name",
        message: "What is the department you would like to add?",
      },
    ])
  .then((res) => {
    // Query to insert new department into department table
    db.query(`INSERT INTO department (name) VALUES (?)`,
    [res.department_name], (err, result) => {
      if (err) throw err;

      console.log(`Added department: ${res.department_name}`);
      viewDepartments();
    });
  });
};

// Define a function to add a role
const addRole = () => {
 // Query is selecting all rows from the department table
  db.query(`SELECT * from department`, (err, rows) => {
    if (err) throw err;

    const departmentOptions = rows.map((department) => ({
      name: department.name,
      value: department.id
    }));

    inquirer
      .prompt([
        {
          type: "input",
          name: "role",
          message: "What is the role called?",
        },
        {
          type: "input",
          name: "salary",
          message: "How much does this role earn?",
        },
        {
          type: "list",
          name: "department_id",
          message: "What department will the employee be working in?",
          choices: departmentOptions,
        },
      ])
      .then((res) => {

        //Query is inserting the newly created role into the department table
        db.query(`INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`,
        [res.role, res.salary, res.department_id],
        (err, result) => {
          if (err) throw err;
      
          console.log(
            `Added Role: ${res.role} Salary: ${res.salary} Department: ${departmentOptions.find(
              (department) => department.value === res.department_id
            ).name
          }`
          );
        }
      );
        viewRoles();
      });
  });
};

// Define a function to update an employee's role
const updateRole = () => {

  // Collecting information from the employee table
  const getEmployeeList = `SELECT id, CONCAT(first_name, ' ', last_name) AS employee_name from employee`;

  const getRoleList = `SELECT id, title FROM role`;

  //Query is passing the information we collected in getEmployeeList
  db.query(getEmployeeList, (err, employees) => {
    if (err) throw err;

    // Query is passing the information we collected in getRoleList
    db.query(getRoleList, (err, roles) => {
      if (err) throw err;

      const employeeOptions = employees.map((employee) => ({
        name: employee.employee_name,
        value: employee.id,
      }));

      const roleOptions = roles.map((role) => ({
        name: role.title,
        value: role.id,
      }));

      inquirer
        .prompt([
          {
            type: "list",
            name: "employee",
            message: "Which employee are you updating?",
            choices: employeeOptions,
          },
          {
            type: "list",
            name: "role",
            message: "What role will this employee be assigned to?",
            choices: roleOptions,
          },
        ])
        .then((res) => {
          db.query(`UPDATE employee SET role_id = ? WHERE id = ?`,
          [res.role, res.employee], (err, result) => {
            if (err) throw err;

            const chosenEmployee = employees.find(
              (employee) => employee.id === res.employee
            );

            const chosenRole = roles.find((role) => role.id === res.role);
            console.log(
              `UPDATE employee ${chosenEmployee.employee_name} to role ${chosenRole.title}`
            );
            viewEmployees();
          });
        });
    });
  });
};

// Define a function to remove an employee
const removeEmployee = () => {
  // Query the database to get a list of employees
  const getEmployeeList = `
    SELECT id, CONCAT(first_name, ' ', last_name) AS employee_name
    FROM employee
  `;

  db.query(getEmployeeList, (err, employees) => {
    if (err) throw err;

    // Extract employee names and ids from the query result
    const employeeChoices = employees.map((employee) => ({
      name: employee.employee_name,
      value: employee.id,
    }));

    inquirer
      .prompt([
        {
          type: "list",
          name: "employee",
          message: "Which employee would you like to delete?",
          choices: employeeChoices,
        },
      ])
      .then((res) => {
        const query = `
          DELETE FROM employee WHERE id = ?
        `;
        db.query(query, [res.employee], (err, result) => {
          if (err) throw err;
          // Retrieve the selected employee's name
          const selectedEmployee = employees.find(
            (employee) => employee.id === res.employee
          );
          console.log(`Deleted employee ${selectedEmployee.name}`);
          viewEmployees();
        });
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



