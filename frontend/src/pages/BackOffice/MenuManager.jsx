import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MenuManager.css';

export default function Reservations() {
  const navigate = useNavigate();

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [contact, setContact] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [pax, setPax] = useState('');
  const [packageSelected, setPackageSelected] = useState('Barkada Package');

  const handleSaveReservation = (e) => {
    e.preventDefault();
    
    // BACKEND HANDOFF NOTE FOR DARREN:
    // console.log("Sending to DB:", { customerName, contact, eventDate, eventTime, pax, packageSelected });
    
    alert(`Dev Note: Reservation for ${customerName} is ready for the database!`);
    
    // Reset Form
    setCustomerName('');
    setContact('');
    setEventDate('');
    setEventTime('');
    setPax('');
  };

  // Mock Data for UI presentation
  const mockBookings = [
    { id: 1, name: 'Kyle Laguerta', date: '2026-05-10', time: '18:00', pax: 15, package: 'Barkada Package' },
    { id: 2, name: 'Eury', date: '2026-05-12', time: '12:00', pax: 4, package: 'Table Reservation Only' },
  ];

  return (
    <div className="res-container">
      <header className="res-header">
        <h1>📅 ServiQ Reservations & Catering</h1>
        <button 
          onClick={() => navigate('/')}
          style={{ padding: '10px 20px', backgroundColor: '#334155', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          ← Return to POS
        </button>
      </header>

      <div className="res-grid">
        
        {/* LEFT COLUMN: Booking Form */}
        <div className="res-form-panel">
          <h3>➕ New Booking</h3>
          
          <form onSubmit={handleSaveReservation}>
            <div>
              <label>Customer Name</label>
              <input type="text" placeholder="e.g., John Doe" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
            </div>

            <div>
              <label>Contact Number</label>
              <input type="text" placeholder="e.g., 09123456789" value={contact} onChange={(e) => setContact(e.target.value)} required />
            </div>

            <div className="split-row">
              <div>
                <label>Event Date</label>
                <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} required />
              </div>
              <div>
                <label>Time</label>
                <input type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} required />
              </div>
            </div>

            <div className="split-row">
              <div>
                <label>Number of Pax</label>
                <input type="number" placeholder="e.g., 10" value={pax} onChange={(e) => setPax(e.target.value)} required />
              </div>
              <div>
                <label>Package Selected</label>
                <select value={packageSelected} onChange={(e) => setPackageSelected(e.target.value)}>
                  <option value="Table Reservation Only">Table Reservation Only</option>
                  <option value="Barkada Package">Barkada Package</option>
                  <option value="Fiesta Package">Fiesta Package</option>
                  <option value="Custom Catering">Custom Catering</option>
                </select>
              </div>
            </div>

            <button type="submit" style={{ padding: '12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}>
              Confirm Reservation
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: Live Bookings */}
        <div className="res-list-panel">
          <h3>📋 Upcoming Events & Bookings</h3>
          <div style={{ marginTop: '20px' }}>
            {mockBookings.map((booking) => (
              <div key={booking.id} className="booking-card">
                <div className="booking-info">
                  <h4>{booking.name}</h4>
                  <p className="booking-details">
                    Pax: {booking.pax} | Package: {booking.package}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="booking-date">{booking.date}</div>
                  <div style={{ color: '#94a3b8', fontSize: '14px' }}>{booking.time}</div>
                  <button style={{ marginTop: '5px', padding: '4px 8px', backgroundColor: '#475569', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Modify</button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}