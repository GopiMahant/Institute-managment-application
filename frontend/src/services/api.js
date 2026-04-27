const API_URL = 'http://127.0.0.1:8000';

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    let errorMessage = 'An error occurred';
    if (errorData && errorData.detail) {
      if (Array.isArray(errorData.detail)) {
        errorMessage = errorData.detail.map(err => `${err.loc.join('.')}: ${err.msg}`).join(', ');
      } else {
        errorMessage = errorData.detail;
      }
    }
    throw new Error(errorMessage);
  }
  return response.json();
};

export const api = {
  // Employees
  getEmployees: () => fetch(`${API_URL}/employees`).then(handleResponse),
  getEmployee: (id) => fetch(`${API_URL}/employees/${id}`).then(handleResponse),
  createEmployee: (data) => fetch(`${API_URL}/employees`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(handleResponse),
  updateEmployee: (id, data) => fetch(`${API_URL}/employees/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(handleResponse),
  deleteEmployee: (id) => fetch(`${API_URL}/employees/${id}`, {
    method: 'DELETE',
  }).then(handleResponse),

  // Inventory
  getInventory: (category = 'all') => fetch(`${API_URL}/inventory?category=${category}`).then(handleResponse),
  getInventoryItem: (id) => fetch(`${API_URL}/inventory/${id}`).then(handleResponse),
  createInventoryItem: (data) => fetch(`${API_URL}/inventory`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(handleResponse),
  updateInventoryItem: (id, data) => fetch(`${API_URL}/inventory/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(handleResponse),
  deleteInventoryItem: (id) => fetch(`${API_URL}/inventory/${id}`, {
    method: 'DELETE',
  }).then(handleResponse),

  // Files
  uploadFile: (file, category) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    return fetch(`${API_URL}/upload`, {
      method: 'POST',
      body: formData,
    }).then(handleResponse);
  },
  getFiles: (category = 'all') => fetch(`${API_URL}/files?category=${category}`).then(handleResponse),
  deleteFile: (id) => fetch(`${API_URL}/files/${id}`, {
    method: 'DELETE',
  }).then(handleResponse),
  downloadFileUrl: (id) => `${API_URL}/files/${id}`,

  // Dashboard
  getDashboard: () => fetch(`${API_URL}/dashboard`).then(handleResponse),
};
