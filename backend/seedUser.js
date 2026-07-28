// backend/seedUser.js
require('dotenv').config();
const bcrypt = require('bcrypt'); // Standard library for hashing passwords
const pool = require('./db/pool'); // Using the pool from your server.js setup

async function createAdminUser() {
    // You can change these credentials to whatever you prefer
    const email = 'vihaan@dorkbox.com';
    const plainPassword = 'password123';

    try {
        console.log('Hashing password...');
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

        console.log('Inserting user into the database...');
        // Adjust 'users', 'email', and 'password' if your table schema is different
        await pool.query(
            'INSERT INTO users (email, password_hash) VALUES ($1, $2)',
            [email, hashedPassword]
        );

        console.log(`✅ Success! User ${email} has been created.`);
    } catch (err) {
        console.error('❌ Error creating user:', err.message);
    } finally {
        // Close the database connection so the script exits
        pool.end(); 
    }
}

createAdminUser();
