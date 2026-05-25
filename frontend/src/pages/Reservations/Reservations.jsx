import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Reservations.css';
import { useInventoryContext } from '../../context/InventoryContext';

export default function Reservations() {
  const navigate = useNavigate();

  const { packages } = useInventoryContext();
  console.log(packages);

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [contact, setContact] = useState('');
  const [location, setLocation] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [packageSelected, setPackageSelected] = useState('Barkada Package');
  const [downPayment, setDownPayment] = useState('');
  const [serviceFee, setServiceFee] = useState('');
  const [status, setStatus] = useState('Pending');
  const [reservations, setReservations] = useState([]);
  const [reservationError, setReservationError] = useState(null);

  const fetchReservations = async () => {
    try {
      const response = await fetch('http://localhost:3000/order/reservation');
      const result = await response.json();

      if (response.ok && result.success) {
        setReservations(result.data);
        setReservationError(null);
      } else {
        setReservations([]);
        setReservationError(result.error || 'Unable to load reservations.');
      }
    } catch (error) {
      setReservations([]);
      setReservationError('Could not connect to the server.');
      console.error('Reservations fetch failed:', error);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  // TEST THIS
  const handleSaveReservation = (e) => {
    e.preventDefault();
    
    // BACKEND HANDOFF NOTE FOR DARREN:
    // console.log("Sending to DB:", { customerName, contact, location, eventDate, packageSelected, downPayment, serviceFee, status });

    fetch('http://localhost:3000/order/reservation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        location: location,
        reservation_date: eventDate,
        down_payment: downPayment,
        status: status,
        customer_name: customerName,
        contact_number: contact,
        service_fee: serviceFee,
        package_id: packageSelected,
      })
    })
    .then(response => response.json())
    .then(data => {
      console.log('Success:', data);
      if (data.success) {
        fetchReservations();
      }
    })
    .catch(error => console.error('Error:', error));
    
    alert(`Dev Note: Reservation for ${customerName} is ready for the database!`);
    
    // Reset Form
    setCustomerName('');
    setContact('');
    setLocation('');
    setEventDate('');
    setPackageSelected('Barkada Package');
    setDownPayment('');
    setServiceFee('');
    setStatus('Pending');
  };

  // Mock Data for UI presentation
  const mockBookings = [
    { id: 1, name: 'Kyle Laguerta', date: '2026-05-10', package: 'Barkada Package' },
    { id: 2, name: 'Joeven Gatuteo', date: '2026-05-12', package: 'Table Reservation Only' },
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

            <div>
              <label>Location</label>
              <input type="text" placeholder="e.g., Banquet Hall A" value={location} onChange={(e) => setLocation(e.target.value)} required />
            </div>

            <div className="split-row">
              <div>
                <label>Event Date</label>
                <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} required />
              </div>
            </div>

            <div className="split-row">
              <div>
                <label>Down Payment</label>
                <input type="number" min="0" step="0.01" placeholder="0.00" value={downPayment} onChange={(e) => setDownPayment(e.target.value)} required />
              </div>

              <div>
                <label>Service Fee</label>
                <input type="number" min="0" step="0.01" placeholder="0.00" value={serviceFee} onChange={(e) => setServiceFee(e.target.value)} required />
              </div>
            </div>

            <div className="split-row">

              <div>
                <label>Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="split-row">
              <div>
                <label>Package Selected</label>
                <select value={packageSelected} onChange={(e) => setPackageSelected(e.target.value)}>
                  <option value="">Select a package</option> {/* Good practice to have a default */}
                    {packages.map((pkg) => (
                      <option key={pkg.package_id} value={pkg.package_id}>
                        {pkg.package_name}
                      </option>
                    ))}
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
            {reservationError && <div className="error-message">{reservationError}</div>}
            {reservations.length === 0 && !reservationError ? (
              <p className="empty-list">No reservations found.</p>
            ) : (
              reservations.map((reservation) => (
                <div key={reservation.reservation_id} className="booking-card">
                  <div className="booking-info">
                    <h4>{reservation.customer_name || 'Guest'}</h4>
                    <p className="booking-details">Location: {reservation.location}</p>
                    <p className="booking-details">Status: {reservation.status}</p>
                    <p className="booking-details">Down Payment: ₱{reservation.down_payment ?? '0.00'}</p>
                    <p className="booking-details">Service Fee: ₱{reservation.service_fee ?? '0.00'}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="booking-date">{reservation.reservation_date?.split('T')[0] || reservation.reservation_date}</div>
                    <div style={{ color: '#94a3b8', fontSize: '14px' }}>ID: {reservation.reservation_id}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}