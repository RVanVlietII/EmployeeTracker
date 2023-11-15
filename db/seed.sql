USE employeeDB ;

INSERT INTO department (name)
VALUES ('Tech'), ('Retail');

INSERT INTO role (title, salary, departmentId)
VALUES ('Design Director', 90000, 1), ('Web Designer', 50000, 1), ('Print Designer', 40000, 1), ('Creative Director', 80000, 2), ('Marketing Manager', 70000, 2), ('Social Media Specialist', 40000, 2);

INSERT INTO employee (firstName, lastName, roleId)
VALUES ('Alan', 'Brown', 1), ('Cole', 'Dillon', 4), ('Ernie', 'Ford', 5);

INSERT INTO employee (firstName, lastName, roleId, managerId)
VALUES ('Grant', 'Hilton', 2, 2), ('Jack', 'Klondike', 3, 1), ('Lauren', 'McDonald', 6, 3);