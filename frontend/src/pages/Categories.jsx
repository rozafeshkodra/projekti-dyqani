import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Categories() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState("");

  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await API.get("/categories");

      setCategories(response.data);
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Error while fetching categories!",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();

    try {
      await API.post("/categories", {
        name,
      });

      setName("");
      setShowForm(false);
      setMessage("");

      fetchCategories();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Error while adding category!",
      );
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();

    try {
      await API.put(`/categories/${editId}`, {
        name,
      });

      setName("");
      setEditId(null);
      setShowForm(false);
      setMessage("");

      fetchCategories();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Error while updating category!",
      );
    }
  };

  const handleEditCategory = (category) => {
    setEditId(category.id);
    setName(category.name);
    setShowForm(true);
  };

  const handleDeleteCategory = async (id) => {
    try {
      await API.delete(`/categories/${id}`);

      setMessage("");
      fetchCategories();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Error while deleting category!",
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
        <h1>Categories</h1>

        <p>Manage your product categories.</p>

        <button
          className="add-product-btn"
          onClick={() => {
            setEditId(null);
            setName("");
            setShowForm(!showForm);
          }}
        >
          + Add Category
        </button>

        {showForm && (
          <form
            className="product-form"
            onSubmit={editId ? handleUpdateCategory : handleAddCategory}
          >
            <h2>{editId ? "Edit Category" : "Add New Category"}</h2>

            <input
              type="text"
              placeholder="Category Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <button type="submit">
              {editId ? "Update Category" : "Save Category"}
            </button>
          </form>
        )}

        {message && <p className="error-message">{message}</p>}

        {loading && <p>Loading categories...</p>}

        {!loading && (
          <table className="products-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td>{category.id}</td>
                  <td>{category.name}</td>
                  <td>
                    <button onClick={() => handleEditCategory(category)}>
                      Edit
                    </button>

                    <button onClick={() => handleDeleteCategory(category.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!loading && categories.length === 0 && !message && (
          <p>No categories found.</p>
        )}
      </main>
    </div>
  );
}
export default Categories;
