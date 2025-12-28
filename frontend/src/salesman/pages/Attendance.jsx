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
  const [useCamera, setUseCamera] = useState(false);
  const [stream, setStream] = useState(null);
  const videoRef = React.useRef(null);
  const canvasRef = React.useRef(null);

  useEffect(() => {
    checkAttendance();
    return () => {
      // Cleanup camera stream on unmount
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

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

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false 
      });
      
      console.log('Camera stream obtained:', mediaStream);
      console.log('Video tracks:', mediaStream.getVideoTracks());
      
      setStream(mediaStream);
      setUseCamera(true);
      
      // Wait for next tick to ensure state is updated
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          console.log('Video srcObject set');
          
          // Force play when metadata is loaded
          videoRef.current.onloadedmetadata = () => {
            console.log('Video metadata loaded');
            videoRef.current.play()
              .then(() => console.log('Video playing successfully'))
              .catch(err => console.error('Play error:', err));
          };
        }
      }, 100);
    } catch (error) {
      console.error('Failed to access camera:', error);
      alert('❌ Could not access camera. Please check permissions or use Upload Photo option.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setUseCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      
      canvas.toBlob((blob) => {
        setPhoto(blob);
        setPhotoPreview(canvas.toDataURL('image/jpeg'));
        stopCamera();
      }, 'image/jpeg', 0.8);
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
      formData.append('time', new Date().toLocaleTimeString('en-US', { hour12: false }));
      formData.append('attendance_status', 'Present');

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
          
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={startCamera}
              className="btn btn-secondary"
              disabled={useCamera}
              style={{
                background: useCamera ? '#D1D5DB' : '#10B981',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: useCamera ? 'not-allowed' : 'pointer',
                fontWeight: 600
              }}
            >
              📷 Use Camera
            </button>
            <label 
              style={{
                background: '#3B82F6',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              📁 Upload Photo
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          {useCamera && (
            <div style={{ marginBottom: '16px' }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                style={{
                  width: '100%',
                  maxWidth: '400px',
                  borderRadius: '8px',
                  border: '2px solid #E5E7EB',
                  display: 'block',
                  marginBottom: '12px'
                }}
              />
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="btn btn-primary"
                  style={{
                    background: '#10B981',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  📸 Capture
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="btn btn-secondary"
                  style={{
                    background: '#EF4444',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  ✕ Cancel
                </button>
              </div>
            </div>
          )}

          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {photoPreview && (
            <div style={{ marginTop: '12px' }}>
              <img
                src={photoPreview}
                alt="Preview"
                style={{ 
                  maxWidth: '300px', 
                  borderRadius: '8px', 
                  border: '2px solid #10B981',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
              />
              <button
                type="button"
                onClick={() => {
                  setPhoto(null);
                  setPhotoPreview('');
                }}
                style={{
                  display: 'block',
                  marginTop: '8px',
                  background: '#EF4444',
                  color: 'white',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                🗑 Remove Photo
              </button>
            </div>
          )}
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={submitting || !photo}>
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
