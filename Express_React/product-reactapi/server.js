import cors from "cors";
import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = express();
const port = 5000;
const dataPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "products.json");

app.use(cors());
app.use(express.json());

function readProducts() {
  return JSON.parse(fs.readFileSync(dataPath, "utf8"));
}

function writeProducts(products) {
  fs.writeFileSync(dataPath, JSON.stringify(products, null, 2));
}

app.get("/api/products", (req, res) => {
  res.json(readProducts());
});

app.post("/api/products", (req, res) => {
  const products = readProducts();
  const newProduct = {
    id: products.length ? Math.max(...products.map((product) => product.id)) + 1 : 1,
    name: req.body.name,
    price: req.body.price,
    category: req.body.category,
  };

  products.push(newProduct);
  writeProducts(products);
  res.status(201).json(newProduct);
});

app.delete("/api/products/:id", (req, res) => {
  const productId = Number.parseInt(req.params.id, 10);
  const products = readProducts();
  const remainingProducts = products.filter((product) => product.id !== productId);

  writeProducts(remainingProducts);
  res.json({ message: "Product deleted successfully" });
});

app.listen(port, () => {
  console.log(`API server running on http://localhost:${port}`);
});
