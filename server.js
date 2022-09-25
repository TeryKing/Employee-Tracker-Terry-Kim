const { resolveSoa } = require("dns");
const { connect } = require("http2");
const inquirer = require("inquirer");
require("console.table");
const mysql = require("mysql");
const { allowedNodeEnvironmentFlags } = require("process");



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
            "View",
            "Add",
            "Update Roles",
            "End"
        ]
    })
    .then(function ({task}){
        switch(task){
            case "View": view();
            break;

            case "Add": add();
            break;

            case "Update": update();

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

function view(){
    inquirer.prompt({
        name: "db",
        message: "What would you like to view?",
        type: "list",
        choices: ["Department","Role","Employee"]
    }
    ).then(function ({db}){
        connection.query(`SELECT * FROM ${db}`, function(err,data){
            if(err) throw err;
            console.table(data);
            startprompt;
        })
    })
}

function add(){
    inquirer.prompt({
        name: "db",
        message: "What would you like to add?",
        type: "list",
        choices: ["Department","Role","Employee"]
    }).then(function({db}){
        switch(db){
            case "Department": addDepart();
            break;

            case "Role": addRole();
            break;

            case "Employee": addEmployee();
            break;
        }
    })
}

function addDepart(){
    inquirer.prompt({
        name: "name",
        message: "Please add the name of the Department",
        type: "input"
    }).then(function({name}){
        connection.query(`INSERT INTO Department (name) VALUES ("${name})`, function (err,data){
            if(err) throw err;
            console.log("Complete!")
            startprompt();
        })
    })
}

function addRole(){
    let departarray =[];

    connection.query(`SELECT * FROM department`, function(err,data){
        if(err) throw err;

        for(let i =0; i < data.length; i++){
            department.push(data[i].name)
        }
        inquirer.prompt([{
            name: "title",
            message: "What is the name of the role?",
            type: "input"
        },
        {
            name: "salary",
            message: "What is their yearly Salary?",
            type: "input"
        },
        {
            name: "departmentID",
            message: "What department would you like to assign?",
            type: "list",
            choices:departarray
        }
    ]).then(function({title, salary, departmentID}){
        let index = departarray.indexOf(departmentID)

        connection.query(`INSERT INTO role (title, salary, departmentID) VALUES ("${title}", "${salary}", ${index})`, function(err, data){
            if(err) throw err;
            console.log("Complete")
            startprompt();
        })
    })
    })
}

function addEmployee(){
    let employees = [];
    let employeeroles =[];

    connection.query(`SELECT * FROM role`, function(err, data){
        if(err) throw err;

        for(let i=0; i<data.length;i++){
            employeeroles.push(data[i].title);
        }

        connection.query(`SELECT * FROM employee`, function(err, data){
            if(err) throw err;

            for(let i = 0; i<data.length; i++){
                employees.push(data[i].firstname);
            }
            inquirer.prompt([
                {
                    name: "firstname",
                    message: "Please enter employee's first name.",
                    type: "input"
                },
                {
                    name: "lastname",
                    message: "Please enter employee's last name.",
                    type: "input"
                }, 
                {
                    name: "roleID",
                    message:"Please enter a role for the employee.",
                    type: "list",
                    choices: employeeroles,
                },
                {
                    name: "manager",
                    message: "Who is their manager?",
                    type: "list",
                    choices: ["none".concat(employees)]
                }
            ]).then(function({firstname,lastname,roleID,manager}){
                let queryinsert = `INSERT INTO employee (firstname, lastname, roleID)`;
                if(manager != "none"){
                    queryinsert += `,manager) VALUES("${firstname}", "${lastname}", ${employeeroles.indexOf(roleID)},${employees.indexOf(manager)+1})`
                }
                else{
                    queryinsert += `) VALUES ("${firstname}","${lastname}",${employeeroles.indexOf(roleID)})`
                }
                console.log(queryinsert)

                connection.query(queryinsert, function(err,data){
                    if(err) throw err;

                    startprompt();
                })
            })
        })
    })
}




function update(){

}
