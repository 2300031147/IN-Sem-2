import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingService } from '../services';
import { useAuth } from '../utils/AuthContext';

function BookingHistory() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadBookings();
  }, [isAuthenticated]);

  const loadBookings = async () => {
    try {
      const data = await bookingService.getUserBookings();
      setBookings(data);
    } catch (err) {
      setError('Failed to load bookings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await bookingService.cancelBooking(bookingId);
      alert('Booking cancelled successfully');
      loadBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking');
    }
  };

  if (loading) return <div className="loading">Loading bookings...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="bookings-container">
      <h1>My Bookings</h1>
      {bookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        <div className="bookings-list">
          {bookings.map((booking) => (
            <div key={booking.id} className="booking-card">
              <h3>{booking.title}</h3>
              <div className="booking-details">
                <p><strong>Date:</strong> {new Date(booking.date).toLocaleDateString()}</p>
                <p><strong>Time:</strong> {booking.time}</p>
                <p><strong>Venue:</strong> {booking.venue}</p>
                <p><strong>Seats:</strong> {booking.seats.join(', ')}</p>
                <p><strong>Total Amount:</strong> ${parseFloat(booking.total_amount).toFixed(2)}</p>
                <p><strong>Booking Date:</strong> {new Date(booking.booking_date).toLocaleString()}</p>
                <p className={`status ${booking.booking_status}`}>
                  <strong>Status:</strong> {booking.booking_status.toUpperCase()}
                </p>
              </div>
              {booking.booking_status === 'confirmed' && (
                <button
                  className="btn btn-danger"
                  onClick={() => handleCancelBooking(booking.id)}
                >
                  Cancel Booking
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BookingHistory;
