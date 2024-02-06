require('dotenv').config()
const express = require('express');

const app = express();

const cors = require('cors');
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001"],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({extended: true}));

/*const cookieParser = require('cookie-parser');
app.use(cookieParser);*/

const session = require('express-session');

const KnexSessionStore = require('connect-session-knex')(session);

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

const store = new KnexSessionStore({
  knex,
  tablename: 'sessions', // optional. Defaults to 'sessions'
});


app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  store,
  cookie: {
    maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days in milliseconds
  },
}));


const {changeName} = require('./endpoints/changeName')
app.put('/changename', changeName);

const {updateFavorites} = require('./endpoints/updateFavorites')
app.put('/updatefavorites', updateFavorites);

const {resetPasswordRequest} = require('./endpoints/resetPasswordRequest')
app.post('/reset-password-request', resetPasswordRequest);

const {resetPasswordWithToken} = require('./endpoints/resetPasswordWithToken')
app.post('/reset-password/:token', resetPasswordWithToken);
  
const {signIn} = require('./endpoints/signIn')
app.post('/signin', signIn);

const {activateToken} = require('./endpoints/activateToken')
app.get('/activate/:token', activateToken);

const {register} = require('./endpoints/register')
app.post('/register', register);

const {deleteAccount} = require('./endpoints/deleteAccount')
app.delete('/delete-account', deleteAccount); 


app.get('/check-session', (req, res) => {
  const userEmail = req.session.email;
  if (userEmail) {
    knex.select('*').from('users')
    .where('email', '=', userEmail)
    .then(user => {
        res.json(user[0]);
    })
    .catch(err => res.status(400).json('Unable to fetch user'));
  }
})

app.post('/logout', (req, res) => {
  req.session && (req.session.email = null);
  res.json('Logged out successfully');
});


app.listen(3001, ()=>{
  console.log("app is very much running on port 3001");
})