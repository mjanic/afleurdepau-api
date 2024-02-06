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

function updateFavorites (req, res) {
    const { name, id } = req.body;
  
    knex('users')
      .select('favorites')
      .where('name', '=', name)
      .first() // Use first() to get a single user instead of an array
      .then(user => {
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
  
        // Toggle the favorite status
        const updatedFavorites = user.favorites.includes(id)
          ? user.favorites.filter(i => i !== id)
          : [...user.favorites, id];
  
        return knex('users')
          .where('name', '=', name)
          .update('favorites', updatedFavorites)
          .returning(['id', 'name', 'favorites']);
      })
      .then(updatedUser => {
        res.json(updatedUser[0]);
      })
      .catch(err => {
        console.error(err);
        res.status(500).json('Internal Server Error');
      });
}
module.exports = {updateFavorites};