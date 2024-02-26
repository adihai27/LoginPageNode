// Importing all Libraies that we installed using npm
const express = require("express")
const app = express()
const bcrypt = require("bcrypt") // Importing bcrypt package
const passport = require("passport")
const initializePassport = require("./passport-config")
const flash = require("express-flash")
const session = require("express-session")
const methodOverride = require("method-override")
const mongoose = require("mongoose")
const User = require('./model/User')
const cookieParser = require('cookie-parser');


mongoose.connect(
    "mongodb+srv://admin:admin123456@cluster0.gsadonn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
).then(() => {
    app.listen(3000, () => {
        console.log("Connected and Listening on port 3000");
    })
}).catch((err) => {
    console.log(err);
});

initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
);



const users = []
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
    secret: "SECRET",
    resave: false, // We wont resave the session variable if nothing is changed
    saveUninitialized: false
}));

app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride("_method"))

// Configuring the register post functionality
// app.post("/login", checkNotAuthenticated, passport.authenticate("local", {
//     successRedirect: "/",
//     failureRedirect: "/login",
//     failureFlash: true
// }));

app.post('/login', checkNotAuthenticated, async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            res.cookie('userToken', user, { httpOnly: true , path:'/'});
            //res.status(200).send({user, token: user._id.toString()});
            console.log(req.cookies)
            //console.log('name - '+ res.cookie.toString());
            res.redirect("/")
        } else { }
    } catch (err) {
        console.log('err - ' + err);
        res.redirect("/login")
    }
})

// Configuring the register post functionality
app.post("/register", checkNotAuthenticated, async (req, res) => {

    try {
        const { name, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10)
        users.push({
            id: Date.now().toString(),
            name: name,
            email: email,
            password: hashedPassword,
        })
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();
        console.log(users); // Display newly registered in the console
        res.redirect("/login")

    } catch (e) {
        console.log(e);
        res.redirect("/register")
    }
});

// Routes
app.get('/', checkAuthenticated, (req, res) => {
    console.log('index- '+ req.cookies['userToken'].name )
    res.render("index.ejs", { name: req.cookies['userToken'].name })
});

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render("login.ejs")
});

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render("register.ejs")
});
// End Routes

app.delete("/logout", (req, res) => {
    req.logout(req.user, err => {
        res.clearCookie('userToken');
        if (err) {
            console.log('logout error');
            return next(err)
        }        
        
        console.log('logout and clear cookie');
        res.redirect("/")
    })
});

function checkAuthenticated(req, res, next) {
    console.log('checkAuthenticated');
    //const token = req.cookies['userToken'];

    if (req.cookies['userToken']) {
        console.log('next');
        return next()
    }
    
    res.redirect("/login")
};

function checkNotAuthenticated(req, res, next) {
    console.log('checkNotAuthenticated');
    if (req.cookies['userToken']) {
        return res.redirect("/")
    }
    next()
};
