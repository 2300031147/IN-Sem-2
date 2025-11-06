import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { showService } from '../services';

function Home() {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadShows();
  }, []);

  const loadShows = async () => {
    try {
      const data = await showService.getAllShows();
      setShows(data);
    } catch (err) {
      setError('Failed to load shows');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = (showId) => {
    navigate(`/booking/${showId}`);
  };

  if (loading) return <div className="loading">Loading shows...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="home-container">
      <h1>Available Shows</h1>
      <div className="shows-grid">
        {shows.length === 0 ? (
          <p>No shows available at the moment.</p>
        ) : (
          shows.map((show) => (
            <div key={show.id} className="show-card">
              {show.image_url && (
                <img src={show.image_url} alt={show.title} className="show-image" />
              )}
              <div className="show-content">
                <h3>{show.title}</h3>
                <p className="show-description">{show.description}</p>
                <div className="show-details">
                  <p><strong>Date:</strong> {new Date(show.date).toLocaleDateString()}</p>
                  <p><strong>Time:</strong> {show.time}</p>
                  <p><strong>Venue:</strong> {show.venue}</p>
                  <p><strong>Price:</strong> ${show.price}</p>
                  <p><strong>Available Seats:</strong> {show.available_seats} / {show.total_seats}</p>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => handleBookNow(show.id)}
                  disabled={show.available_seats === 0}
                >
                  {show.available_seats === 0 ? 'Sold Out' : 'Book Now'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Home;
