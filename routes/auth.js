
var express = require("express");
var router = express.Router();
const { check, validationResult } = require('express-validator');
const {signOut, signup, signin, isSignedIn} = require("../controllers/auth");

//Post request are not viewed through browser. Can be checked through postman
router.post("/signup", [
    check("name").isLength({min: 3}).withMessage("Name should be atleast 3"),   //Validation check
    check("email").isEmail().withMessage("Enter valid email address"),
    check("password").isLength({min: 6}).withMessage("Password should be atleast 6 char.")
], signup);

router.post("/signin", [
    check("email").isEmail().withMessage("Enter valid email address"),
    check("password").isLength({min: 1}).withMessage("Password is required.")
], signin);

router.get("/signout", signOut);

router.get("/testroute", isSignedIn, (req, res)=>{
    res.json(req.auth);
});

//Exporting the route
module.exports = router;