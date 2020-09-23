const User = require("../models/user");
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');
const { check, validationResult } = require('express-validator');

//Adding entry to db
exports.signup = (req, res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({
            error: errors.array()[0].msg,
            param: errors.array()[0].param
        })
    }
    const user = new User(req.body);
    user.save((err, user) => {
        if(err){
            return res.status(400).json({
                err: "NOT able to save user in db"
            })
        }
        res.json({
            name: user.name,
            email: user.email,
            id: user._id
        });
    }); //Saving entry to db
};

exports.signin = (req, res)=>{
    const errors = validationResult(req);
    const {email, password} = req.body;
    if(!errors.isEmpty()){
        return res.status(400).json({
            error: errors.array()[0].msg,
            param: errors.array()[0].param
        })
    }

    User.findOne({email}, (err, user)=> {
        if(err || !user){
            return res.status(400).json({
                error: "USER email does not exists"
            })
        }
        //Authentication fails. Password invalid
        if(!user.authenticate(password)){
            return res.status(400).json({
                error: "Invalid email or password"
            })
        }
        //create a token
        const token = jwt.sign({_id: user._id}, process.env.SECRET);
        //put token in cookie
        res.cookie("token", token, {expire: new Date()+ 999});
        //send response to FE
        const {_id, name, email, role} = user;
        
        return res.json({token, user: {_id, name, email, role}})

    })
};


exports.signOut = (req,res)=>{
    res.clearCookie("token");
    res.json({
        message: "User Signout successful"
    })
};


//Protected routes
exports.isSignedIn = expressJwt({
    secret: process.env.SECRET,
    userProperty: "auth"
});

//Custom middlewares (res.profile)-> is coming from frontend.
exports.isAuthenticated = (req, res, next) => {
    let checker = req.profile && req.auth && req.profile._id == req.auth._id;
    if(!checker){
        return res.status(403).json({
            error: "ACCESS DENIED"
        })
    }
    next();
}

exports.isAdmin = (req, res, next) => {
    if(req.profile.role === 0){
        return res.status(403).json({
            error: "You are not ADMIN, ACCESS DENIED"
        })
    }
    next();
}