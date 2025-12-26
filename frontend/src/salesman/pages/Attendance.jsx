import React, { useState, useEffect } from 'react';
import { checkTodayAttendance, markAttendance } from '../hooks/useSalesmanApi';
import '../styles/salesman.css';

/**
 * Attendance Page - Optional attendance marking
 * NO blocking, soft reminders only
 * Includes photo capture and GPS location
 */
export default function Attendance() {
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');

  useEffect(() => {
    checkAttendance();
  }, []);

  const checkAttendance = async () => {
    try {
      const data = await checkTodayAttendance();
      setTodayAttendance(data);
    } catch (error) {
      console.error('Failed to check attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Reverse geocoding function to get area/city name from coordinates
  const reverseGeocode = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
      );
      const data = await response.json();
      
      // Extract meaningful location (area/city)
      const city = data.address?.city || data.address?.town || data.address?.village || '';
      const area = data.address?.suburb || data.address?.neighbourhood || '';
      const state = data.address?.state || '';
      
      // Format as "Area, City, State"
      const parts = [area, city, state].filter(Boolean);
      return parts.join(', ') || 'Location detected';
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      return `${lat.toFixed(4)}, ${lon.toFixed(4)}`; // Fallback to coordinates
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!photo) {
      alert('Please capture a photo before marking attendance');
      return;
    }

    setSubmitting(true);

    try {
      // Get GPS location
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          (error) => {
            // Graceful fallback if GPS permission denied
            if (error.code === error.PERMISSION_DENIED) {
              alert('Location permission denied. Please enable location access or enter manually.');
            }
            reject(error);
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );
      });

      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      // Get readable location name (city/area)
      const locationName = await reverseGeocode(lat, lon);

      const formData = new FormData();
      formData.append('photo', photo);
      formData.append('latitude', lat);
      formData.append('longitude', lon);
      formData.append('location', locationName);
      formData.append('time', new Date().toISOString());
      formData.append('status', 'Present');

      await markAttendance(formData);
      alert(`✅ Attendance marked successfully!\n📍 Location: ${locationName}`);
      
      // Recheck attendance
      await checkAttendance();
    } catch (error) {
      console.error('Failed to mark attendance:', error);
      alert(error.response?.data?.detail || 'Failed to mark attendance. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="page-header"><h2 className="page-title">Loading...</h2></div>;
  }

  // Already marked
  if (todayAttendance) {
    return (
      <div>
        <div className="page-header">
          <h2 className="page-title">Attendance</h2>
          <p className="page-description">Your attendance for today</p>
        </div>

        <div className="attendance-banner marked">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
            <div style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>
              Attendance Already Marked
            </div>
            <div style={{ fontSize: '14px', color: '#059669' }}>
              Check-in: {new Date(todayAttendance.check_in_time).toLocaleTimeString()}
            </div>
            {todayAttendance.check_out_time && (
              <div style={{ fontSize: '14px', color: '#059669' }}>
                Check-out: {new Date(todayAttendance.check_out_time).toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Mark attendance form
  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Mark Attendance</h2>
        <p className="page-description">Optional attendance marking for better tracking</p>
      </div>

      <div className="attendance-banner not-marked">
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏰</div>
          <div style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>
            Attendance Not Marked Yet
          </div>
          <div style={{ fontSize: '14px', color: '#92400E' }}>
            You can mark your attendance below (optional)
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-group">
          <label className="form-label">Capture Photo *</label>
          <input
            type="file"
            accept="image/*"
            capture="user"
            onChange={handlePhotoChange}
            className="form-control"
            required
          />
          {photoPreview && (
            <div style={{ marginTop: '12px' }}>
              <img
                src={photoPreview}
                alt="Preview"
                style={{ maxWidth: '200px', borderRadius: '8px', border: '1px solid #E5E7EB' }}
              />
            </div>
          )}
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Marking...' : '✓ Mark Attendance'}
          </button>
        </div>

        <div style={{ marginTop: '16px', fontSize: '14px', color: '#64748B' }}>
          📍 GPS location will be captured automatically
        </div>
      </form>
    </div>
  );
}
