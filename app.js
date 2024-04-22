const express = require("express");

const bodyParser = require("body-parser");

const mongoose = require("mongoose");

const bcrypt = require('bcrypt');
const saltRounds = 10;

const app = express();


mongoose.connect('mongodb+srv://alson1209:blackassasin12@cluster0.ay6lplz.mongodb.net/Cluster0' );

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

const mySchema = new mongoose.Schema({
    item: String
});

const mySchema2 = new mongoose.Schema({
    email: String,
    password: String
});

const Mymodel = mongoose.model('Item', mySchema);

const Mymodel2 = mongoose.model('user', mySchema2);

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/list", async (req, res) => {

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

app.post("/signup", (req, res) => {
    // Check if both email and password fields are provided
    if (!req.body.email || !req.body.password) {
        return res.status(400).send("Email and password are required.");
    }

    bcrypt.hash(req.body.password, saltRounds, async function(err, hash) {
        if (err) {
            console.error("Error hashing password:", err);
            return res.status(500).send("Internal Server Error");
        }
               
        let newUser = new Mymodel2({
            email: req.body.email,
            password: hash
        });
    
        try {
            await newUser.save();
            res.redirect("/list");
        } catch (error) {
            console.error("Error saving user:", error);
            res.status(500).send("Internal Server Error");
        }
    });
});

app.post("/signin", async (req, res) => {
    const checkEmail = req.body.email;
    const checkPassword = req.body.password;

    // Check if email or password is missing
    if (!checkEmail || !checkPassword) {
        return res.status(400).send("Email and password are required.");
    }

    try {
        const foundNewUser = await Mymodel2.findOne({ email: checkEmail });

        // Check if user with the provided email exists
        if (!foundNewUser) {
            return res.status(404).send("User not found.");
        }

        bcrypt.compare(checkPassword, foundNewUser.password, function(err, result) {
            if (result === true) {
                res.redirect("/list");
            } else {
                res.status(401).send("Incorrect password.");
            }
        });

    } catch (error) {
        console.log("error is :" + error);
        res.status(500).send("Internal server error.");
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

const session = require('express-session');

app.use(session({
    secret: '44Rx8eLKuL',
    resave: false,
    saveUninitialized: false
}));

app.get("/logout", (req, res) => {
    req.session.destroy(); // Destroy the session
    res.redirect("/signin");
});



const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log("server is listening to port 5000.");
});

