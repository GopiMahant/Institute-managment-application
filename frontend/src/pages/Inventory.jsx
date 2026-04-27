import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Plus, Edit2, Trash2, X, Filter } from 'lucide-react';
import './Inventory.css';

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'books',
    quantity: 0,
    condition: 'new',
    added_date: ''
  });

  useEffect(() => {
    fetchInventory();
  }, [filter]);

  const fetchInventory = async () => {
    try {
      const data = await api.getInventory(filter);
      setItems(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.name === 'quantity' ? parseInt(e.target.value) || 0 : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const openModal = (item = null) => {
    if (item) {
      setEditingId(item.id);
      setFormData({
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        condition: item.condition,
        added_date: item.added_date
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', category: 'books', quantity: 0, condition: 'new', added_date: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.updateInventoryItem(editingId, formData);
      } else {
        await api.createInventoryItem(formData);
      }
      closeModal();
      fetchInventory();
    } catch (error) {
      alert(error.message || 'Error saving item');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await api.deleteInventoryItem(id);
        fetchInventory();
      } catch (error) {
        alert('Error deleting item');
      }
    }
  };

  return (
    <div className="inventory-page">
      <div className="page-header flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Inventory Tracking</h2>
          <p className="text-secondary">Manage institute physical assets and stock.</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={18} /> Add Item
        </button>
      </div>

      <div className="card mb-6 filter-card flex items-center gap-4">
        <Filter size={18} className="text-secondary" />
        <span className="font-medium">Filter by Category:</span>
        <div className="filter-buttons flex gap-2">
          {['all', 'books', 'lab_materials', 'sports_equipment'].map(cat => (
            <button 
              key={cat}
              className={`btn filter-btn ${filter === cat ? 'active' : ''}`}
              onClick={() => setFilter(cat)}
            >
              {cat.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Condition</th>
                <th>Added Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-secondary">No inventory items found.</td>
                </tr>
              ) : (
                items.map(item => (
                  <tr key={item.id} className={item.quantity <= 5 ? 'row-warning' : ''}>
                    <td className="font-medium">{item.name}</td>
                    <td><span className="category-badge">{item.category.replace('_', ' ')}</span></td>
                    <td>
                      <span className={`quantity-badge ${item.quantity <= 5 ? 'low-stock' : 'in-stock'}`}>
                        {item.quantity}
                      </span>
                    </td>
                    <td><span className={`condition-badge ${item.condition}`}>{item.condition}</span></td>
                    <td>{item.added_date}</td>
                    <td>
                      <div className="flex gap-2">
                        <button className="icon-btn text-accent" onClick={() => openModal(item)}>
                          <Edit2 size={16} />
                        </button>
                        <button className="icon-btn text-danger" onClick={() => handleDelete(item.id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content card">
            <div className="modal-header flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">{editingId ? 'Edit Item' : 'Add New Item'}</h3>
              <button className="icon-btn" onClick={closeModal}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Item Name</label>
                <input type="text" className="form-control" name="name" value={formData.name} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select className="form-control" name="category" value={formData.category} onChange={handleInputChange}>
                  <option value="books">Books</option>
                  <option value="lab_materials">Lab Materials</option>
                  <option value="sports_equipment">Sports Equipment</option>
                </select>
              </div>
              <div className="form-group">
                <label>Quantity</label>
                <input type="number" className="form-control" name="quantity" value={formData.quantity} onChange={handleInputChange} min="0" required />
              </div>
              <div className="form-group">
                <label>Condition</label>
                <select className="form-control" name="condition" value={formData.condition} onChange={handleInputChange}>
                  <option value="new">New</option>
                  <option value="good">Good</option>
                  <option value="damaged">Damaged</option>
                  <option value="lost">Lost</option>
                </select>
              </div>
              <div className="form-group">
                <label>Added Date</label>
                <input type="date" className="form-control" name="added_date" value={formData.added_date} onChange={handleInputChange} required />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" className="btn btn-outline" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingId ? 'Save Changes' : 'Add Item'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
