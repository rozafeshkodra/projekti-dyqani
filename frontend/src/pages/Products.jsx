import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Products() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSupplier] = useState([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [supplierId, setSupplierId] = useState("");

  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchFormData();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await API.get("/products");

      setProducts(response.data);
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Error while fetching products!",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchFormData = async () => {
    try {
      const categoriesResponse = await API.get("/categories");
      const suppliersResponse = await API.get("/suppliers");

      setCategories(categoriesResponse.data);
      setSupplier(suppliersResponse.data);
    } catch (error) {
      console.log("Error while fetching categories and suppliers!");
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();

    try {
      await API.post("/products", {
        name,
        categoryId: Number(categoryId),
        supplierId: Number(supplierId),
      });

      setName("");
      setCategoryId("");
      setSupplierId("");
      setShowForm(false);
      setMessage("");

      fetchProducts();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Error while adding product!",
      );
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();

    try {
      await API.put(`/products/${editId}`, {
        name,
        categoryId: Number(categoryId),
        supplierId: Number(supplierId),
      });

      setName("");
      setCategoryId("");
      setSupplierId("");
      setEditId(null);
      setShowForm(false);
      setMessage("");

      fetchProducts();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Error while updating product!",
      );
    }
  };

  const handleEditProduct = (product) => {
    setEditId(product.id);
    setName(product.name);
    setCategoryId(product.categoryId);
    setSupplierId(product.supplierId);
    setShowForm(true);
  };

  const handleDeleteProduct = async (id) => {
    try {
      await API.delete(`/products/${id}`);

      setMessage("");
      fetchProducts();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Error while deleting product!",
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
        <h1>Products</h1>

        <p>Manage your shop products.</p>

        <button
          className="add-product-btn"
          onClick={() => {
            setEditId(null);
            setName("");
            setCategoryId("");
            setSupplierId("");
            setShowForm(!showForm);
          }}
        >
          + Add Product
        </button>

        {showForm && (
          <form
            className="product-form"
            onSubmit={editId ? handleUpdateProduct : handleAddProduct}
          >
            <h2>{editId ? "Edit Product" : "Add New Product"}</h2>

            <input
              type="text"
              placeholder="Product Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              <option value="">Select Category</option>

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              required
            >
              <option value="">Select Supplier</option>

              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>

            <button type="submit">
              {editId ? "Update Product" : "Save Product"}
            </button>
          </form>
        )}

        {loading && <p>Loading products...</p>}

        {message && <p className="error-message">{message}</p>}

        {!loading && !message && (
          <table className="products-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Category</th>
                <th>Supplier</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td>{product.name}</td>
                  <td>{product.category?.name}</td>
                  <td>{product.supplier?.name}</td>
                  <td>
                    <button onClick={() => handleEditProduct(product)}>
                      Edit
                    </button>
                    <button onClick={() => handleDeleteProduct(product.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!loading && products.length === 0 && !message && (
          <p>No products found.</p>
        )}
      </main>
    </div>
  );
}

export default Products;
