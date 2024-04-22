const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const User = require("./models/userModel");
const session = require('express-session');

const saltRounds = 10;

const requireLogin = (req, res, next) => {
    if (req.session && req.session.user) {
        next();
    } else {
        req.session.message = {
            type: 'danger',
            message: 'You must be logged in to view this page',
        };
        res.redirect('/');
    }
};

const app = express();
app.use(session({
    secret: '44Rx8eLKuL',
    resave: false,
    saveUninitialized: false
}));

mongoose.connect('mongodb+srv://alson1209:blackassasin12@cluster0.ay6lplz.mongodb.net/Cluster0' );

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

const mySchema = new mongoose.Schema({
    item: String
});

const Mymodel = mongoose.model('Item', mySchema);

app.get("/", (req, res) => {
    res.render("signin");
});

app.get("/list", requireLogin, async (req, res) => {

    var date = new Date();
    var day = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var currday = day[date.getDay()];
    var mm = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var currmm = mm[date.getMonth()];
    var dd = date.getDate();
    
    if (dd < 10) {
        dd = '0' + dd;
    }

    var currDate = currday + ", " + currmm + " " + dd;

    let foundItem = await Mymodel.find({});
    res.render('list', {
        date: currDate,
        newItem: foundItem
    });
});


app.get("/signin", (req, res) => {
    res.render("signin");
});

app.get("/signup", (req, res) => {
    res.render("signup");
});

app.post('/signup', async (req, res) => {
    const {email, password} = req.body;

    try {
        const existingUser = await User.findOne({email});
        if(existingUser) return res.status(400).json({error: 'Username is already taken.'});
    
        const user = new User({email, password});
        const savedUser = await user.save();
    
        req.session.user = savedUser;
        return res.redirect('/list');
    } catch (err) {
        res.status(500).json({error: 'Server error, please try again.'});
    }
});

app.post("/signin", async (req, res) => {
    try {
        const user = await User.collection.findOne({email: req.body.email});
        if(!user) return res.status(400).send("Username not found!");
        if(user.password !== req.body.password) return res.status(400).send("Wrong password!");

        req.session.user = user;
        return res.redirect("/list");
    } catch(e) {
        console.log(e);
        res.status(500).send("Error Occurred!");
    }
});

app.post("/list", async (req, res) => {

    let itemData = new Mymodel({
        item: req.body.item
    });

    await itemData.save();

    res.redirect("/list");

});

app.post("/delete", async (req, res) => {

    const checkedItem = req.body.delete;

    await Mymodel.findByIdAndRemove(checkedItem);

    console.log("successfully deleted the item");

    res.redirect("/list");

});

app.post("/update/:id", async (req, res) => {
    const itemId = req.params.id;
    const newItemText = req.body.updatedItem;
  
    try {
        await Mymodel.findByIdAndUpdate(itemId, { item: newItemText });
        console.log("Successfully updated the item");
        res.redirect("/list");
    } catch (error) {
        console.error("Error updating item:", error);
        res.status(500).send("Error updating item");
    }

});

app.get('/logout', (req, res) => {
    req.session.destroy(function(err) {
        if (err) {
            return res.redirect('/signin');
        }
        res.clearCookie('connect.sid');
        res.redirect('/');
    })
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log("server is listening to port 5000.");
});

