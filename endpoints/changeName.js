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

function changeName (req, res) {
    const { name, newName } = req.body;

    knex('users')
        .where('name', '=', newName)
        .first()
        .then(existingUserWithNewName => {
            if (existingUserWithNewName) {
                return res.status(400).json({ error: 'New name already exists' });
            } else {
            return knex('users')
            .where('name', '=', name)
            .update('name', newName)
            .returning(['id', 'name', 'favorites'])
            .then(updatedUser => {
                if (updatedUser.length === 0) {
                    return res.status(404).json({ error: 'User not found' });
                }
                res.json(updatedUser[0]);
            })
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).json('Internal Server Error');
        });
}
module.exports = {changeName};