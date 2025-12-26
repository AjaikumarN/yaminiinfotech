import React, { useState, useEffect } from 'react';
import { getMyCalls, createCall } from '../hooks/useSalesmanApi';
import EmptyState from '../components/EmptyState';
import ExportButtons from '../components/ExportButtons';
import PhotoGallery from '../components/PhotoGallery';
import { showToast } from '../components/ToastNotification';
import '../styles/salesman.css';

/**
 * Calls Page - Enhanced call logging with voice-to-text and photos
 * Includes voice-to-text input button and export functionality
 */
export default function Calls() {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState('all'); // all, today, week
  const [photos, setPhotos] = useState([]);
  const [voiceLang, setVoiceLang] = useState('en-US'); // Default to English
  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    notes: '',
    outcome: '',
  });

  useEffect(() => {
    loadCalls();
  }, [filter]);

  const loadCalls = async () => {
    try {
      const todayOnly = filter === 'today';
      const data = await getMyCalls(todayOnly);
      
      // Additional filtering for week
      if (filter === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const filtered = data.filter(call => 
          new Date(call.created_at) >= weekAgo
        );
        setCalls(filtered);
      } else {
        setCalls(data);
      }
    } catch (error) {
      console.error('Failed to load calls:', error);
      showToast && showToast('Failed to load calls', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceInput = () => {
    // Check if browser supports speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      showToast && showToast('Speech recognition not supported in this browser', 'error');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = voiceLang; // Use selected language (Tamil or English)
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      showToast && showToast(
        voiceLang === 'ta-IN' ? '🎤 கேட்கிறது... (Tamil)' : '🎤 Listening... (English)', 
        'info', 
        2000
      );
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setFormData(prev => ({
        ...prev,
        notes: prev.notes + (prev.notes ? ' ' : '') + transcript
      }));
      showToast && showToast('✓ Voice note added!', 'success');
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'no-speech') {
        showToast && showToast('No speech detected. Please try again.', 'warning');
      } else if (event.error === 'network') {
        showToast && showToast('Network error. Check your connection.', 'error');
      } else {
        showToast && showToast('Voice input failed. Please try again.', 'error');
      }
    };

    recognition.start();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await createCall(formData);
      showToast && showToast('✅ Call logged successfully!', 'success');
      setShowForm(false);
      setFormData({ customer_name: '', phone: '', notes: '', outcome: '' });
      setPhotos([]);
      await loadCalls();
    } catch (error) {
      console.error('Failed to create call:', error);
      showToast && showToast('Failed to log call', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddPhoto = (photo) => {
    setPhotos(prev => [...prev, photo]);
  };

  const handleDeletePhoto = (photoId) => {
    setPhotos(prev => prev.filter(p => p.id !== photoId));
  };

  if (loading) {
    return <div className="page-header"><h2 className="page-title">Loading...</h2></div>;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Calls</h2>
          <p className="page-description">{calls.length} total calls</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select
            className="form-control"
            style={{ width: 'auto' }}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Calls</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
          </select>
          <ExportButtons data={calls} filename="calls" type="calls" />
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? '✕ Cancel' : '+ Log Call'}
          </button>
        </div>
      </div>

      {/* Call Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="form-card">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Customer Name *</label>
              <input
                type="text"
                className="form-control"
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone *</label>
              <input
                type="tel"
                className="form-control"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Call Notes *</label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <select
                className="form-control"
                style={{ width: 'auto' }}
                value={voiceLang}
                onChange={(e) => setVoiceLang(e.target.value)}
              >
                <option value="en-US">🇬🇧 English</option>
                <option value="ta-IN">தமிழ் Tamil</option>
              </select>
              <button
                type="button"
                onClick={handleVoiceInput}
                className="btn btn-secondary"
                title="Voice input"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                🎤 Voice Input
              </button>
            </div>
            <textarea
              className="form-control"
              rows="4"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Describe the call details... (Click Voice Input to speak)"
              required
            />
            <div style={{ marginTop: '8px', fontSize: '14px', color: '#64748B' }}>
              💡 Select language and click Voice Input button to dictate notes
              <button
                type="button"
                onClick={handleVoiceInput}
                className="voice-btn"
                title="Voice input"
              >
                🎤
              </button>
            </div>
            <div style={{ marginTop: '8px', fontSize: '14px', color: '#64748B' }}>
              💡 Click the 🎤 microphone button to use voice-to-text
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Outcome *</label>
            <select
              className="form-control"
              value={formData.outcome}
              onChange={(e) => setFormData({ ...formData, outcome: e.target.value })}
              required
            >
              <option value="">Select outcome</option>
              <option value="interested">Interested</option>
              <option value="not_interested">Not Interested</option>
              <option value="callback">Call Back Later</option>
              <option value="converted">Converted to Order</option>
            </select>
          </div>

          {/* Photo Gallery for Call */}
          <PhotoGallery
            photos={photos}
            onAddPhoto={handleAddPhoto}
            onDeletePhoto={handleDeletePhoto}
          />

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Logging...' : '✓ Log Call'}
            </button>
          </div>
        </form>
      )}

      {/* Calls List */}
      {calls.length === 0 ? (
        <EmptyState icon="📞" message="No calls logged yet. Start by logging your first call!" />
      ) : (
        <div>
          <h3 className="section-title" style={{ marginTop: '32px' }}>📞 Call History</h3>
          <div style={{ 
            background: '#FFFFFF', 
            borderRadius: '12px', 
            overflow: 'hidden',
            border: '1px solid #E5E7EB'
          }}>
            {calls.map((call, index) => (
              <div 
                key={call.id} 
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1.5fr 3fr 1.5fr 1fr',
                  gap: '16px',
                  padding: '16px 20px',
                  borderBottom: index < calls.length - 1 ? '1px solid #F3F4F6' : 'none',
                  alignItems: 'center',
                  transition: 'background-color 0.15s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#FFFFFF'}
              >
                {/* Customer Name + Phone */}
                <div>
                  <div style={{ 
                    fontSize: '14px', 
                    fontWeight: 600, 
                    color: '#111827',
                    marginBottom: '4px'
                  }}>
                    {call.customer_name}
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#6B7280'
                  }}>
                    📱 {call.phone}
                  </div>
                </div>

                {/* Call Purpose */}
                <div style={{ fontSize: '14px', color: '#374151' }}>
                  {call.call_purpose || 'General inquiry'}
                </div>

                {/* Notes/Details */}
                <div style={{ 
                  fontSize: '13px', 
                  color: '#6B7280',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {call.notes || '—'}
                </div>

                {/* Outcome Badge */}
                <div>
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 500,
                    background: 
                      call.outcome === 'interested' ? '#D1FAE5' :
                      call.outcome === 'not_interested' ? '#FEE2E2' :
                      call.outcome === 'callback' ? '#FEF3C7' :
                      call.outcome === 'converted' ? '#DBEAFE' :
                      '#F3F4F6',
                    color: 
                      call.outcome === 'interested' ? '#065F46' :
                      call.outcome === 'not_interested' ? '#991B1B' :
                      call.outcome === 'callback' ? '#92400E' :
                      call.outcome === 'converted' ? '#1E40AF' :
                      '#374151'
                  }}>
                    {call.outcome === 'interested' ? '✅ Interested' :
                     call.outcome === 'not_interested' ? '❌ Not Interested' :
                     call.outcome === 'callback' ? '📞 Call Back' :
                     call.outcome === 'converted' ? '🎉 Converted' :
                     call.outcome?.replace('_', ' ') || 'Pending'}
                  </span>
                </div>

                {/* Date/Time */}
                <div style={{ fontSize: '12px', color: '#9CA3AF', textAlign: 'right' }}>
                  <div>{new Date(call.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })}</div>
                  <div>{new Date(call.created_at).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
