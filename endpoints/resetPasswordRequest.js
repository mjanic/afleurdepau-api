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

const {sendPasswordResetEmail } = require('../nodemails');

function resetPasswordRequest (req, res) {
    const userEmail = req.body.email;
  
    // Check if the user with the provided email exists
    knex('login')
      .where('email', userEmail)
      .then((users) => {
        if (users.length === 0) {
          return res.status(400).json('User not found');
        }

        function generateToken() {
            return require('crypto').randomBytes(32).toString('hex');
          }
        const resetToken = generateToken();
  
        // Store the reset token in the database (you may want to set an expiration time)
        knex('login')
          .where('email', userEmail)
          .update({
            reset_token: resetToken,
          })
          .then(() => {
            // Send the password reset email
            sendPasswordResetEmail(userEmail, resetToken);
  
            res.json('Password reset email sent');
          })
          .catch((error) => {
            console.error(error);
            res.status(500).json('Internal Server Error');
          });
      })
      .catch((error) => {
        console.error(error);
        res.status(500).json('Internal Server Error');
      });
}   
module.exports = {resetPasswordRequest};