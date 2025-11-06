import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { showService, bookingService } from '../services';
import { useAuth } from '../utils/AuthContext';

function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [show, setShow] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadShowAndSeats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isAuthenticated]);

  const loadShowAndSeats = async () => {
    try {
      const [showData, seatsData] = await Promise.all([
        showService.getShowById(id),
        showService.getShowSeats(id),
      ]);
      setShow(showData);
      setSeats(seatsData);
    } catch (err) {
      setError('Failed to load show details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSeatClick = (seat) => {
    if (seat.is_booked) return;

    setSelectedSeats((prev) => {
      const isSelected = prev.includes(seat.id);
      if (isSelected) {
        return prev.filter((id) => id !== seat.id);
      } else {
        return [...prev, seat.id];
      }
    });
  };

  const handleBooking = async () => {
    if (selectedSeats.length === 0) {
      setError('Please select at least one seat');
      return;
    }

    setBooking(true);
    setError('');

    try {
      await bookingService.createBooking({
        show_id: parseInt(id),
        seat_ids: selectedSeats,
      });
      alert('Booking successful!');
      navigate('/bookings');
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  const groupSeatsByRow = () => {
    const grouped = {};
    seats.forEach((seat) => {
      if (!grouped[seat.row_label]) {
        grouped[seat.row_label] = [];
      }
      grouped[seat.row_label].push(seat);
    });
    return grouped;
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error && !show) return <div className="error-message">{error}</div>;

  const groupedSeats = groupSeatsByRow();
  const totalPrice = show ? selectedSeats.length * show.price : 0;

  return (
    <div className="booking-container">
      {show && (
        <>
          <h1>Book Tickets for {show.title}</h1>
          <div className="show-info">
            <p><strong>Date:</strong> {new Date(show.date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> {show.time}</p>
            <p><strong>Venue:</strong> {show.venue}</p>
            <p><strong>Price per seat:</strong> ${show.price}</p>
          </div>

          <div className="screen">SCREEN</div>

          <div className="seats-container">
            {Object.keys(groupedSeats).sort().map((row) => (
              <div key={row} className="seat-row">
                <span className="row-label">{row}</span>
                <div className="seats">
                  {groupedSeats[row].map((seat) => (
                    <button
                      key={seat.id}
                      className={`seat ${seat.is_booked ? 'booked' : ''} ${
                        selectedSeats.includes(seat.id) ? 'selected' : ''
                      }`}
                      onClick={() => handleSeatClick(seat)}
                      disabled={seat.is_booked}
                    >
                      {seat.seat_number}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="legend">
            <div className="legend-item">
              <span className="seat available"></span> Available
            </div>
            <div className="legend-item">
              <span className="seat selected"></span> Selected
            </div>
            <div className="legend-item">
              <span className="seat booked"></span> Booked
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="booking-summary">
            <p><strong>Selected Seats:</strong> {selectedSeats.length}</p>
            <p><strong>Total Amount:</strong> ${totalPrice.toFixed(2)}</p>
            <button
              className="btn btn-primary"
              onClick={handleBooking}
              disabled={booking || selectedSeats.length === 0}
            >
              {booking ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Booking;
