import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function StockBatches() {
  const navigate = useNavigate();

  const [stockBatches, setStockBatches] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchStockBatches();
    fetchProducts();
  }, []);

  const fetchStockBatches = async () => {
    try {
      const response = await API.get("/stock-batches");

      setStockBatches(response.data);
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Error while fetching stock batches!",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await API.get("/products");

      setProducts(response.data);
    } catch (error) {
      console.log("Error while fetching products!");
    }
  };

  const handleAddStockBatch = async (e) => {
    e.preventDefault();

    try {
      await API.post("/stock-batches", {
        productId: Number(productId),
        quantity: Number(quantity),
        expiryDate,
      });

      setProductId("");
      setQuantity("");
      setExpiryDate("");
      setShowForm(false);
      setMessage("");

      fetchStockBatches();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Error while adding stock batch!",
      );
    }
  };

  const handleUpdateStockBatch = async (e) => {
    e.preventDefault();

    try {
      await API.put(`/stock-batches/${editId}`, {
        productId: Number(productId),
        quantity: Number(quantity),
        expiryDate,
      });

      setProductId("");
      setQuantity("");
      setExpiryDate("");
      setEditId(null);
      setShowForm(false);
      setMessage("");

      fetchStockBatches();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Error while updating stock batch!",
      );
    }
  };

  const handleEditStockBatch = (stockBatch) => {
    setEditId(stockBatch.id);
    setProductId(stockBatch.productId);
    setQuantity(stockBatch.quantity);
    setExpiryDate(new Date(stockBatch.expiryDate).toISOString().slice(0, 10));
    setShowForm(true);
  };

  const handleDeleteStockBatch = async (id) => {
    try {
      await API.delete(`/stock-batches/${id}`);

      setMessage("");
      fetchStockBatches();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Error while deleting stock batch!",
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <h2>Food Shop</h2>

        <nav>
          <a href="/dashboard">Dashboard</a>
          <a href="/products">Products</a>
          <a href="/categories">Categories</a>
          <a href="/suppliers">Suppliers</a>
          <a href="/stock-batches">Stock Batches</a>
          <a href="/expiry-management">Expiry Management</a>
        </nav>

        <button onClick={handleLogout}>Logout</button>
      </aside>

      <main className="dashboard-main products-page">
        <h1>Stock Batches</h1>

        <p>Manage your shop stock batches.</p>

        <button
          className="add-product-btn"
          onClick={() => {
            setEditId(null);
            setProductId("");
            setQuantity("");
            setExpiryDate("");
            setShowForm(!showForm);
          }}
        >
          + Add Stock Batch
        </button>

        {showForm && (
          <form
            className="product-form"
            onSubmit={editId ? handleUpdateStockBatch : handleAddStockBatch}
          >
            <h2>{editId ? "Edit Stock Batch" : "Add New Stock Batch"}</h2>

            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              required
            >
              <option value="">Select Product</option>

              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="1"
              required
            />

            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              required
            />

            <button type="submit">
              {editId ? "Update Stock Batch" : "Save Stock Batch"}
            </button>
          </form>
        )}

        {loading && <p>Loading stock batches...</p>}

        {message && <p className="error-message">{message}</p>}

        {!loading && !message && (
          <table className="products-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Expiry Date</th>
                <th>Received At</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {stockBatches.map((stockBatch) => (
                <tr key={stockBatch.id}>
                  <td>{stockBatch.id}</td>
                  <td>{stockBatch.product?.name}</td>
                  <td>{stockBatch.quantity}</td>
                  <td>
                    {new Date(stockBatch.expiryDate).toLocaleDateString()}
                  </td>
                  <td>
                    {new Date(stockBatch.receivedAt).toLocaleDateString()}
                  </td>
                  <td>
                    <button onClick={() => handleEditStockBatch(stockBatch)}>
                      Edit
                    </button>

                    <button
                      onClick={() => handleDeleteStockBatch(stockBatch.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!loading && stockBatches.length === 0 && !message && (
          <p>No stock batches found.</p>
        )}
      </main>
    </div>
  );
}

export default StockBatches;
