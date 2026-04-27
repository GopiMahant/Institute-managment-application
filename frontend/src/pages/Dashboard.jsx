import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Users, Box, AlertTriangle, FileText } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const [data, setData] = useState({
    total_employees: 0,
    total_inventory_items: 0,
    low_stock_items: 0,
    total_files_uploaded: 0,
    recent_uploads: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.getDashboard();
      setData(res);
    } catch (error) {
      console.error("Failed to fetch dashboard", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="dashboard">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon bg-blue">
            <Users size={24} />
          </div>
          <div className="stat-info">
            <h3>Total Employees</h3>
            <p className="stat-value">{data.total_employees}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-green">
            <Box size={24} />
          </div>
          <div className="stat-info">
            <h3>Inventory Items</h3>
            <p className="stat-value">{data.total_inventory_items}</p>
          </div>
        </div>
        <div className={`stat-card ${data.low_stock_items > 0 ? 'warning' : ''}`}>
          <div className="stat-icon bg-orange">
            <AlertTriangle size={24} />
          </div>
          <div className="stat-info">
            <h3>Low Stock</h3>
            <p className="stat-value">{data.low_stock_items}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-purple">
            <FileText size={24} />
          </div>
          <div className="stat-info">
            <h3>Files Uploaded</h3>
            <p className="stat-value">{data.total_files_uploaded}</p>
          </div>
        </div>
      </div>

      <div className="recent-uploads card mt-6">
        <h3 className="mb-4 text-xl font-semibold">Recent Uploads</h3>
        {data.recent_uploads.length === 0 ? (
          <p className="text-secondary">No recent uploads found.</p>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Filename</th>
                  <th>Category</th>
                  <th>Uploaded At</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_uploads.map(file => (
                  <tr key={file.id}>
                    <td>{file.filename}</td>
                    <td><span className="category-badge">{file.category.replace('_', ' ')}</span></td>
                    <td>{new Date(file.uploaded_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
