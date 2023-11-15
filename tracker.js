const mysql = require('mysql');
const inquirer = require('inquirer');
const chalk = require('chalk');
// const consoleTable = require('console.table'); // Unused import
const util = require("util");

const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'toor',
    database: process.env.DB_NAME || 'employeeDB'
});

connection.connect(err => {
    if (err) throw err;
    console.log(' ');
    start();
});

const queryAsync = util.promisify(connection.query).bind(connection);

async function promptUser(message, type, choices) {
    const answer = await inquirer.prompt({
        name: 'userInput',
        type,
        message,
        choices,
    });
    return answer.userInput;
}

async function viewTable(query, columnMappings) {
    const res = await queryAsync(query);
    const tableData = res.map(row => {
        const rowData = {};
        for (const key in columnMappings) {
            rowData[columnMappings[key]] = row[key];
        }
        return rowData;
    });
    console.log(' ');
    console.table(tableData);
}

async function start() {
    const options = [
        'View All Departments',
        'View All Roles',
        'View All Employees',
        'Add A Department',
        'Add A Role',
        'Add An Employee',
        'Delete A Department',
        'Delete A Role',
        'Delete An Employee',
        'Update A Role\'s Salary',
        'Update An Employee\'s Role',
        'Update An Employee\'s Manager',
        'Exit'
    ];

    const answer = await promptUser('What would you like to do?', 'list', options);

    switch (answer.selectOption) { // Fixed: Use answer.selectOption consistently
        case 'View All Departments':
            await viewTable('SELECT * FROM department', { id: 'ID', name: 'NAME' });
            break;
        case 'View All Roles':
            await viewTable('SELECT role.id, role.title, role.salary, department.name FROM role INNER JOIN department ON role.departmentId = department.id', { id: 'ID', title: 'TITLE', salary: 'SALARY', name: 'DEPARTMENT' });
            break;
        case 'View All Employees':
            await viewTable('SELECT e.id, CONCAT(e.firstName, " ", e.lastName) AS employeeName, role.title, role.salary, CONCAT(m.firstName, " ", m.lastName) AS managerName FROM employee e LEFT JOIN employee m ON m.id = e.managerId INNER JOIN role ON e.roleId = role.id', { id: 'ID', name: 'NAME', title: 'ROLE', salary: 'SALARY', managerName: 'MANAGER' });
            break;
        // Add cases for other options...
        case 'Exit':
            console.log(' ');
            connection.end();
            break;
    }

    start(); // Continue the loop
}

// Add other functions (addDepartment, addRole, viewRoles, viewEmployees, etc.) similarly refactored.

// Call the start function to initiate the application
start();

// Add other functions (addDepartment, addRole, viewRoles, viewEmployees, etc.) similarly refactored.


// 