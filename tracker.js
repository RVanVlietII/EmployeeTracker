const mysql = require('mysql');
const inquirer = require('inquirer');
const chalk = require('chalk');
const consoleTable = require('console.table');
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

// 