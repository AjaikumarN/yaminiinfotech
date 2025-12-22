import { useState, useEffect } from 'react';
import axios from 'axios';

const EnquiryTemperatureCard = ({ enquiry, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [temperature, setTemperature] = useState(enquiry.priority || 'WARM');
  const [instructionNotes, setInstructionNotes] = useState(enquiry.instruction_notes || '');
  const [nextFollowUp, setNextFollowUp] = useState(enquiry.next_follow_up || '');
  const [loading, setLoading] = useState(false);

  const temperatureColors = {
    HOT: { bg: '#ffebee', border: '#ef5350', color: '#c62828', label: '🔥 HOT', freq: 'Weekly' },
    WARM: { bg: '#fff3e0', border: '#ffa726', color: '#e65100', label: '🌡️ WARM', freq: 'Monthly' },
    COLD: { bg: '#e3f2fd', border: '#42a5f5', color: '#1565c0', label: '❄️ COLD', freq: 'Future' }
  };

  const currentTemp = temperatureColors[temperature];

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://127.0.0.1:8000/api/enquiries/${enquiry.id}`,
        {
          priority: temperature,
          instruction_notes: instructionNotes,
          next_follow_up: nextFollowUp
        },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      setIsEditing(false);
      if (onUpdate) onUpdate();
      
    } catch (error) {
      console.error('Failed to update enquiry:', error);
      alert('Failed to update enquiry temperature');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="enquiry-temp-card" style={{ 
      borderLeft: `4px solid ${currentTemp.border}`,
      background: currentTemp.bg 
    }}>
      <div className="card-header">
        <div className="customer-info">
          <h3>{enquiry.customer_name}</h3>
          <p className="product">{enquiry.product_interest}</p>
        </div>
        
        <div className="temp-badge" style={{ 
          background: currentTemp.color,
          color: 'white'
        }}>
          {currentTemp.label}
        </div>
      </div>

      <div className="card-body">
        <div className="info-row">
          <span className="label">📞 Phone:</span>
          <span>{enquiry.phone}</span>
        </div>
        
        <div className="info-row">
          <span className="label">📧 Email:</span>
          <span>{enquiry.email}</span>
        </div>

        <div className="info-row">
          <span className="label">📅 Next Follow-up:</span>
          <span>{nextFollowUp ? new Date(nextFollowUp).toLocaleDateString() : 'Not set'}</span>
        </div>

        <div className="info-row">
          <span className="label">🔔 Reminder:</span>
          <span>{currentTemp.freq} reminders active</span>
        </div>

        {instructionNotes && (
          <div className="notes-section">
            <span className="label">📝 Instructions:</span>
            <p>{instructionNotes}</p>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="edit-section">
          <div className="form-group">
            <label>Temperature</label>
            <select 
              value={temperature} 
              onChange={(e) => setTemperature(e.target.value)}
              className="temp-select"
            >
              <option value="HOT">🔥 HOT - Weekly reminders</option>
              <option value="WARM">🌡️ WARM - Monthly reminders</option>
              <option value="COLD">❄️ COLD - Future follow-up</option>
            </select>
          </div>

          <div className="form-group">
            <label>Next Follow-up Date</label>
            <input
              type="datetime-local"
              value={nextFollowUp}
              onChange={(e) => setNextFollowUp(e.target.value)}
              className="date-input"
            />
          </div>

          <div className="form-group">
            <label>Follow-up Instructions</label>
            <textarea
              value={instructionNotes}
              onChange={(e) => setInstructionNotes(e.target.value)}
              placeholder="Add specific instructions for the next follow-up..."
              rows="3"
              className="notes-input"
            />
          </div>

          <div className="button-group">
            <button onClick={handleSave} disabled={loading} className="save-btn">
              {loading ? '⏳ Saving...' : '✅ Save'}
            </button>
            <button onClick={() => setIsEditing(false)} className="cancel-btn">
              ❌ Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="card-footer">
          <button onClick={() => setIsEditing(true)} className="edit-btn">
            ✏️ Update Temperature
          </button>
        </div>
      )}

      <style jsx>{`
        .enquiry-temp-card {
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 15px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          transition: transform 0.2s;
        }

        .enquiry-temp-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 15px;
        }

        .customer-info h3 {
          margin: 0 0 5px 0;
          font-size: 18px;
          color: #1a1a1a;
        }

        .customer-info .product {
          margin: 0;
          color: #666;
          font-size: 14px;
        }

        .temp-badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 13px;
          white-space: nowrap;
        }

        .card-body {
          margin-bottom: 15px;
        }

        .info-row {
          display: flex;
          padding: 8px 0;
          border-bottom: 1px solid rgba(0,0,0,0.1);
          font-size: 14px;
        }

        .info-row:last-child {
          border-bottom: none;
        }

        .label {
          font-weight: 600;
          color: #555;
          min-width: 140px;
        }

        .notes-section {
          margin-top: 12px;
          padding: 12px;
          background: rgba(255,255,255,0.5);
          border-radius: 6px;
        }

        .notes-section p {
          margin: 8px 0 0 0;
          color: #333;
          line-height: 1.5;
        }

        .edit-section {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 2px solid rgba(0,0,0,0.1);
        }

        .form-group {
          margin-bottom: 15px;
        }

        .form-group label {
          display: block;
          margin-bottom: 6px;
          font-weight: 600;
          color: #333;
          font-size: 13px;
        }

        .temp-select,
        .date-input,
        .notes-input {
          width: 100%;
          padding: 8px 12px;
          border: 1.5px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
        }

        .notes-input {
          resize: vertical;
        }

        .button-group {
          display: flex;
          gap: 10px;
        }

        .save-btn,
        .cancel-btn,
        .edit-btn {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .save-btn {
          background: #28a745;
          color: white;
          flex: 1;
        }

        .save-btn:hover:not(:disabled) {
          background: #218838;
        }

        .save-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .cancel-btn {
          background: #6c757d;
          color: white;
          flex: 1;
        }

        .cancel-btn:hover {
          background: #5a6268;
        }

        .card-footer {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 2px solid rgba(0,0,0,0.1);
        }

        .edit-btn {
          background: #007bff;
          color: white;
          width: 100%;
        }

        .edit-btn:hover {
          background: #0056b3;
        }
      `}</style>
    </div>
  );
};

export default EnquiryTemperatureCard;
