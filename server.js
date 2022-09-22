const inquirer = require("inquirer");
const cTable = require("console.table");
const mysql = require("mysql");


const connection = mysql.createConnection({
    host:"localhost",
    port: 3001,
    user:"root",
    password: "",
    database: "employeeDB"
});

