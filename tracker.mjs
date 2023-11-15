
import mysql from 'mysql2/promise';
import inquirer from 'inquirer';
import chalk from 'chalk';

async function performAction(connection) {
    await start(connection);
}


async function start(connection) {
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

    switch (answer) {
        case 'View All Departments':
            await viewTable(connection, 'SELECT * FROM department', { id: 'ID', name: 'NAME' });
            break;
        case 'View All Roles':
            await viewTable(connection, 'SELECT role.id, role.title, role.salary, department.name FROM role INNER JOIN department ON role.departmentId = department.id', { id: 'ID', title: 'TITLE', salary: 'SALARY', name: 'DEPARTMENT' });
            break;
        case 'View All Employees':
            await viewTable(connection, 'SELECT e.id, CONCAT(e.firstName, " ", e.lastName) AS employeeName, role.title, role.salary, CONCAT(m.firstName, " ", m.lastName) AS managerName FROM employee e LEFT JOIN employee m ON m.id = e.managerId INNER JOIN role ON e.roleId = role.id', { id: 'ID', name: 'NAME', title: 'ROLE', salary: 'SALARY', managerName: 'MANAGER' });
            break;
        case 'Exit':
            console.log(' ');
            connection.end();
            break;
    }

    await performAction(connection); 
}

async function promptUser(message, type, choices) {
    const answer = await inquirer.prompt({
        name: 'userInput',
        type,
        message,
        choices,
    });
    return answer.userInput;
}


async function queryAsync(connection, query, values = []) {
    try {
        const [rows] = await connection.query(query, values);
		console.log(rows);
        return rows;
    } catch (error) {
        throw error;
    }
}


async function viewTable(connection, query, columnMappings) {
    try {
        const res = await queryAsync(connection, query);
        const tableData = res.map(row => {
            const rowData = {};
            for (const key in columnMappings) {
                rowData[columnMappings[key]] = row[key];
            }
            return rowData;
        });
        console.log(' ');
        console.table(tableData);
    } catch (error) {
        console.error('Error viewing table:', error);
    }
}




async function main() {
    try {
        // Create a database connection
        const connection = await mysql.createConnection({
            host: 'localhost',
            port: 3306,
            user: 'root',
            password: 'toor',
            database: 'employeeDB'
        });

        console.log(' ');
        await start(connection); // Start the application
    } catch (error) {
        console.error('Error connecting to the database:', error);
    }
}

// Start the main function
main();

async function viewDepartments() {
	const res = await queryAsync(connection, 'SELECT * FROM department');
	const allDepartments = [];
	console.log(' ');
    for (let i of res) {
	    allDepartments.push({ ID: i.id, NAME: i.name });
    }
    console.table(allDepartments);
    start();
};


async function viewRoles() {
	const res = await queryAsync(connection, 'SELECT role.id, role.title, role.salary, department.name FROM role INNER JOIN department ON role.departmentId = department.id');
	const allRoles = [];
    console.log(' ');
    for (let i of res) {
	    allRoles.push({ ID: i.id, TITLE: i.title, SALARY: i.salary, DEPARTMENT: i.name });
    }
    console.table(allRoles);
    start();
};


async function viewEmployees() {	
	const res = await queryAsync(connection, 'SELECT e.id, CONCAT(e.firstName, " ", e.lastName) AS employeeName, role.title, role.salary, CONCAT(m.firstName, " ", m.lastName) AS managerName FROM employee e LEFT JOIN employee m ON m.id = e.managerId INNER JOIN role ON e.roleId = role.id');
	const allEmployees = [];
	console.log(' ');
    for (let i of res) {   
	    allEmployees.push({ ID: i.id, NAME: i.employeeName, ROLE: i.title, SALARY: i.salary, MANAGER: i.managerName });
    }
	console.table(allEmployees);
    start();
};


async function addDepartment() {
	const answer = await inquirer.prompt({
		name: 'departmentName',
		type: 'input',
		message: 'Department Name:'
	});	
	await queryAsync('INSERT INTO department SET ?', { name: answer.departmentName });
	console.log(chalk.bold.bgCyan('\nSUCCESS:'), 'Department was added.');
	viewDepartments();
};




async function addRole() {
	const res = await queryAsync(connection, 'SELECT * FROM department');	
	const answer = await inquirer.prompt([
		{
			name: 'role',
			type: 'input',
			message: 'Role Name:'
		},
		{
			name: 'salary',
			type: 'input',
			message: 'Salary:',
			validate: value => {
			  if (isNaN(value) === false) return true;
			  return false;
			}
		},
		{
			name: 'department',
			type: 'list',
			message: 'Department:',
			choices: () => {
				const departments = [];
				for (let i of res) {
					departments.push(i.name);
				}
				return departments;
			}
		}
	]);
	let departmentId;
	for (let i of res) {
		if (i.name === answer.department) {
			departmentId = i.id;
  		}
	}  	      	
	await queryAsync('INSERT INTO role SET ?', { title: answer.role, salary: answer.salary, departmentId: departmentId });
	console.log(chalk.bold.bgCyan('\nSUCCESS:'), 'Role was added.');
	viewRoles();
};



async function addEmployee() {
	const resR = await queryAsync(connection, 'SELECT * FROM role');
	const answerR = await inquirer.prompt([
		{
			name: 'firstName',
			type: 'input',
			message: 'First Name:'
		},
		{
			name: 'lastName',
			type: 'input',
			message: 'Last Name:'
		},	
		{
			name: 'role',
			type: 'list',
			message: 'Role:',
			choices: () => {
				const roles = [];
				for (let i of resR) {
					roles.push(i.title);
				}
				return roles;
			}
		}
	]);	
	const resE = await queryAsync(connection, 'SELECT employee.id, CONCAT(employee.firstName, " ", employee.lastName) AS employeeName, employee.roleId, employee.managerId FROM employee');
	const answerE = await inquirer.prompt({
		name: 'employee',
		type: 'list',
		message: 'Manager:',
		choices: () => {
			const names = ['None'];
			for (let i of resE) {
				names.push(i.employeeName);
			}
			return names;
		}
	});	
	let roleId;
	for (let i of resR) {
		if (i.title === answerR.role) {
			roleId = i.id;
  		}
	}	
	let managerId;
	for (let i of resE) {
		if (i.employeeName === answerE.employee) {
			managerId = i.id;
		}
	}	
	await queryAsync('INSERT INTO employee SET ?', { firstName: answerR.firstName, lastName: answerR.lastName, roleId: roleId, managerId: managerId});
	console.log(chalk.bold.bgCyan('\nSUCCESS:'), 'Employee was added.');
	viewEmployees();
};


async function deleteDepartment() {
	const res = await queryAsync(connection, 'SELECT * FROM department');
	const answer = await inquirer.prompt({
		name: 'department',
		type: 'list',
		message: 'Department to Delete:',
		choices: () => {
			const departments = [];
			for (let i of res) {
				departments.push(i.name);
			}
			return departments;
		}
	});
	await queryAsync('DELETE FROM department WHERE ?', { name: answer.department });
	console.log(chalk.bold.bgCyan('\nSUCCESS:'), 'Department was deleted.');
	viewDepartments();
};

async function deleteRole() {
	const res = await queryAsync(connection, 'SELECT * FROM role');
	const answer = await inquirer.prompt({
		name: 'role',
		type: 'list',
		message: 'Role to Delete:',
		choices: () => {
			const roles = [];
			for (let i of res) {
				roles.push(i.title);
			}
			return roles;
		}
	});		
	await queryAsync('DELETE FROM role WHERE ?', { title: answer.role });
	console.log(chalk.bold.bgCyan('\nSUCCESS:'), 'Role was deleted.');
	viewRoles();
};


async function deleteEmployee() {
	const res = await queryAsync(connection, 'SELECT employee.id, CONCAT(employee.firstName, " ", employee.lastName) AS employeeName, employee.roleId, employee.managerId FROM employee');	
	const answer = await inquirer.prompt({
		name: 'employee',
		type: 'list',
		message: 'Employee to Delete:',
		choices: () => {
			const names = [];
			for (let i of res) {
				names.push(i.employeeName);
			}
			return names;
		}
	});		
	let deleteId;	
	for (let i of res) {
		if (i.employeeName === answer.employee) {
			deleteId = i.id;
		}
	}		
	await queryAsync('DELETE FROM employee WHERE ?', { id: deleteId });
	console.log(chalk.bold.bgCyan('\nSUCCESS:'), 'Employee was deleted.');
	viewEmployees();
};



async function updateSalary() {
	const res = await queryAsync(connection, 'SELECT * FROM role');	
	const answer = await inquirer.prompt([
		{
			name: 'title',
			type: 'list',
			message: 'Role:',
			choices: () => {
				const roles = [];
				for (let i of res) {
					roles.push(i.title);
				}
				return roles;
			}
		},
		{
			name: 'salary',
			type: 'input',
			message: 'New Salary:',
			validate: value => {
			  if (isNaN(value) === false) return true;
			  return false;
			}
		}
	]);				
	await queryAsync('UPDATE role SET salary = ? WHERE title = ?', [answer.salary, answer.title]);	
	console.log(chalk.bold.bgCyan('\nSUCCESS:'), 'Salary was updated.');
	viewRoles();
};




async function updateRole() {
	const resE = await queryAsync(connection, 'SELECT employee.id, CONCAT(employee.firstName, " ", employee.lastName) AS employeeName, employee.roleId, employee.managerId FROM employee');	
	const answerE = await inquirer.prompt({
		name: 'employee',
		type: 'list',
		message: 'Employee to Update:',
		choices: () => {
			const names = [];
			for (let i of resE) {
				names.push(i.employeeName);
			}
			return names;
		}
	});
	const resR = await queryAsync('SELECT * FROM role');	
	const answerR = await inquirer.prompt({
		name: 'role',
		type: 'list',
		message: 'New Role:',
		choices: () => {
			const roles = [];
			for (let i of resR) {
				roles.push(i.title);
			}
			return roles;
		}
	});	
	const select = await queryAsync(connection, 'SELECT employee.id, CONCAT(employee.firstName, " ", employee.lastName) AS employeeName, employee.roleId, role.title FROM employee INNER JOIN role ON employee.roleId = role.id');	
	let employeeId;	
	for (let i of select) {
		if (i.employeeName === answerE.employee) {
			employeeId = i.id;
		}
	}	
	let newRoleId;
	for (let i of resR) {
		if (i.title === answerR.role) {
			newRoleId = i.id;
		}
	}
	await queryAsync('UPDATE employee SET roleId = ? WHERE id = ?', [newRoleId, employeeId]);	
	console.log(chalk.bold.bgCyan('\nSUCCESS:'), 'Role was updated.');
	viewEmployees();
};


async function updateManager() {
	const res = await queryAsync(connection, 'SELECT e.id, CONCAT(e.firstName, " ", e.lastName) AS employeeName, e.managerId, CONCAT(m.firstName, " ", m.lastName) AS managerName FROM employee e LEFT JOIN employee m ON m.id = e.managerId');	
	const answer = await inquirer.prompt([
		{
			name: 'employee',
			type: 'list',
			message: 'Employee to Update:',
			choices: () => {
				const names = [];
				for (let i of res) {
					names.push(i.employeeName);
				}
				return names;
			}
		},
		{
			name: 'manager',
			type: 'list',
			message: 'New Manager:',
			choices: () => {
				const names = ['None'];
				for (let i of res) {
					names.push(i.employeeName);
				}
				return names;
			}
		}
	]);	
	let employeeId;
	let newManagerId;
	for (let i of res) {
		if (i.employeeName === answer.employee) {
			employeeId = i.id;
		}
		if (i.employeeName === answer.manager) {
			newManagerId = i.id;
		}
	}	
	await queryAsync('UPDATE employee SET managerId = ? WHERE id = ?', [newManagerId, employeeId]);	
	console.log(chalk.bold.bgCyan('\nSUCCESS:'), 'Manager was updated.');
	viewEmployees();
};