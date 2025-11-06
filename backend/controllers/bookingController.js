const { pool } = require('../config/database');

const createBooking = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { show_id, seat_ids } = req.body;
    const user_id = req.user.id;

    if (!show_id || !seat_ids || seat_ids.length === 0) {
      await connection.rollback();
      return res.status(400).json({ message: 'Show ID and seat IDs are required' });
    }

    // Check if seats are available
    const [seats] = await connection.query(
      'SELECT * FROM seats WHERE id IN (?) AND show_id = ? FOR UPDATE',
      [seat_ids, show_id]
    );

    if (seats.length !== seat_ids.length) {
      await connection.rollback();
      return res.status(400).json({ message: 'Some seats not found' });
    }

    const bookedSeats = seats.filter(seat => seat.is_booked);
    if (bookedSeats.length > 0) {
      await connection.rollback();
      return res.status(400).json({ 
        message: 'Some seats are already booked',
        bookedSeats: bookedSeats.map(s => s.seat_number)
      });
    }

    // Get show details for price
    const [shows] = await connection.query('SELECT * FROM shows WHERE id = ?', [show_id]);
    if (shows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Show not found' });
    }

    const show = shows[0];
    const total_amount = show.price * seat_ids.length;

    // Mark seats as booked
    await connection.query(
      'UPDATE seats SET is_booked = TRUE WHERE id IN (?)',
      [seat_ids]
    );

    // Update available seats count
    await connection.query(
      'UPDATE shows SET available_seats = available_seats - ? WHERE id = ?',
      [seat_ids.length, show_id]
    );

    // Create booking
    const [result] = await connection.query(
      'INSERT INTO bookings (user_id, show_id, seat_ids, total_amount) VALUES (?, ?, ?, ?)',
      [user_id, show_id, JSON.stringify(seat_ids), total_amount]
    );

    await connection.commit();

    res.status(201).json({
      message: 'Booking created successfully',
      bookingId: result.insertId,
      total_amount
    });
  } catch (error) {
    await connection.rollback();
    console.error('Booking error:', error);
    res.status(500).json({ message: 'Server error during booking' });
  } finally {
    connection.release();
  }
};

const getUserBookings = async (req, res) => {
  try {
    const user_id = req.user.id;

    const [bookings] = await pool.query(`
      SELECT b.*, s.title, s.date, s.time, s.venue
      FROM bookings b
      JOIN shows s ON b.show_id = s.id
      WHERE b.user_id = ?
      ORDER BY b.booking_date DESC
    `, [user_id]);

    // Parse seat_ids JSON for each booking
    const bookingsWithSeats = await Promise.all(bookings.map(async (booking) => {
      const seatIds = JSON.parse(booking.seat_ids);
      const [seats] = await pool.query(
        'SELECT seat_number FROM seats WHERE id IN (?)',
        [seatIds]
      );
      
      return {
        ...booking,
        seats: seats.map(s => s.seat_number)
      };
    }));

    res.json(bookingsWithSeats);
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllBookings = async (req, res) => {
  try {
    const [bookings] = await pool.query(`
      SELECT b.*, s.title, s.date, s.time, s.venue, u.username, u.email
      FROM bookings b
      JOIN shows s ON b.show_id = s.id
      JOIN users u ON b.user_id = u.id
      ORDER BY b.booking_date DESC
    `);

    const bookingsWithSeats = await Promise.all(bookings.map(async (booking) => {
      const seatIds = JSON.parse(booking.seat_ids);
      const [seats] = await pool.query(
        'SELECT seat_number FROM seats WHERE id IN (?)',
        [seatIds]
      );
      
      return {
        ...booking,
        seats: seats.map(s => s.seat_number)
      };
    }));

    res.json(bookingsWithSeats);
  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const cancelBooking = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const user_id = req.user.id;

    // Get booking details
    const [bookings] = await connection.query(
      'SELECT * FROM bookings WHERE id = ? AND user_id = ? FOR UPDATE',
      [id, user_id]
    );

    if (bookings.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Booking not found' });
    }

    const booking = bookings[0];

    if (booking.booking_status === 'cancelled') {
      await connection.rollback();
      return res.status(400).json({ message: 'Booking already cancelled' });
    }

    const seatIds = JSON.parse(booking.seat_ids);

    // Mark seats as available
    await connection.query(
      'UPDATE seats SET is_booked = FALSE WHERE id IN (?)',
      [seatIds]
    );

    // Update available seats count
    await connection.query(
      'UPDATE shows SET available_seats = available_seats + ? WHERE id = ?',
      [seatIds.length, booking.show_id]
    );

    // Update booking status
    await connection.query(
      'UPDATE bookings SET booking_status = ? WHERE id = ?',
      ['cancelled', id]
    );

    await connection.commit();

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Cancel booking error:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    connection.release();
  }
};

module.exports = {
  createBooking,
  getUserBookings,
  getAllBookings,
  cancelBooking
};
