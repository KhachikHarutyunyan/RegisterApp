const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const config = require('./config/database');
const passport = require('passport');


mongoose.connect(config.database, {useNewUrlParser: true});
let db = mongoose.connection;

// check connection
db.once('open', () => {
    console.log('Connected to DB');
});

// check for DB errors
db.on('error', (err) => {
    console.log(err);
});

// init app
const app = express();

// bring in models
let Article = require('./models/article');

// load views Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Body Parser Middlware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Public folder
app.use(express.static(path.join(__dirname, 'public')));
// express-session middlware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
}));
// Express messages Middlware
app.use(require('connect-flash')());
app.use((req, res, next) => {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

// express Validator middlware
app.use(expressValidator({
    errorFormatter: (param, msg, value) => {
        let namespace = param.split('.'),
        root = namespace.shift(),
        formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));

// Passport Config
require('./config/passport')(passport);
// passport Middlware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', (req, res, next) => {
    res.locals.user = req.user || null;
    next();
});

app.get('/', (req, res) => {
    Article.find({}, (err, articles) => {
        if (err) {
            console.log(err);
        } else {
            res.render('index', {
                title: 'From title',
                articles: articles
            });
        }
        
    });
    
});

// Route Files
let articles = require('./routes/articles');
let users = require('./routes/users');
app.use('/articles', articles);
app.use('/users', users);


app.listen('3000', () => {
    console.log("Server is running 3000 port");
})
