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

}

function update(){

}
