import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function ExpiryManagement() {
  const navigate = useNavigate();

  const [alerts, setAlerts] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [stockBatchId, setStockBatchId] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [stockBatches, setStockBatches] = useState([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchAlerts();
    fetchStockBatches();
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await API.get("/expiry-alerts");

      setAlerts(response.data);
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Error while fetching expiry alerts!",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchStockBatches = async () => {
    try {
      const response = await API.get("/stock-batches");

      setStockBatches(response.data);
    } catch (error) {
      console.log("Error while fetching stock batches!");
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await API.put(`/expiry-alerts/${id}`, {
        status,
      });

      fetchAlerts();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Error while updating expiry alert!",
      );
    }
  };

  const handleDeleteAlert = async (id) => {
    try {
      await API.delete(`/expiry-alerts/${id}`);

      fetchAlerts();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Error while deleting expiry alert!",
      );
    }
  };

  const handleAddAlert = async (e) => {
    e.preventDefault();

    try {
      await API.post("/expiry-alerts", {
        stockBatchId: Number(stockBatchId),
        message: alertMessage,
      });

      setStockBatchId("");
      setAlertMessage("");
      setShowForm(false);
      setMessage("");

      fetchAlerts();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Error while adding expiry alert!",
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
          <a href="/expiry-management">Expiry Management</a>
        </nav>

        <button onClick={handleLogout}>Logout</button>
      </aside>

      <main className="dashboard-main products-page">
        <h1>Expiry Management</h1>

        <p>Manage product expiry alerts.</p>

        <button
          className="add-product-btn"
          onClick={() => setShowForm(!showForm)}
        >
          + Add Expiry Alert
        </button>

        {showForm && (
          <form className="product-form" onSubmit={handleAddAlert}>
            <h2>Add New Expiry Alert</h2>

            <select
              value={stockBatchId}
              onChange={(e) => setStockBatchId(e.target.value)}
              required
            >
              <option value="">Select Product Batch</option>

              {stockBatches.map((batch) => (
                <option key={batch.id} value={batch.id}>
                  {batch.product?.name} - Batch #{batch.id}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Alert Message"
              value={alertMessage}
              onChange={(e) => setAlertMessage(e.target.value)}
              required
            />

            <button type="submit">Save Alert</button>
          </form>
        )}

        {loading && <p>Loading expiry alerts...</p>}

        {message && <p className="error-message">{message}</p>}

        {!loading && (
          <table className="products-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Expiry Date</th>
                <th>Message</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {alerts.map((alert) => (
                <tr key={alert.id}>
                  <td>{alert.id}</td>
                  <td>{alert.stockBatch?.product?.name}</td>
                  <td>{alert.stockBatch?.quantity}</td>
                  <td>
                    {new Date(
                      alert.stockBatch?.expiryDate,
                    ).toLocaleDateString()}
                  </td>
                  <td>{alert.message}</td>
                  <td>{alert.status}</td>
                  <td>
                    <button
                      className={`status-btn ${
                        alert.status === "UNREAD" ? "mark-read" : "mark-unread"
                      }`}
                      onClick={() =>
                        handleUpdateStatus(
                          alert.id,
                          alert.status === "UNREAD" ? "READ" : "UNREAD",
                        )
                      }
                    >
                      {alert.status === "UNREAD"
                        ? "Mark as Read"
                        : "Mark as Unread"}
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteAlert(alert.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!loading && alerts.length === 0 && !message && (
          <p>No expiry alerts found.</p>
        )}
      </main>
    </div>
  );
}

export default ExpiryManagement;
