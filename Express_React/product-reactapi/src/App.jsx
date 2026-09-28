import React, { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api/products";

function App() {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const getProducts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("The product API is unavailable.");
      setProducts(await response.json());
      setError("");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getProducts();
  }, []);

  const addProduct = async (event) => {
    event.preventDefault();
    if (!name.trim() || !price || !category.trim()) return;

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), price, category: category.trim() }),
      });
      if (!response.ok) throw new Error("Could not add this product.");
      setName("");
      setPrice("");
      setCategory("");
      await getProducts();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const deleteProduct = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Could not delete this product.");
      await getProducts();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const totalValue = products.reduce((sum, product) => sum + Number(product.price || 0), 0);
  const categories = new Set(products.map((product) => product.category)).size;

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-mark">P</div>
        <div>
          <p className="eyebrow">Inventory workspace</p>
          <p className="brand-name">Productly</p>
        </div>
        <div className="connection-status"><span /> API connected</div>
      </header>

      <section className="hero">
        <div>
          <p className="eyebrow">Thursday, September 25</p>
          <h1>Your products,<br /><em>beautifully organized.</em></h1>
          <p className="hero-copy">Keep your catalogue fresh, focused, and ready for what comes next.</p>
        </div>
        <div className="hero-orbit"><span className="orbit-dot dot-one" /><span className="orbit-dot dot-two" /><span className="orbit-center">✦</span></div>
      </section>

      <section className="stats-grid" aria-label="Product summary">
        <article className="stat-card accent-card"><span className="stat-label">Total products</span><strong>{products.length}</strong><span className="stat-note">Items in catalogue</span></article>
        <article className="stat-card"><span className="stat-label">Catalogue value</span><strong>₹{totalValue.toLocaleString("en-IN")}</strong><span className="stat-note">Across all products</span></article>
        <article className="stat-card"><span className="stat-label">Categories</span><strong>{categories}</strong><span className="stat-note">Unique collections</span></article>
      </section>

      <section className="workspace-grid">
        <article className="panel form-panel">
          <div className="panel-heading"><div><p className="eyebrow">Quick action</p><h2>Add a product</h2></div><span className="plus-icon">+</span></div>
          <form onSubmit={addProduct}>
            <label>Product name<input type="text" placeholder="e.g. Ceramic mug" value={name} onChange={(event) => setName(event.target.value)} /></label>
            <div className="form-row"><label>Price<input type="number" min="0" placeholder="0" value={price} onChange={(event) => setPrice(event.target.value)} /></label><label>Category<input type="text" placeholder="e.g. Home" value={category} onChange={(event) => setCategory(event.target.value)} /></label></div>
            <button className="primary-button" type="submit">Add to catalogue <span>→</span></button>
          </form>
        </article>

        <article className="panel products-panel">
          <div className="panel-heading"><div><p className="eyebrow">Live catalogue</p><h2>All products <span>{products.length}</span></h2></div><button className="refresh-button" type="button" onClick={getProducts} aria-label="Refresh products">↻</button></div>
          {error && <div className="error-message">{error} <button type="button" onClick={getProducts}>Retry</button></div>}
          <div className="product-list">
            {isLoading ? <p className="empty-state">Loading your catalogue...</p> : products.length === 0 ? <p className="empty-state">Your catalogue is waiting for its first product.</p> : products.map((product, index) => <div className="product-row" key={product.id}><div className={`product-avatar avatar-${index % 4}`}>{product.name.slice(0, 1).toUpperCase()}</div><div className="product-details"><strong>{product.name}</strong><span>{product.category}</span></div><strong className="product-price">₹{Number(product.price).toLocaleString("en-IN")}</strong><button className="delete-button" type="button" onClick={() => deleteProduct(product.id)} aria-label={`Delete ${product.name}`}>×</button></div>)}
          </div>
        </article>
      </section>
      <footer>Productly <span>•</span> Your small catalogue, made simple.</footer>
    </main>
  );
}

export default App;