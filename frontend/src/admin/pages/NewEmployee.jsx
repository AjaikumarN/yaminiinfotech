import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../../utils/api';

export default function NewEmployee() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    gender: '',
    dateOfBirth: '',
    mobileNumber: '',
    emailAddress: '',
    currentAddress: '',
    permanentAddress: '',
    employeeId: '',
    nationality: 'Indian',
    photograph: null,
    department: '',
    role: '',
    dateOfJoining: '',
    username: '',
    password: '',
    salary: '',
    bankName: '',
    accountNumber: ''
  });

  const [loading, setLoading] = useState(false);
  const [sameAsCurrentAddress, setSameAsCurrentAddress] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, photograph: e.target.files[0] }));
  };

  const handleAddressCheckbox = (e) => {
    setSameAsCurrentAddress(e.target.checked);
    if (e.target.checked) {
      setFormData(prev => ({ ...prev, permanentAddress: prev.currentAddress }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiRequest('/api/users/', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      alert('Employee created successfully!');
      navigate('/admin/employees/salesmen');
    } catch (error) {
      console.error('Failed to create employee:', error);
      alert('Failed to create employee');
    } finally {
      setLoading(false);
    }
  };

  const sectionStyle = {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)'
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px',
    paddingBottom: '16px',
    borderBottom: '2px solid #f3f4f6'
  };

  const titleStyle = {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1f2937',
    margin: 0
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px'
  };

  const fieldStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  };

  const labelStyle = {
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151'
  };

  const inputStyle = {
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s'
  };

  const buttonStyle = {
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
        borderRadius: '16px',
        padding: '32px',
        marginBottom: '32px',
        color: 'white'
      }}>
        <h1 style={{ fontSize: '32px', fontWeight: '800', margin: 0, marginBottom: '8px' }}>
          👤 New Employee
        </h1>
        <p style={{ fontSize: '16px', opacity: 0.9, margin: 0 }}>
          Add a new team member to the system
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* 1. Personal Information */}
        <div style={sectionStyle}>
          <div style={headerStyle}>
            <span style={{ fontSize: '24px' }}>👤</span>
            <h2 style={titleStyle}>1. Personal Information</h2>
          </div>
          <div style={gridStyle}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Full Name *</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                style={inputStyle}
                placeholder="Enter full name"
                onFocus={(e) => e.target.style.borderColor = '#667EEA'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Gender *</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = '#667EEA'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Date of Birth *</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = '#667EEA'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Mobile Number *</label>
              <input
                type="tel"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
                required
                style={inputStyle}
                placeholder="+91 XXXXX XXXXX"
                onFocus={(e) => e.target.style.borderColor = '#667EEA'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Email Address *</label>
              <input
                type="email"
                name="emailAddress"
                value={formData.emailAddress}
                onChange={handleChange}
                required
                style={inputStyle}
                placeholder="email@example.com"
                onFocus={(e) => e.target.style.borderColor = '#667EEA'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>
            <div style={{ ...fieldStyle, gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Current Address *</label>
              <textarea
                name="currentAddress"
                value={formData.currentAddress}
                onChange={handleChange}
                required
                rows="3"
                style={{ ...inputStyle, resize: 'vertical' }}
                placeholder="Enter current address"
                onFocus={(e) => e.target.style.borderColor = '#667EEA'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>
            <div style={{ ...fieldStyle, gridColumn: '1 / -1' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="checkbox"
                  id="sameAddress"
                  checked={sameAsCurrentAddress}
                  onChange={handleAddressCheckbox}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label htmlFor="sameAddress" style={{ fontSize: '13px', color: '#6b7280', cursor: 'pointer' }}>
                  Same as current address
                </label>
              </div>
              <label style={labelStyle}>Permanent Address *</label>
              <textarea
                name="permanentAddress"
                value={formData.permanentAddress}
                onChange={handleChange}
                required
                rows="3"
                disabled={sameAsCurrentAddress}
                style={{ ...inputStyle, resize: 'vertical', opacity: sameAsCurrentAddress ? 0.6 : 1 }}
                placeholder="Enter permanent address"
                onFocus={(e) => e.target.style.borderColor = '#667EEA'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>
          </div>
        </div>

        {/* 2. Identification / KYC Details */}
        <div style={sectionStyle}>
          <div style={headerStyle}>
            <span style={{ fontSize: '24px' }}>🆔</span>
            <h2 style={titleStyle}>2. Identification / KYC Details</h2>
          </div>
          <div style={gridStyle}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Employee ID</label>
              <input
                type="text"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                style={{ ...inputStyle, background: '#f9fafb' }}
                placeholder="Auto-generated"
                readOnly
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Nationality *</label>
              <input
                type="text"
                name="nationality"
                value={formData.nationality}
                onChange={handleChange}
                required
                style={inputStyle}
                placeholder="Enter nationality"
                onFocus={(e) => e.target.style.borderColor = '#667EEA'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Photograph (Passport Size)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ ...inputStyle, padding: '8px 12px' }}
              />
            </div>
          </div>
        </div>

        {/* 3. Employment Details */}
        <div style={sectionStyle}>
          <div style={headerStyle}>
            <span style={{ fontSize: '24px' }}>💼</span>
            <h2 style={titleStyle}>3. Employment Details</h2>
          </div>
          <div style={gridStyle}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Department *</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = '#667EEA'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              >
                <option value="">Select Department</option>
                <option value="Sales">Sales</option>
                <option value="Service">Service</option>
                <option value="Reception">Reception</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Role *</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = '#667EEA'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              >
                <option value="">Select Role</option>
                <option value="SALESMAN">Salesman</option>
                <option value="SERVICE_ENGINEER">Service Engineer</option>
                <option value="RECEPTION">Reception</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Date of Joining *</label>
              <input
                type="date"
                name="dateOfJoining"
                value={formData.dateOfJoining}
                onChange={handleChange}
                required
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = '#667EEA'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>
          </div>
        </div>

        {/* 4. Account & System Access */}
        <div style={sectionStyle}>
          <div style={headerStyle}>
            <span style={{ fontSize: '24px' }}>🔐</span>
            <h2 style={titleStyle}>4. Account & System Access</h2>
          </div>
          <div style={gridStyle}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Username / Employee Login ID *</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                style={inputStyle}
                placeholder="Enter username"
                onFocus={(e) => e.target.style.borderColor = '#667EEA'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Password *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                style={inputStyle}
                placeholder="Enter password"
                onFocus={(e) => e.target.style.borderColor = '#667EEA'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>
          </div>
        </div>

        {/* 5. Salary & Payroll Information */}
        <div style={sectionStyle}>
          <div style={headerStyle}>
            <span style={{ fontSize: '24px' }}>💰</span>
            <h2 style={titleStyle}>5. Salary & Payroll Information</h2>
          </div>
          <div style={gridStyle}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Salary *</label>
              <input
                type="number"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                required
                style={inputStyle}
                placeholder="Enter monthly salary"
                onFocus={(e) => e.target.style.borderColor = '#667EEA'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Bank Name *</label>
              <input
                type="text"
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                required
                style={inputStyle}
                placeholder="Enter bank name"
                onFocus={(e) => e.target.style.borderColor = '#667EEA'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Account Number *</label>
              <input
                type="text"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                required
                style={inputStyle}
                placeholder="Enter account number"
                onFocus={(e) => e.target.style.borderColor = '#667EEA'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', marginTop: '32px' }}>
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              ...buttonStyle,
              background: 'white',
              color: '#6b7280',
              border: '1px solid #d1d5db'
            }}
            onMouseEnter={(e) => e.target.style.background = '#f9fafb'}
            onMouseLeave={(e) => e.target.style.background = 'white'}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              ...buttonStyle,
              background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
              color: 'white'
            }}
            onMouseEnter={(e) => e.target.style.opacity = '0.9'}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
          >
            {loading ? 'Creating...' : 'Create Employee'}
          </button>
        </div>
      </form>
    </div>
  );
}
