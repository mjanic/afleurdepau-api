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

function resetPasswordWithToken (req, res) {
    const resetToken = req.params.token;
    const newPassword = req.body.newPassword;
  
    // Check if the reset token is valid (you may want to check expiration time)
    knex('login')
      .where('reset_token', resetToken)
      .then((users) => {
        if (users.length === 0) {
          return res.status(400).json('Invalid reset token');
        }
  
        const userEmail = users[0].email;
  
        // Hash the new password
        bcrypt.genSalt(10, function (err, salt) {
          bcrypt.hash(newPassword, salt, function (err, hashedPassword) {
            if (err) {
              console.error(err);
              return res.status(500).json('Internal Server Error');
            }
  
            // Update the user's hashed password and clear the reset token
            knex('login')
              .where('email', userEmail)
              .update({
                hash: hashedPassword,
                reset_token: null,
              })
              .then(() => {
                res.json('Password reset successful');
              })
              .catch((error) => {
                console.error(error);
                res.status(500).json('Internal Server Error');
              });
          });
        });
      })
      .catch((error) => {
        console.error(error);
        res.status(500).json('Internal Server Error');
      });
}
module.exports = {resetPasswordWithToken};