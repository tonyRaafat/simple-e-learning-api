const fs = require("node:fs");
const { departmentsdir, studentsdir } = require("./constants");

function readFile(file, id = null) {
    if (id != null) {
        const data = JSON.parse(fs.readFileSync(file))
        return JSON.stringify(data.find(el => el.id == id)) ?? null
    } else {
        const data = require(file);
        return JSON.stringify(data) ?? null
    }
}

function addToFile(file, newData, data = JSON.parse(fs.readFileSync(file))) {
        newData = Object.assign({ 'id': parseInt(data[data.length-1].id) + 1}, newData);
        data.push(newData)
        console.log(data);
        fs.writeFileSync(file, JSON.stringify(data))
        return JSON.stringify(data)
}

function updataFromFile(file, id, newData) {
    let data = JSON.parse(fs.readFileSync(file))
    const index = data.findIndex(element => element.id == id);
    console.log(data);
    if (index !== -1) {
        newData = Object.assign({ 'id': parseInt(id) }, newData);
        data[index] = newData
        fs.writeFileSync(file, JSON.stringify(data))
        return JSON.stringify(data)
    } else {
        return null
    }
}

function deleteFromFile(file, id) {
    let data = JSON.parse(fs.readFileSync(file))
    const index = data.findIndex(element => element.id == id);
    if (index !== -1) {
        data.splice(index, 1)
        fs.writeFileSync(file, JSON.stringify(data))
        return JSON.stringify(data)
    } else {
        return null
    }
}

function validateData(model, data) {

    if (model === "student") {

        if (Object.keys(data).toString() !== ["name", "email", "password", "departmentId"].toString()) {
            return "student model should contain only name, email, password, departmentId"
        }
        const departmentIds = JSON.parse(fs.readFileSync(departmentsdir)).map(el => el.id)
        const allStudents = JSON.parse(readFile(studentsdir))
        if (!departmentIds.includes(data.departmentId)) {
            return "department id does not exist!"
        } else if (allStudents.find(el => el.email == data.email)) {
            return "email already exists, email must be unique"
        }
        else {
            return true
        }
    }
    else if (model === "course") {
        console.log(Object.keys(data) );
        if (Object.keys(data).toString() !== [ 'name', 'content', 'departmentId' ].toString()) {
            return "course model should contain only name, content, departmentId"
        }
        const departmentIds = JSON.parse(fs.readFileSync(departmentsdir)).map(el => el.id)
        if (departmentIds.includes(data.departmentId)) {
            return true
        } else {
            return "department id does not exist!"
        }

    }else if (model === "department"){
        if (Object.keys(data).toString() != ["name"].toString()) {
            return "department model should contain only name"
        }else{
            return true
        }
    }
}

module.exports = { readFile, addToFile, deleteFromFile, updataFromFile, validateData}