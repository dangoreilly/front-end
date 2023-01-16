// Collection of routes that are used for serving transformed
// data from the CMS in the form of JSON objects.
// Almost every route here will just be piping the output of
// a function used for rendering pages into a response to GET
var express = require('express');
var router = express.Router();
const nebb = require("../modules/fixturesManagement")

// 
router.get('/fixtures/:league', function(req, res, next) {

    let leagueURL = req.params.league;
    Promise.resolve(nebb.getLeagueObject(leagueURL))
    .then((league) => {
          // We don't need to verify that the fixtures object actually exists 
          // because this shouldn't be called except from a pregenerated link 
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

module.exports = router;