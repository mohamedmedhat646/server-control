// src/components/AddServer.js
import React, { useState } from 'react';
import { addServer } from '../services/api';
import { useNavigate } from 'react-router-dom';

const AddServer = () => {
  const [formData, setFormData] = useState({ 
    name: '', 
    iloIp: '', 
    networkIp: '',
    type: 'physical',
    location: '',
    description: '',
    tags: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Server name is required';
    }
    
    if (!formData.iloIp.trim()) {
      newErrors.iloIp = 'iLO IP is required';
    } else if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(formData.iloIp)) {
      newErrors.iloIp = 'Invalid IP address format';
    }
    
    if (!formData.networkIp.trim()) {
      newErrors.networkIp = 'Network IP is required';
    } else if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(formData.networkIp)) {
      newErrors.networkIp = 'Invalid IP address format';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setSuccess(null);
    
    try {
      await addServer({
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      });
      
      setSuccess('Server added successfully! Redirecting...');
      setTimeout(() => navigate('/'), 2000);
    } catch (error) {
      console.error('Failed to add server:', error);
      setErrors({
        ...errors,
        form: error.message || 'Failed to add server. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-vh-100 bg-gradient-light">
      <header className="bg-white shadow-sm">
        <div className="container py-4">
          <div className="d-flex align-items-center">
            <i className="fas fa-server text-primary me-3 fs-3"></i>
            <h1 className="h3 text-dark fw-bold mb-0">Add New Server</h1>
          </div>
        </div>
      </header>

      <main className="container py-5">
        {/* Success Message */}
        {success && (
          <div className="alert alert-success alert-dismissible fade show shadow-sm" role="alert">
            <i className="fas fa-check-circle me-2"></i>
            {success}
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setSuccess(null)}
            />
          </div>
        )}

        {/* Form Error Message */}
        {errors.form && (
          <div className="alert alert-danger alert-dismissible fade show shadow-sm" role="alert">
            <i className="fas fa-exclamation-circle me-2"></i>
            {errors.form}
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setErrors({...errors, form: null})}
            />
          </div>
        )}

        <div className="card shadow-lg border-0">
          <div className="card-header bg-dark text-white py-3">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="card-title mb-1">
                  <i className="fas fa-plus-circle me-2"></i>
                  New Server Configuration
                </h5>
                <small className="text-white-50">Fill in all required fields to add a new server</small>
              </div>
              <button 
                onClick={() => navigate('/')}
                className="btn btn-outline-light btn-sm"
              >
                <i className="fas fa-arrow-left me-1"></i> Back
              </button>
            </div>
          </div>

          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row g-4 mb-4">
                {/* Server Name */}
                <div className="col-md-6">
                  <label htmlFor="name" className="form-label fw-bold">
                    Server Name <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light">
                      <i className="fas fa-tag"></i>
                    </span>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                      placeholder="e.g. Web Server 01"
                    />
                    {errors.name && (
                      <div className="invalid-feedback">
                        <i className="fas fa-exclamation-circle me-1"></i>
                        {errors.name}
                      </div>
                    )}
                  </div>
                </div>

                {/* Server Type */}
                {/* <div className="col-md-6">
                  <label htmlFor="type" className="form-label fw-bold">
                    Server Type
                  </label>
                  <select
                    name="type"
                    id="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="physical">Physical Server</option>
                    <option value="virtual">Virtual Machine</option>
                    <option value="container">Container</option>
                    <option value="cloud">Cloud Instance</option>
                  </select>
                </div> */}

                {/* iLO IP */}
                <div className="col-md-6">
                  <label htmlFor="iloIp" className="form-label fw-bold">
                    iLO/IPMI IP <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light">
                      <i className="fas fa-network-wired"></i>
                    </span>
                    <input
                      type="text"
                      name="iloIp"
                      id="iloIp"
                      value={formData.iloIp}
                      onChange={handleChange}
                      className={`form-control ${errors.iloIp ? 'is-invalid' : ''}`}
                      placeholder="192.168.1.100"
                    />
                    {errors.iloIp && (
                      <div className="invalid-feedback">
                        <i className="fas fa-exclamation-circle me-1"></i>
                        {errors.iloIp}
                      </div>
                    )}
                  </div>
                </div>

                {/* Network IP */}
                <div className="col-md-6">
                  <label htmlFor="networkIp" className="form-label fw-bold">
                    Network IP <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light">
                      <i className="fas fa-ethernet"></i>
                    </span>
                    <input
                      type="text"
                      name="networkIp"
                      id="networkIp"
                      value={formData.networkIp}
                      onChange={handleChange}
                      className={`form-control ${errors.networkIp ? 'is-invalid' : ''}`}
                      placeholder="10.0.0.100"
                    />
                    {errors.networkIp && (
                      <div className="invalid-feedback">
                        <i className="fas fa-exclamation-circle me-1"></i>
                        {errors.networkIp}
                      </div>
                    )}
                  </div>
                </div>

                {/* Location */}
                {/* <div className="col-md-6">
                  <label htmlFor="location" className="form-label fw-bold">
                    Location
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light">
                      <i className="fas fa-map-marker-alt"></i>
                    </span>
                    <input
                      type="text"
                      name="location"
                      id="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="e.g. Data Center A, Rack 42"
                    />
                  </div>
                </div> */}

                {/* Tags */}
                {/* <div className="col-md-6">
                  <label htmlFor="tags" className="form-label fw-bold">
                    Tags
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light">
                      <i className="fas fa-tags"></i>
                    </span>
                    <input
                      type="text"
                      name="tags"
                      id="tags"
                      value={formData.tags}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="Comma separated tags (web,production,backend)"
                    />
                  </div>
                </div> */}

                {/* Description */}
                {/* <div className="col-12">
                  <label htmlFor="description" className="form-label fw-bold">
                    Description
                  </label>
                  <textarea
                    name="description"
                    id="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="form-control"
                    rows="3"
                    placeholder="Optional server description or notes..."
                  ></textarea>
                </div> */}
              </div>

              {/* Form Actions */}
              <div className="d-flex justify-content-between border-top pt-4">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="btn btn-outline-secondary"
                >
                  <i className="fas fa-times me-2"></i>
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary px-4"
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Adding Server...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save me-2"></i>
                      Save Server
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AddServer;