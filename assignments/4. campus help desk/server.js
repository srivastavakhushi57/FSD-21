const express = require("express");
const fs = require("node:fs");
const path = require("node:path");

const app = express();
const PORT = process.env.PORT || 3000;
const dataPath = path.join(__dirname, "requests.json");
const allowedPriorities = ["Low", "Medium", "High", "Urgent"];
const allowedStatuses = ["Open", "In progress", "Resolved"];

if (!fs.existsSync(dataPath)) fs.writeFileSync(dataPath, "[]\n");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function readRequests() {
  return JSON.parse(fs.readFileSync(dataPath, "utf8"));
}

function writeRequests(requests) {
  fs.writeFileSync(dataPath, `${JSON.stringify(requests, null, 2)}\n`);
}

function validateRequest(body) {
  const requiredFields = ["studentName", "email", "category", "description"];
  const missingField = requiredFields.find((field) => !String(body[field] || "").trim());
  if (missingField) return `${missingField} is required.`;
  if (!/^\S+@\S+\.\S+$/.test(String(body.email).trim())) return "Enter a valid email address.";
  if (!allowedPriorities.includes(body.priority)) return "Choose a valid priority.";
  return null;
}

app.get("/api/requests", (req, res) => res.json(readRequests()));

app.get("/api/requests/:id", (req, res) => {
  const request = readRequests().find((item) => item.id === Number(req.params.id));
  if (!request) return res.status(404).json({ message: "Request not found." });
  res.json(request);
});

app.post("/api/requests", (req, res) => {
  const validationError = validateRequest(req.body);
  if (validationError) return res.status(400).json({ message: validationError });

  const requests = readRequests();
  const now = new Date().toISOString();
  const newRequest = {
    id: requests.reduce((highestId, item) => Math.max(highestId, item.id), 0) + 1,
    studentName: String(req.body.studentName).trim(),
    email: String(req.body.email).trim(),
    category: String(req.body.category).trim(),
    description: String(req.body.description).trim(),
    priority: req.body.priority,
    status: "Open",
    createdAt: now,
    updatedAt: now,
  };
  requests.unshift(newRequest);
  writeRequests(requests);
  res.status(201).json(newRequest);
});

app.put("/api/requests/:id", (req, res) => {
  const requests = readRequests();
  const request = requests.find((item) => item.id === Number(req.params.id));
  if (!request) return res.status(404).json({ message: "Request not found." });

  const updatedFields = { ...request, ...req.body };
  const validationError = validateRequest(updatedFields);
  if (validationError) return res.status(400).json({ message: validationError });
  if (req.body.status && !allowedStatuses.includes(req.body.status)) {
    return res.status(400).json({ message: "Choose a valid status." });
  }

  Object.assign(request, {
    studentName: String(updatedFields.studentName).trim(),
    email: String(updatedFields.email).trim(),
    category: String(updatedFields.category).trim(),
    description: String(updatedFields.description).trim(),
    priority: updatedFields.priority,
    status: updatedFields.status,
    updatedAt: new Date().toISOString(),
  });
  writeRequests(requests);
  res.json(request);
});

app.delete("/api/requests/:id", (req, res) => {
  const requests = readRequests();
  const requestIndex = requests.findIndex((item) => item.id === Number(req.params.id));
  if (requestIndex === -1) return res.status(404).json({ message: "Request not found." });
  const [deletedRequest] = requests.splice(requestIndex, 1);
  writeRequests(requests);
  res.json({ message: "Request deleted.", request: deletedRequest });
});

app.listen(PORT, () => console.log(`Campus Help Desk running at http://localhost:${PORT}`));