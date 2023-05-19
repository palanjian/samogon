if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

//imports express
const express = require('express')
const app = express()
var path = require('path')
const bcrypt = require('bcrypt') //allows us to hash passwords & compare hashed passwords
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

const users = [
    { id: '1', username: 'palanjian', password: 'password' },
    { id: '2', username: 'naijnalap', password: 'drowssap' },
  ]


const initializePassport = require('./passport-config')
initializePassport(
    passport,
    username => users.find(user => user.username === username),
    id => users.find(user => user.id === id)
)


app.use(express.static(__dirname + '/public')) //allows us to serve CSS

//instance variable that will store our users
//TODO: integrate MONGODB, this is just for testing 

app.set('view-engine', 'ejs')

//to use the info from the login form in the req through our post method
app.use(express.urlencoded({extended: false}))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.get('/', (req, res) => {
    res.render('login.ejs') 
})

app.get('/home', checkAuthenticated, (req, res) =>{
    res.render('index.ejs', { name: req.user.username})
})

app.post('/login', passport.authenticate('local', { //local strategy
    successRedirect: '/home', //where do we go if there's a success
    failureRedirect: '/', //where do we go if there's a failure
    failureFlash: true //allows us to have a flash message on error
}))

app.delete('/logout', function(req, res, next) {
    req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

function checkAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect('/')
}

//can add checkNotAuthenticated if dont want user to return to login
app.listen(3000)
