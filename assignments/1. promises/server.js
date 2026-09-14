const http = require("http");
const fs = require("fs");

const PORT = 3000;

const server = http.createServer((req, res) => {

    if (req.method === "GET" && req.url === "/") {
        res.writeHead(200, { "Content-Type": "text/html" });

        res.end(`
            <h1>Welcome to Student Record System</h1>

            <form method="POST" action="/add">
                <label>Student Name:</label>
                <input type="text" name="name" required><br><br>

                <label>Roll Number:</label>
                <input type="text" name="roll" required><br><br>

                <label>Course:</label>
                <input type="text" name="course" required><br><br>

                <label>Email:</label>
                <input type="email" name="email" required><br><br>

                <button type="submit">Add Student</button>
            </form>

            <br>
            <a href="/students">View Students</a>
        `);
    }

    else if (req.method === "POST" && req.url === "/add") {
        let body = "";

        req.on("data", chunk => {
            body += chunk.toString();
        });

        req.on("end", () => {
            const params = new URLSearchParams(body);

            const student = {
                name: params.get("name"),
                roll: params.get("roll"),
                course: params.get("course"),
                email: params.get("email")
            };

            fs.readFile("students.json", "utf8", (err, data) => {
                let students = [];

                if (!err && data) {
                    students = JSON.parse(data);
                }

                students.push(student);

                fs.writeFile(
                    "students.json",
                    JSON.stringify(students, null, 2),
                    err => {
                        if (err) {
                            res.writeHead(500);
                            res.end("Error saving student");
                            return;
                        }

                        res.writeHead(302, { Location: "/students" });
                        res.end();
                    }
                );
            });
        });
    }

    else if (req.method === "GET" && req.url === "/students") {
        fs.readFile("students.json", "utf8", (err, data) => {
            let students = [];

            if (!err && data) {
                students = JSON.parse(data);
            }

            res.writeHead(200, { "Content-Type": "text/html" });

            let html = "<h1>Student Records</h1>";

            students.forEach(student => {
                html += `
                    <p>
                        <b>Name:</b> ${student.name}<br>
                        <b>Roll:</b> ${student.roll}<br>
                        <b>Course:</b> ${student.course}<br>
                        <b>Email:</b> ${student.email}
                    </p>
                    <hr>
                `;
            });

            html += `<a href="/">Add Another Student</a>`;

            res.end(html);
        });
    }

    else {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("404 - Page Not Found");
    }
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});