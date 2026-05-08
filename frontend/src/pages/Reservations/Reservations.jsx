import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Reservations.css';

// 1. DUMMY DATABASE: Simulating 'Reservation' and 'Client' tables
const initialReservations = [
  { id: 'RES-101', client: 'Nicole Bianca', date: '2026-05-15', time: '12:00 PM', location: 'Bicol University Hall', guests: 50, downpayment: 'Paid', status: 'Confirmed' },
  { id: 'RES-102', client: 'Kyle Darren', date: '2026-05-20', time: '6:00 PM', location: 'Legazpi City Park', guests: 100, downpayment: 'Pending', status: 'Tentative' },
  { id: 'RES-103', client: 'Eury Smith', date: '2026-06-02', time: '10:00 AM', location: 'In-Store (VIP Area)', guests: 12, downpayment: 'Paid', status: 'Confirmed' },
];

export default function Reservations() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings] = useState(initialReservations);

  return (
    <div className="res-container">
      
      {/* LEFT: Sidebar Navigation */}
      <aside className="res-sidebar">
        <div className="res-logo">ServiQ Bookings</div>
        
        <nav className="res-nav">
          <button 
            className={`res-nav-btn ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            Upcoming Events
          </button>
          <button 
            className={`res-nav-btn ${activeTab === 'clients' ? 'active' : ''}`}
            onClick={() => setActiveTab('clients')}
          >
            👤 Client Directory
          </button>
        </nav>

        <button className="back-btn" onClick={() => navigate('/')}>
          ← Return to POS
        </button>
      </aside>

      {/* RIGHT: Main Content */}
      <main className="res-main">
        <header className="res-header">
          <h1 className="h1">{activeTab === 'bookings' ? 'Event Calendar' : 'Client Directory'}</h1>
          <button className="new-res-btn">+ Create New Booking</button>
        </header>

        <div className="res-content">
          {activeTab === 'bookings' && (
            <div className="booking-list">
              {bookings.map((res) => (
                <div key={res.id} className={`booking-card ${res.status.toLowerCase()}`}>
                  <div className="card-top">
                    <span className="res-id">{res.id}</span>
                    <span className={`payment-tag ${res.downpayment.toLowerCase()}`}>
                      DP: {res.downpayment}
                    </span>
                  </div>
                  
                  <div className="card-body">
                    <h3>{res.client}</h3>
                    <p className="event-detail">{res.location}</p>
                    <p className="event-detail">{res.date} at {res.time}</p>
                    <p className="guest-count">Guests: {res.guests}</p>
                  </div>

                  <div className="card-footer">
                    <span className="status-label">{res.status}</span>
                    <button className="detail-btn">View Contract</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'clients' && (
            <div className="placeholder-msg">
              <h2>👤 Client Management</h2>
              <p>Integration with 'Client' database table required to view profiles.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}