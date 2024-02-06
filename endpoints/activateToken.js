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


function activateToken (req, res) {
    const authenticationToken = req.params.token;
  
    // Find the user with the corresponding authentication token
    knex('login')
      .where('activation_token', authenticationToken)
      .then((users) => {
        if (users.length === 0) {
          return res.send('Invalid activation token.');
        }
  
        const userEmail = users[0].email;
  
        // Update the user to mark them as activated and clear the authentication token
        knex('login')
          .where('email', userEmail)
          .update({
            activated: true,
            activation_token: null,
          })
          .then(() => {
            // Redirect the user to the home page or perform other post-activation logic
            res.redirect('http://localhost:3000/activated');
          })
          .catch((error) => {
            console.error(error);
            res.status(500).send('Internal Server Error');
          });
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Internal Server Error');
      });
}
module.exports = {activateToken};