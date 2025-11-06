const { pool } = require('../config/database');

const getAllShows = async (req, res) => {
  try {
    const [shows] = await pool.query(
      'SELECT * FROM shows ORDER BY date ASC, time ASC'
    );
    res.json(shows);
  } catch (error) {
    console.error('Get shows error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getShowById = async (req, res) => {
  try {
    const { id } = req.params;
    const [shows] = await pool.query('SELECT * FROM shows WHERE id = ?', [id]);

    if (shows.length === 0) {
      return res.status(404).json({ message: 'Show not found' });
    }

    res.json(shows[0]);
  } catch (error) {
    console.error('Get show error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createShow = async (req, res) => {
  try {
    const { title, description, date, time, venue, total_seats, price, image_url } = req.body;

    if (!title || !date || !time || !venue || !total_seats || !price) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    const [result] = await pool.query(
      'INSERT INTO shows (title, description, date, time, venue, total_seats, available_seats, price, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [title, description, date, time, venue, total_seats, total_seats, price, image_url]
    );

    // Create seats for the show
    const seatInsertions = [];
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const seatsPerRow = Math.ceil(total_seats / rows.length);

    let seatCount = 0;
    for (const row of rows) {
      for (let i = 1; i <= seatsPerRow && seatCount < total_seats; i++) {
        seatInsertions.push([result.insertId, `${row}${i}`, row]);
        seatCount++;
      }
    }

    if (seatInsertions.length > 0) {
      await pool.query(
        'INSERT INTO seats (show_id, seat_number, row_label) VALUES ?',
        [seatInsertions]
      );
    }

    res.status(201).json({
      message: 'Show created successfully',
      showId: result.insertId
    });
  } catch (error) {
    console.error('Create show error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateShow = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, date, time, venue, price, image_url } = req.body;

    const [result] = await pool.query(
      'UPDATE shows SET title = ?, description = ?, date = ?, time = ?, venue = ?, price = ?, image_url = ? WHERE id = ?',
      [title, description, date, time, venue, price, image_url, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Show not found' });
    }

    res.json({ message: 'Show updated successfully' });
  } catch (error) {
    console.error('Update show error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteShow = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query('DELETE FROM shows WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Show not found' });
    }

    res.json({ message: 'Show deleted successfully' });
  } catch (error) {
    console.error('Delete show error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getShowSeats = async (req, res) => {
  try {
    const { id } = req.params;

    const [seats] = await pool.query(
      'SELECT * FROM seats WHERE show_id = ? ORDER BY row_label, seat_number',
      [id]
    );

    res.json(seats);
  } catch (error) {
    console.error('Get seats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllShows,
  getShowById,
  createShow,
  updateShow,
  deleteShow,
  getShowSeats
};
