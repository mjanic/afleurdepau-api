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
const saltRounds = 10;

const { sendConfirmationEmail} = require('../nodemails');

function register (req, res) {
    const {email, name, password} = req.body;

    bcrypt.genSalt(saltRounds, function(err, salt) {
        bcrypt.hash(password, salt, function(err, hash) {
            if (!err) {
                
                function generateToken() {
                    return require('crypto').randomBytes(32).toString('hex');
                }
                const activationToken = generateToken();
                sendConfirmationEmail(email, activationToken);

                knex.transaction(trx => {
                    trx.insert({
                        hash: hash,
                        email: email,
                        activation_token: activationToken
                    })
                    .into('login')
                    .returning('email')
                    .then(loginEmail => {
                        return trx('users')
                        .returning('*')
                        .insert({
                            email: loginEmail[0].email,
                            name: name,
                            joined: new Date(),
                            favorites: []
                        })
                        .then(user => {
                            res.json(user[0]);
                        })
                    })
                    .then(trx.commit)
                    .catch(trx.rollback)
                })
                .catch(err => res.status(400).json('unable to register'))
            } else {
                res.status(400).json('unable to register');
            }
        });
    });
}
module.exports = {register};