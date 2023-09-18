-- Adds values into the department table
INSERT INTO department(name)
VALUES ("Management"),
       ("Sales"),
       ("Tech"),
       ("Customer Service");

-- Adds values into the role table
INSERT INTO role(title, salary, department_id)
VALUES ("Manager", 120000, 1),
       ("Engineer", 100000, 2),
       ("Technician", 90000, 3),
       ("Sales", 80000, 4);

-- Adds values into the employee table
INSERT INTO employee(first_name, last_name, role_id, manager_id)
VALUES ("John", "Smith", 1, 2),
       ("Billy", "Bob", 2, 3),
       ("Fran", "Fine", 3, 5),
       ("Micheal", "Hero", 4, 5),
       ("Patty", "Archer", 2, 2),
       ("Sylvia", "Deleto", 1, null),
       ("Vicky", "Thompson", 4, 2);


