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

function signIn (req, res) {
    const { email, password } = req.body;
    knex.select('email', 'hash', 'activated').from('login')
        .where('email', '=', email)
        .then(data => {
            if (data.length === 0 || data[0].activated === false) {
                // Email not found or not activated
                return res.status(400).json('Invalid email or password or account not activated');
            }

            const hashedPassword = data[0].hash;

            bcrypt.compare(password, hashedPassword, (err, result) => {
                if (result) {
                    // Passwords match add session and fetch user details
                    req.session.email = email;

                    knex.select('*').from('users')
                        .where('email', '=', email)
                        .then(user => {
                            res.json(user[0]);
                        })
                        .catch(err => res.status(400).json('Unable to log in'));
                } else {
                    // Passwords do not match
                    res.status(400).json('Invalid email or password');
                }
            });
        })
        .catch(err => res.status(400).json('Unable to log in'));
}
module.exports = {signIn};