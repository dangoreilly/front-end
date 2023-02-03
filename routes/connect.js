var express = require('express');
var router = express.Router();

const axios = require("axios")
var qs = require('qs');
const dotenv = require('dotenv').config();
// Collection of routes to handle different auth strategies
let strapi_google_path = process.env.STRAPI + "/api/auth/google/callback";

// Route for Google Auth
router.get('/google/redirect', function(req, res) {

    // First we need to get the full query in string form
    // let queryString = qs.stringify(req.query)
    // console.log(`access_token: ${req.query.access_token}`)

    // This is then used to get the user profile from Strapi, if one exists
    console.log("Getting", strapi_google_path + "?access_token=" + req.query.access_token)
    axios
    .get(strapi_google_path + "?access_token=" + req.query.access_token,
        {headers: { "Accept-Encoding": "gzip,deflate,compress", "Accept": "*/*"} })
    .then(response => {
        // If the user logs in, give them a cookie and send them back to the fixtures edit
        if (response.data.jwt){
            res.cookie("nebb_jwt_token", response.data.jwt);    
            res.redirect("/fixtures/edit");
        }
        else {
            // If the user isn't found, send them to the no-access screen
            console.log("User not found")
            // console.log(response.data);
            res.redirect("/connect/accessforbidden");
        }
    })
    .catch(error => {
            // Handle error.
            // No need to be graceful, this isn't public facing
            console.log("ERROR")
            // console.log(error)
    });
    
});

router.get('/accessforbidden', function(req, res) {
    //Generic no-access page.
    res.render("error-noaccess");
});

module.exports = router;