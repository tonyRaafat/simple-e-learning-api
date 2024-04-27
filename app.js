const http = require("node:http")
const url = require('url');
const { readFile, addToFile, deleteFromFile, updataFromFile, validateData } = require("./file_controller.js")

const { departmentsdir, coursesdir, studentsdir } = require("./constants.js")

http.createServer((req, res) => {

    const parsedUrl = url.parse(req.url, true)

    function notFound(msg = "URL Not Found!") {
        res.statusCode = 404;
        res.end(msg)
    }

    function badRequest(msg = "Bad Request") {
        res.statusCode = 400;
        return res.end(msg)
    }

    function getAllElements(file) {
        const data = readFile(file, parsedUrl.query.id);
        if (data) {
            return res.end(data);
        } else {
            return notFound("Id Not Found")
        }
    }

    function deleteById(file, id) {
        const newFile = deleteFromFile(file, id)
        if (newFile) {
            return res.end(newFile)
        } else {
            return notFound("Id Not Found")
        }
    }
    // this method adds an element and verify that the data is in its standard form befor ading it  
    function addElement(element, file) {
        req.on("data", chunck => {
            const parsedBody = JSON.parse(chunck.toString());
            const isDataValidated = validateData(element, parsedBody)
            if (typeof isDataValidated !== 'string') {
                return res.end(addToFile(file, parsedBody))
            } else {
                return badRequest(isDataValidated)
            }
        })
    }

    // this method updates an element by id and verify that the data is in its standard form befor updating  
    function updateElement(element, id, file) {
        req.on("data", chunck => {
            const parsedBody = JSON.parse(chunck.toString());
            const isDataValidated = validateData(element, parsedBody)
            if (typeof isDataValidated !== 'string') {
                data = updataFromFile(file, id, parsedBody);
                if (data) {
                    res.write(data)
                } else {
                    notFound("Id Not Found")
                }
                return res.end()
            } else {
                return badRequest(isDataValidated)
            }

        })
    }

    if (req.method === "GET") {
        switch (parsedUrl.pathname) {
            case "/students":
                return getAllElements(studentsdir);
            case "/courses":
                return getAllElements(coursesdir);
            case "/departments":
                return getAllElements(departmentsdir);
            case "/students_in_detail":
                let result = []
                let students = JSON.parse(readFile(studentsdir, parsedUrl.query.id))
                if (students == null) {
                    res.statusCode = 404
                    result = "no student found with this id!"
                }
                //if student is searched by id readFile going to return on object mathcing the id no for loop needed
                else if (!Array.isArray(students)) {
                    let department = JSON.parse(readFile(departmentsdir, students.departmentId))
                    let courses = JSON.parse(readFile(coursesdir)).filter(el => el.departmentId == students.departmentId)
                    students["department"] = department
                    students["courses"] = courses
                    result = students
                } else {
                    for (let i = 0; i < students.length; i++) {
                        const element = students[i];
                        let department = JSON.parse(readFile(departmentsdir, element.departmentId))
                        let courses = JSON.parse(readFile(coursesdir)).filter(el => el.departmentId == element.departmentId)
                        element["department"] = department
                        element["courses"] = courses
                        delete element.departmentId
                        result.push(element)
                    }
                }
                return res.end(JSON.stringify(result))
            default:
                notFound()
                break;
        }
    } else if (req.method === "POST") {
        switch (parsedUrl.pathname) {
            case "/addstudent":
                return addElement("student", studentsdir)
            case "/addcourse":
                return addElement("course", coursesdir)
            case "/add_department":
                return addElement("department", departmentsdir)
            default:
                notFound()
                break;
        }
    } else if (req.method === "DELETE") {
        const [_, firstpath, secondpath] = parsedUrl.pathname.split("/")
        if (firstpath && secondpath) {
            switch (firstpath) {
                case "students":
                    deleteById(studentsdir, secondpath)
                    break;
                case "courses":
                    deleteById(coursesdir, secondpath)
                    break;
                case "departments":
                    deleteById(departmentsdir, secondpath)
                    break;
                default:
                    notFound()
                    break;
            }
        } else {
            notFound()
        }
    } else if (req.method === "PUT") {
        let [_, firstpath, secondpath] = parsedUrl.pathname.split("/")
        switch (firstpath) {
            case "students":
                return updateElement("student", secondpath, studentsdir)
            case "courses":
                return updateElement("course", secondpath, coursesdir)
            case "departments":
                return updateElement("department", secondpath, departmentsdir)
            default:
                return notFound()
        }
    }
}).listen(3000, () => {
    console.log("Srever running on port 3000...");
})

