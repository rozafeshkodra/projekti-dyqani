import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Suppliers() {
  const navigate = useNavigate();

  const [suppliers, setSuppliers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await API.get("/suppliers");

      setSuppliers(response.data);
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Error while fetching suppliers!",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddSupplier = async (e) => {
    e.preventDefault();

    try {
      await API.post("/suppliers", {
        name,
        email,
        phone,
      });

      setName("");
      setEmail("");
      setPhone("");
      setShowForm(false);
      setMessage("");

      fetchSuppliers();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Error while adding supplier!",
      );
    }
  };

  const handleUpdateSupplier = async (e) => {
    e.preventDefault();

    try {
      await API.put(`/suppliers/${editId}`, {
        name,
        email,
        phone,
      });

      setName("");
      setEmail("");
      setPhone("");
      setEditId(null);
      setShowForm(false);
      setMessage("");

      fetchSuppliers();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Error while updating supplier!",
      );
    }
  };

  const handleEditSupplier = (supplier) => {
    setEditId(supplier.id);
    setName(supplier.name);
    setEmail(supplier.email || "");
    setPhone(supplier.phone || "");
    setShowForm(true);
  };

  const handleDeleteSupplier = async (id) => {
    try {
      await API.delete(`/suppliers/${id}`);

      setMessage("");
      fetchSuppliers();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Error while deleting supplier!",
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
        <h1>Suppliers</h1>

        <p>Manage your shop suppliers.</p>

        <button
          className="add-product-btn"
          onClick={() => {
            setEditId(null);
            setName("");
            setEmail("");
            setPhone("");
            setShowForm(!showForm);
          }}
        >
          + Add Supplier
        </button>

        {showForm && (
          <form
            className="product-form"
            onSubmit={editId ? handleUpdateSupplier : handleAddSupplier}
          >
            <h2>{editId ? "Edit Supplier" : "Add New Supplier"}</h2>

            <input
              type="text"
              placeholder="Supplier Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <input
              type="email"
              placeholder="Supplier Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="text"
              placeholder="Supplier Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <button type="submit">
              {editId ? "Update Supplier" : "Save Supplier"}
            </button>
          </form>
        )}

        {loading && <p>Loading suppliers...</p>}

        {message && <p className="error-message">{message}</p>}

        {!loading && (
          <table className="products-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {suppliers.map((supplier) => (
                <tr key={supplier.id}>
                  <td>{supplier.id}</td>
                  <td>{supplier.name}</td>
                  <td>{supplier.email || "-"}</td>
                  <td>{supplier.phone || "-"}</td>
                  <td>
                    <button onClick={() => handleEditSupplier(supplier)}>
                      Edit
                    </button>

                    <button onClick={() => handleDeleteSupplier(supplier.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!loading && suppliers.length === 0 && !message && (
          <p>No suppliers found.</p>
        )}
      </main>
    </div>
  );
}

export default Suppliers;
