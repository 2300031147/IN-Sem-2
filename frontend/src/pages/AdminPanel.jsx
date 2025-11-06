import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { showService, bookingService } from '../services';
import { useAuth } from '../utils/AuthContext';

function AdminPanel() {
  const [shows, setShows] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('shows');
  const [showForm, setShowForm] = useState(false);
  const [editingShow, setEditingShow] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    venue: '',
    total_seats: '',
    price: '',
    image_url: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    loadData();
  }, [isAdmin, activeTab]);

  const loadData = async () => {
    try {
      if (activeTab === 'shows') {
        const data = await showService.getAllShows();
        setShows(data);
      } else {
        const data = await bookingService.getAllBookings();
        setBookings(data);
      }
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    }
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingShow) {
        await showService.updateShow(editingShow.id, formData);
        alert('Show updated successfully');
      } else {
        await showService.createShow(formData);
        alert('Show created successfully');
      }
      setShowForm(false);
      setEditingShow(null);
      resetForm();
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (show) => {
    setEditingShow(show);
    setFormData({
      title: show.title,
      description: show.description || '',
      date: show.date.split('T')[0],
      time: show.time,
      venue: show.venue,
      total_seats: show.total_seats,
      price: show.price,
      image_url: show.image_url || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this show?')) {
      return;
    }

    try {
      await showService.deleteShow(id);
      alert('Show deleted successfully');
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete show');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      time: '',
      venue: '',
      total_seats: '',
      price: '',
      image_url: '',
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingShow(null);
    resetForm();
    setError('');
  };

  return (
    <div className="admin-container">
      <h1>Admin Panel</h1>

      <div className="admin-tabs">
        <button
          className={`tab ${activeTab === 'shows' ? 'active' : ''}`}
          onClick={() => setActiveTab('shows')}
        >
          Manage Shows
        </button>
        <button
          className={`tab ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          View Bookings
        </button>
      </div>

      {activeTab === 'shows' && (
        <div className="shows-management">
          {!showForm ? (
            <>
              <button
                className="btn btn-primary"
                onClick={() => setShowForm(true)}
              >
                Add New Show
              </button>

              <div className="shows-table">
                <table>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Venue</th>
                      <th>Price</th>
                      <th>Available/Total Seats</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shows.map((show) => (
                      <tr key={show.id}>
                        <td>{show.title}</td>
                        <td>{new Date(show.date).toLocaleDateString()}</td>
                        <td>{show.time}</td>
                        <td>{show.venue}</td>
                        <td>${show.price}</td>
                        <td>{show.available_seats} / {show.total_seats}</td>
                        <td>
                          <button
                            className="btn btn-small"
                            onClick={() => handleEdit(show)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-small btn-danger"
                            onClick={() => handleDelete(show.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="show-form">
              <h2>{editingShow ? 'Edit Show' : 'Add New Show'}</h2>
              {error && <div className="error-message">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Title:</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description:</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    rows="4"
                  />
                </div>
                <div className="form-group">
                  <label>Date:</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Time:</label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Venue:</label>
                  <input
                    type="text"
                    name="venue"
                    value={formData.venue}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Total Seats:</label>
                  <input
                    type="number"
                    name="total_seats"
                    value={formData.total_seats}
                    onChange={handleFormChange}
                    required
                    disabled={!!editingShow}
                  />
                </div>
                <div className="form-group">
                  <label>Price:</label>
                  <input
                    type="number"
                    step="0.01"
                    name="price"
                    value={formData.price}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Image URL:</label>
                  <input
                    type="url"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    {editingShow ? 'Update Show' : 'Create Show'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {activeTab === 'bookings' && (
        <div className="bookings-management">
          <h2>All Bookings</h2>
          <div className="bookings-table">
            <table>
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>User</th>
                  <th>Show</th>
                  <th>Date & Time</th>
                  <th>Seats</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Booking Date</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>{booking.id}</td>
                    <td>{booking.username} ({booking.email})</td>
                    <td>{booking.title}</td>
                    <td>
                      {new Date(booking.date).toLocaleDateString()}<br />
                      {booking.time}
                    </td>
                    <td>{booking.seats.join(', ')}</td>
                    <td>${parseFloat(booking.total_amount).toFixed(2)}</td>
                    <td className={`status ${booking.booking_status}`}>
                      {booking.booking_status}
                    </td>
                    <td>{new Date(booking.booking_date).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
