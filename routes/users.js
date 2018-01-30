const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');

const User = require('../models/user');

// Registration
router.post('/register', (req, res, next) => {
    //res.send('registration');
    let newUser = new User({
        name: req.body.name,
        email: req.body.email,
        username: req.body.username,
        password: req.body.password
    });

    User.addUser(newUser, (err, user) => {
        if(err){
            res.json({success: false, msg: 'Falied to register new user'});
        }else{
            res.json({success: true, msg: 'User registred'});
        }
    });
});

// Authendicate
router.post('/authendicate', (req, res, next) => {
    //res.send('authendicate');
    const username = req.body.username;
    const password = req.body.password;

    User.getUserByUsername(username, (err, user) => {
        if(err) throw err;
        if(!user){
            return res.json({success:false, msg: "User not found"});
        }

        User.ComparePassword(password, user.password, (err, isMatch) => {
            if(err) throw err;
            if(isMatch){
                //console.log(user);
                let userDetail = {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    username: username.username
                };
                const token = jwt.sign(userDetail, config.secret, { 
                    expiresIn: 604800 // 1 week
                });

                res.json({
                    success: true,
                    token: 'JWT '+token,
                    user: {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        username: username.username
                    }
                });
            }else{
                return res.json({success:false, msg: "Password not match"});
            }
        });
    });
});

// Profile
router.get('/profile', passport.authenticate('jwt', {session: false}), (req, res, next) => {
    //res.send('profile');
    res.json({user: req.user}); 
});
/*
router.post('/profile', passport.authenticate('jwt', { session: false }),
    function(req, res) {
        res.send(req.user);
    }
);
*/
module.exports = router;