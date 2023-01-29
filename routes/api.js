// Collection of routes that are used for serving transformed
// data from the CMS in the form of JSON objects.
// Almost every route here will just be piping the output of
// a function used for rendering pages into a response to GET
var express = require('express');
var router = express.Router();
const nebb = require("../modules/fixturesManagement")
const dotenv = require('dotenv').config();

// 
router.get('/fixtures/:league', function(req, res, next) {

    let leagueURL = req.params.league;
    Promise.resolve(nebb.getLeagueObject(leagueURL))
    .then((league) => {
        // We don't need to verify that the fixtures object actually exists 
        // because this shouldn't be called except from a pregenerated link 
        //console.log(league);
        res.json(league)
    })

});

// Take the output of the getLeagues function and return it as a 
// JSON object to the requester
router.get('/leagues', function(req, res, next) {

    Promise.resolve(nebb.getLeagues())
    .then((leagues) => {
        res.json(leagues)
    })

});

// Take the absolute address of the CMS from env and return it
// Allows the management portal to connect to the CMS directly
// instead of using the express server as a middleman
router.get('/appinfo', function(req, res, next) {

    let appinfo = {
        "cms": process.env.STRAPI
    }

    res.json(appinfo)

});

module.exports = router;