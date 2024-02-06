require('dotenv').config()
const knex = require('knex')({
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      port : 5432,
      user : 'postgres',
      password : process.env.DB_PASS,
      database : 'afleurdepaudb'
    }
});

const bcrypt = require('bcrypt');

function deleteAccount (req, res) {
    const { email, password } = req.body;

    knex.select('email', 'hash').from('login')
        .where('email', '=', email)
        .then(data => {
            if (data.length === 0) {
                // Email not found 
                return res.status(400).json('User not found');
            }

            const hashedPassword = data[0].hash;

            bcrypt.compare(password, hashedPassword, (err, result) => {
                if (result) {
                    // Passwords match, fetch user details
                    // Delete user data from the 'login' table
                    knex('login')
                    .where('email', email)
                    .del()
                    .then(() => {
                        // Delete user data from the 'users' table
                        return knex('users').where('email', email).del();
                    })
                    .then((deletedRows) => {
                    if (deletedRows > 0) {
                        res.json('Your account was succesfully deleted');
                    } else {
                        // No users found with the specified email
                        res.status(404).json('No accounts found with the specified email');
                    }
                    })
                    .catch((error) => {
                    console.error(error);
                    res.status(500).json('Internal Server Error');
                    });
                } else {
                    // Passwords do not match
                    res.status(400).json('Invalid password');
                }
            });
        })
        .catch(err => res.status(400).json('Unable to log in'));
}
module.exports = {deleteAccount};