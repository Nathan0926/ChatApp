// const mongoose = require("express").Router();
const router = require("express").Router();

const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');

// import middleware(?)

const userSchema = require("../models/User");
// const roomSchema = require("..models/Room");
// const messageSchema = require("..models/Message");

// POST Create user
router.route("/register").post(async (req, res, next) => { // let password = req.body.password;
    req.body.password = await bcrypt.hash(req.body.password, 10);

    // console.log(req.body);

    await userSchema.create(req.body).then((newUser) => {
        const payload = {
            userId: newUser._id,
            username: newUser.username
        };

        let token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });

        res.cookie("token", token, {
            withCredentials: true,
            httpOnly: false
        });

        // console.log(`TOKEN ${token}`);
        // cookie

        res.json({ user: newUser });
    }).catch((error) => { // console.log(error.message)
        res.json({ error: error.message })
        // console.log("register error " + error.message);
        return next(error.message);
    });
    // res.send("register")
});

// Post User Login
router.route("/login").post(async (req, res, next) => {
    const { username, password } = req.body;

    await userSchema
        .findOne({ username: username })
        .then((user) => {
            if (!user) {
                return res.status(401).json({ message: "Incorrect username or password" });
            }

            const passwordCorrect = bcrypt.compareSync(req.body.password, user.password);

            //pasword doesnt match
            if (!passwordCorrect) {
                return res.status(401).json({ message: "Incorrect username or password " });
            }

            const payload = { userId: user._id, username: user.username };

            let token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: "1d",
            });

            //console.log(token);

            //cookie
            res.cookie("token", token, {
                withcredentials: true,
                httpOnly: false,
            });
            res.json({ user });
        })
        .catch((error) => {
            console.log("login Error " + error.message);
            return next(error);
        });
    //res.send("login")
});
// // POST USER Logout (remove token from cookie)
//router.route("/login").post(async (req, res, next)=>{
// res.send("logout");
// })

module.exports = router;

