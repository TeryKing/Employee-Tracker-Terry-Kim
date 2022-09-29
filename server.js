const inquirer = require("inquirer");
require("console.table");
const mysql = require("mysql2");

//connection
const connection = mysql.createConnection({
    host:"localhost",
    port: 3306,
    user:"root",
    password: "Please Enter Password here, because I dont want to show you mine",
    database: "employeeDB"
});

connection.connect(function(err){
    if (err) {
        console.log(err)
    };
    startprompt();
})



//initial start prompt for user to decide what to do.
function startprompt(){
    inquirer
    .prompt({
        type: "list",
        name:"task",
        message: "Please select the following",
        choices:[
            "View",
            "Add",
            "Update",
            "End"
        ]
    })//switch case for View, Add, Update, and End
    .then(function ({task}){
        switch(task){
            case "View": view();
            break;

            case "Add": add();
            break;

            case "Update": update();
            break;

            case "End": connection.end();
            return;
        }
    })
}

//function for View which contains options for Department Roles and Employees
function view(){
    inquirer.prompt({
        name: "table",
        message: "What would you like to view?",
        type: "list",
        choices: ["Department","Roles","Employee"]
    }
    ).then(function ({table}){
        connection.query(`SELECT * FROM ${table}`, function(err,data){
            if(err){
                console.log(err);
            };

            console.table(data)
            startprompt();
        })
    })
}
//add function to add Department, Roles, and employees
function add(){
    inquirer.prompt({
        name: "table",
        message: "What would you like to add?",
        type: "list",
        choices: ["Department","Role","Employee"]
    }).then(function({table}){
        switch(table){
            case "Department": addDepart();
            break;

            case "Role": addRole();
            break;

            case "Employee": addEmployee();
            break;
        }
    })
}
//department adding function from previous choice option.
function addDepart(){
    inquirer.prompt({
        name: "name",
        message: "Please add the name of the Department",
        type: "input"
    }).then(function({name}){
        connection.query(`INSERT INTO Department (name) VALUES ("${name}")`, function (err,data){
            if(err){
                console.log(err);
            };
            console.log("Complete!")
            startprompt();
        })
    })
}
//addrole function to add specific roles or job role specifically
function addRole(){
    let departarray =[];

    connection.query(`SELECT * FROM Department`, function(err,data){
        if(err){
            console.log(err);
        }

        for(let i =0; i < data.length; i++){
            departarray.push(data[i].name)
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

        connection.query(`INSERT INTO Roles (title, salary, departmentID) VALUES ("${title}", "${salary}", ${index})`, function(err, data){
            if(err){
                console.log(err);
            };
            console.log("Complete")
            startprompt();
        })
    })
    })
}
//adding employee function with a manager choice
function addEmployee(){
    let employees = [];
    let employeeroles =[];

    connection.query(`SELECT * FROM Roles`, function(err, data){
        if(err){
            console.log(err);
        }

        for(let i=0; i<data.length;i++){
            employeeroles.push(data[i].title);
        }

        connection.query(`SELECT * FROM employee`, function(err, data){
            if(err){
                console.log(err);
            }

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
                    name: "managerID",
                    message: "Who is their manager?",
                    type: "list",
                    choices: ["none"].concat(employees)
                }
            ]).then(function({firstname,lastname,roleID,managerID}){
                let queryinsert = `INSERT INTO employee (firstname, lastname, roleID`;
                if(managerID != "none"){
                    queryinsert += `, managerID) VALUES ("${firstname}", "${lastname}", ${employeeroles.indexOf(roleID)}, ${employees.indexOf(managerID)+1})`
                }
                else{
                    queryinsert += `) VALUES ("${firstname}", "${lastname}", ${employeeroles.indexOf(roleID)+1})`
                }
                console.log(queryinsert, "Complete")

                connection.query(queryinsert, function(err,data){
                    if(err){
                        console.log(err);
                    }
                    startprompt();
                })
            })
        })
    })
}

//update function to update either a role or manager of an employee
function update(){
    inquirer.prompt({
        name: "update",
        message: "What would you like to update?",
        type: "list",
        choices:["Role","Manager"]
    }).then(function({update}){
        switch(update){
            case "Role": updateRole();
            break;

            case "Manager": updateManager();
            break;
        }
    })
}
//update roles function for employee to change roles
function updateRole(){
    connection.query(`SELECT * FROM employee`, function(err,data){
        if(err){
            console.log(err)
        };

        let employees = [];
        let employeeroles = [];

        for(let i =0; i<data.length; i++){
            employees.push(data[i].firstname)
        }

        connection.query(`SELECT * FROM Roles`, function(err,data){
            if(err){
                console.log(err)
            };

            for(let i=0; i<data.length;i++){
                employeeroles.push(data[i].title)
            }

            inquirer.prompt([
                {
                    name: "employeeID",
                    message: "Please select an employee to update his/her role.",
                    type: "list",
                    choices: employees
                },
                {
                    name: "roleID",
                    message: "Please select new role.",
                    type: "list",
                    choices: employeeroles
                }
            ]).then(function ({employeeID, roleID}){
                connection.query(`UPDATE employee SET roleID = ${employeeroles.indexOf(roleID)+1} WHERE id = ${employees.indexOf(employeeID)+1}`, function (err, data){
                    if(err){
                        console.log(err)
                    };

                    startprompt();
                })
            })
        })
    })
}
//update manager function to update the manager for a specific employee
function updateManager(){
    connection.query(`SELECT * FROM employee`, function(err,data){
        if(err){
            console.log(err)
        };

        let employees=[];

        for(let i =0; i<data.length;i++){
            employees.push(data[i].firstname)
        }

        inquirer.prompt([{
            name:"employeeID",
            message: "Please select an employee to update their manager.",
            type: "list",
            choices: employees
        },
        {
            name: "managerID",
            message: "Please select a manager.",
            type: "list",
            choices: ["none"].concat(employees)
        }
    ]).then(({employeeID,managerID})=>{
        let queryinsert = ""
        if(managerID !== "none"){
            queryinsert = `UPDATE employee SET managerID = ${employees.indexOf(managerID)+1} WHERE id = ${employees.indexOf(employeeID)+1}`
        }
        else{
            queryinsert = `UPDATE employee SET managerID = ${null} WHERE id = ${employees.indexOf(employeeID)+1}`
        }

        connection.query(queryinsert, function(err,data){
            if(err){
                console.log(err)
            };
            startprompt();
        })
    })
    })
}