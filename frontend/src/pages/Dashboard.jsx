import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

function Dashboard() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!token || !user) {
      navigate("/");
    }
  }, [token, user, navigate]);

  if (!token || !user) {
    return null;
  }

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
          <a href="products">Products</a>
          <a href="#">Categories</a>
          <a href="#">Suppliers</a>
          <a href="#">Expiry Management</a>
        </nav>

        <button onClick={handleLogout}>Logout</button>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <h1>Dashboard</h1>
          <p>Welcome, {user.name}!</p>
        </header>

        <section className="dashboard-welcome">
          <h2>Welcome to Food Shop Management System</h2>
          <p>Manage your shop activities from one place.</p>
        </section>

        <section className="dashboard-cards">
          <div className="dashboard-card">
            <h3>Products</h3>
            <p>Manage your products</p>
          </div>

          <div className="dashboard-card">
            <h3>Categories</h3>
            <p>Manage product categories</p>
          </div>

          <div className="dashboard-card">
            <h3>Suppliers</h3>
            <p>Manage your suppliers</p>
          </div>

          <div className="dashboard-card">
            <h3>Expiry Management</h3>
            <p>Monitor product expiration dates</p>
          </div>
        </section>

        <section className="dashboard-user">
          <h3>User Information</h3>
          <p>Name: {user.name}</p>
          <p>Email: {user.email}</p>
          <p>Role: {user.role}</p>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
