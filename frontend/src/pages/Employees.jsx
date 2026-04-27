import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import './Employees.css';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    joining_date: ''
  });
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const data = await api.getEmployees();
      setEmployees(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openModal = (employee = null) => {
    if (employee) {
      setEditingId(employee.id);
      setFormData({
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        role: employee.role,
        joining_date: employee.joining_date
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', email: '', phone: '', role: '', joining_date: '' });
    }
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.updateEmployee(editingId, formData);
      } else {
        await api.createEmployee(formData);
      }
      closeModal();
      fetchEmployees();
    } catch (error) {
      setErrorMessage(error.message || 'Error saving employee');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await api.deleteEmployee(id);
        fetchEmployees();
      } catch (error) {
        alert('Error deleting employee');
      }
    }
  };

  return (
    <div className="employees-page">
      <div className="page-header flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Staff Directory</h2>
          <p className="text-secondary">Manage institute employees and staff members.</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={18} /> Add Employee
        </button>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Joining Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-secondary">No employees found.</td>
                </tr>
              ) : (
                employees.map(emp => (
                  <tr key={emp.id}>
                    <td className="font-medium">{emp.name}</td>
                    <td>{emp.email}</td>
                    <td>{emp.phone}</td>
                    <td><span className="role-badge">{emp.role}</span></td>
                    <td>{emp.joining_date}</td>
                    <td>
                      <div className="flex gap-2">
                        <button className="icon-btn text-accent" onClick={() => openModal(emp)}>
                          <Edit2 size={16} />
                        </button>
                        <button className="icon-btn text-danger" onClick={() => handleDelete(emp.id)}>
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
              <h3 className="text-xl font-semibold">{editingId ? 'Edit Employee' : 'Add New Employee'}</h3>
              <button className="icon-btn" onClick={closeModal}><X size={20} /></button>
            </div>
            {errorMessage && (
              <div className="mb-4 text-danger" style={{ padding: '10px', backgroundColor: 'var(--warning-bg)', borderRadius: '4px', fontSize: '0.875rem' }}>
                {errorMessage}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" className="form-control" name="name" value={formData.name} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" className="form-control" name="email" value={formData.email} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="text" className="form-control" name="phone" value={formData.phone} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Role / Position</label>
                <input type="text" className="form-control" name="role" value={formData.role} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Joining Date</label>
                <input type="date" className="form-control" name="joining_date" value={formData.joining_date} onChange={handleInputChange} required />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" className="btn btn-outline" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingId ? 'Save Changes' : 'Add Employee'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
