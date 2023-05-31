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
const mongoose = require('mongoose')
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

//database intitalization
const databaseURI = process.env.DATABASE_URI
const User = require('./models/userdata')
mongoose.connect(databaseURI, {useNewUrlParser: true, useUnifiedTopology:true })
    .then((result) => {
        console.log('Connected to mongoDB database')
        app.listen(3000)
    } )
    .catch((err) => console.log(err))

app.use(express.static(__dirname + '/public')) //allows us to serve CSS


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

app.get('/', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs', {error: ''}) 
})

app.get('/register', checkNotAuthenticated, (req, res) =>{
    res.render('register.ejs')
})

app.get('/home', checkAuthenticated, (req, res) =>{
    res.render('index.ejs', { name: req.user.username})
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', { //local strategy
    successRedirect: '/home', //where do we go if there's a success
    failureRedirect: '/', //where do we go if there's a failure
    failureFlash: true //allows us to have a flash message on error
}))

app.post('/register', checkNotAuthenticated, (req, res) =>{
    try{
        //change to hashed password on official version, ensure no two users share an email, ensure no incorrect characters, if they do send an error message
        //send a confirmation email?
        const pass = req.body.password;
        const email = req.body.email.strip()
        const username = req.body.username.strip()

        //working?
        if(!pass || !email || !username){
            console.log('Invalid credentials')
            res.redirect('/register')
        }

        const user = new User({
            email: email,
            username: username,
            password: pass
        })
        user.save() //catch any exceptions here
        res.redirect('/')
    }
    catch{
        res.redirect('/')
    }
})

app.delete('/logout', checkAuthenticated, function(req, res, next) {
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
function checkNotAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return res.redirect('/home')
    }
    next()
}


//boilerplate "add to db " functionality
/* app.get('/add-user', (req, res) => {
    const user = new User({
        email: 'me@palanjian.com',
        username: 'palanjian',
        password: 'password'
    })

    user.save()
        .then((result) => {
            res.send(result)
        })
        .catch((err) => {
            console.log(err)
        })
}) */
