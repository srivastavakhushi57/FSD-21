const express = require("express");
const fs = require("node:fs");
const path = require("node:path");

const app = express();
const PORT = process.env.PORT || 3000;

function servePage(fileName) {
    return (req, res) => {
        const filePath = path.join(__dirname, fileName);

        fs.readFile(filePath, "utf8", (error, html) => {
            if (error) {
                console.error(`Unable to read ${fileName}:`, error);
                return res.status(500).send("Unable to load this page.");
            }

            res.type("html").send(html);
        });
    };
}

app.get("/", servePage("index.html"));
app.get("/about", servePage("about.html"));
app.get("/contact", servePage("contact.html"));

app.use((req, res) => {
    res.status(404).send("Page not found.");
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
