import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { UploadCloud, Trash2, Download, FileText, Image as ImageIcon, File, Filter } from 'lucide-react';
import './Upload.css';

const Upload = () => {
  const [files, setFiles] = useState([]);
  const [filter, setFilter] = useState('all');
  const [uploadCategory, setUploadCategory] = useState('general');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchFiles();
  }, [filter]);

  const fetchFiles = async () => {
    try {
      const data = await api.getFiles(filter);
      setFiles(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file) => {
    setIsUploading(true);
    try {
      await api.uploadFile(file, uploadCategory);
      fetchFiles();
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      alert(error.message || 'Error uploading file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      try {
        await api.deleteFile(id);
        fetchFiles();
      } catch (error) {
        alert('Error deleting file');
      }
    }
  };

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png'].includes(ext)) return <ImageIcon size={20} className="text-accent" />;
    if (['pdf', 'docx', 'xlsx'].includes(ext)) return <FileText size={20} className="text-primary" />;
    return <File size={20} className="text-secondary" />;
  };

  return (
    <div className="upload-page">
      <div className="page-header mb-6">
        <h2 className="text-2xl font-semibold">Document Center</h2>
        <p className="text-secondary">Upload, store, and manage institute files.</p>
      </div>

      <div className="upload-section card mb-8">
        <div className="upload-controls mb-4 flex items-center gap-4">
          <label className="font-medium">Upload To Category:</label>
          <select 
            className="form-control category-select" 
            value={uploadCategory} 
            onChange={(e) => setUploadCategory(e.target.value)}
          >
            <option value="employee_docs">Employee Documents</option>
            <option value="inventory_docs">Inventory Documents</option>
            <option value="general">General Files</option>
          </select>
        </div>

        <div 
          className={`dropzone ${isDragging ? 'dragging' : ''} ${isUploading ? 'uploading' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current.click()}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
            className="hidden-input"
            accept=".pdf,.jpg,.jpeg,.png,.docx,.xlsx"
          />
          <UploadCloud size={48} className="dropzone-icon" />
          {isUploading ? (
            <p className="dropzone-text text-accent">Uploading file...</p>
          ) : (
            <>
              <p className="dropzone-text">Drag & drop a file here, or click to browse</p>
              <p className="dropzone-hint">Supports: PDF, JPG, PNG, DOCX, XLSX (Max 10MB)</p>
            </>
          )}
        </div>
      </div>

      <div className="files-section">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Uploaded Files</h3>
          <div className="filter-buttons flex gap-2 items-center">
            <Filter size={16} className="text-secondary" />
            {['all', 'employee_docs', 'inventory_docs', 'general'].map(cat => (
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
                  <th>File</th>
                  <th>Category</th>
                  <th>Uploaded At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {files.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-4 text-secondary">No files found in this category.</td>
                  </tr>
                ) : (
                  files.map(file => (
                    <tr key={file.id}>
                      <td>
                        <div className="file-name flex items-center gap-3 font-medium">
                          {getFileIcon(file.filename)}
                          {file.filename}
                        </div>
                      </td>
                      <td><span className="category-badge">{file.category.replace('_', ' ')}</span></td>
                      <td>{new Date(file.uploaded_at).toLocaleString()}</td>
                      <td>
                        <div className="flex gap-2">
                          <a 
                            href={api.downloadFileUrl(file.id)} 
                            download={file.filename}
                            target="_blank"
                            rel="noreferrer"
                            className="icon-btn text-accent"
                            title="Download"
                          >
                            <Download size={16} />
                          </a>
                          <button className="icon-btn text-danger" onClick={() => handleDelete(file.id)} title="Delete">
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
      </div>
    </div>
  );
};

export default Upload;
