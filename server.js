const inquirer = require("inquirer");
require("console.table");
const mysql = require("mysql");



const connection = mysql.createConnection({
    host:"localhost",
    port: 3001,
    user:"root",
    password: "",
    database: "employeeDB"
});



function startprompt(){
    inquirer
    .prompt({
        type: "list",
        name:"task",
        message: "Please select the following",
        choices:[
            "View Employee",
            "Add Employee",
            "Remove Employee",
            "Update Roles",
            "Add Roles",
            "End"
        ]
    })
    .then(function ({task}){
        switch(task){
            case "View Employee": viewEmployee();
            break;

            case "Add Employee": addEmployee();
            break;

            case "Remove Employee": removeEmployee();
            break;

            case "Update Roles": updateRoles();
            break;

            case "Add Roles": addRoles();
            break;

            case "End": connection.end();
            break;
        }
    })
}

connection.connect(function (err){
    if(err) throw err;
    console.log("connected as id " + connection.threadId);
    console.log("Employee Manager");
    startprompt();
})