var express = require('express');
var router = express.Router();

var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
// const axios = require('axios');
// const dotenv = require('dotenv').config();

// let token = process.env.STRAPI_BEARER;
let fixturesEditUser = "user";
let fixturesEditPass = "pass";

// const config = {
//   headers: { Authorization: `Bearer ${token}` }
// };

router.get('/', function(req, res, next) {
      var leagues = {
            "boysJuvenile":[            
                  {"name":"U12 Boys (A)", "id":"u12-boys-a"},
                  {"name":"U12 Boys (B)", "id":"u12-boys-b"},
                  {"name":"U14 Boys (A)", "id":"u14-boys-a"},
                  {"name":"U14 Boys (B)", "id":"u14-boys-b"},
                  {"name":"U16 Boys (A)", "id":"u16-boys-a"},
                  {"name":"U16 Boys (B)", "id":"u16-boys-b"},
                  {"name":"U18 Boys (A)", "id":"u18-boys-a"},
                  {"name":"U18 Boys (B)", "id":"u18-boys-b"}
            ],
            "girlsJuvenile":[            
                  {"name":"U12 Girls (A)", "id":"u12-girls-a"},
                  {"name":"U12 Girls (B)", "id":"u12-girls-b"},
                  {"name":"U14 Girls (A)", "id":"u14-girls-a"},
                  {"name":"U14 Girls (B)", "id":"u14-girls-b"},
                  {"name":"U16 Girls (A)", "id":"u16-girls-a"},
                  {"name":"U16 Girls (B)", "id":"u16-girls-b"},
                  {"name":"U18 Girls (A)", "id":"u18-girls-a"},
                  {"name":"U18 Girls (B)", "id":"u18-girls-b"},
            ],
            "senior":[            
                  {"name":"Senior Ladies", "id":"senior-ladies"},
                  {"name":"Senior Mens", "id":"senior-mens"},
                  {"name":"Ladies Masters", "id":"ladies-masters"},
                  {"name":"Mens Masters", "id":"mens-masters"}
            ]
      };

      res.render('fixtures-index', {leagues}); 
});

router.get('/:league', function(req, res, next) {

      let league = req.params.league;

      var fixtures = {
            "league": "U18 Boys (B)",
            "games": [
                  {
                        "date":"02/10/2022",
                        // "homeClub": "East Coast Cavaliers",
                        "homeTeam": "East Coast Cavaliers",
                        "homeScore": 49,
                        "awayTeam": "Streete Warriors",
                        "awayScore": 58,
                        "homeWin": homeScore > awayScore ? true :false,
                        "posted": true

                  },
                  {
                        "date":"09/10/2022",
                        // "homeClub": "East Coast Cavaliers",
                        "homeTeam": "East Coast Cavaliers",
                        "homeScore": 49,
                        "awayTeam": "Dunshaughlin Rockets B",
                        "awayScore": 11,
                        "homeWin": homeScore > awayScore ? true :false,
                        "posted": true
                  },
                  {
                        "date":"09/10/2022",
                        // "homeClub": "East Coast Cavaliers",
                        "homeTeam": "Blackwater Steelers",
                        "homeScore": 40,
                        "awayTeam": "Dynamites",
                        "awayScore": 36,
                        "homeWin": homeScore > awayScore ? true :false,
                        "posted": true
                  },
                  {
                        "date":"01/10/2022",
                        // "homeClub": "East Coast Cavaliers",
                        "homeTeam": "East Cavan Eagles",
                        "homeScore": 35,
                        "awayTeam": "Drogheda Arctic Wolves",
                        "awayScore": 96,
                        "homeWin": homeScore > awayScore ? true :false,
                        "posted": true
                  },
                  {
                        "date":"11/10/2022",
                        // "homeClub": "East Coast Cavaliers",
                        "homeTeam": "East Cavan Eagles",
                        "homeScore": 0,
                        "awayTeam": "Drogheda Wolves",
                        "awayScore": 0,
                        "homeWin": homeScore > awayScore ? true :false,
                        "posted": false

                  },
            ],
            "teams": [
                  "East Cavan Eagles",
                  "Drogheda Wolves",
                  "Drogheda Arctic Wolves",
                  "Dynamites",
                  "Blackwater Steelers",
                  "Dunshaughlin Rockets B",
                  "Streete Warriors",
                  "East Coast Cavaliers"
            ]
      }


      res.render('fixtures', {fixtures});
      // res.render('index');

});

//Temporary dummy user for testing
// var User = {"username":"user", "password":"pass"}

//Private route for in-place fixture editing
passport.use(new BasicStrategy(
      function(userid, password, done) {

            if (userid == fixturesEditUser && password == fixturesEditPass){
                  return done(null, true);
            }
            else {
                  return done(null, false);
            }
      }
));

router.get('/:league/edit', 
      passport.authenticate('basic', { session: false }),
      function(req, res) {

            let league = req.params.league;

            var fixtures = {
                  "league": "U18 Boys (B)",
                  "games": [
                        {
                              "id":"5",
                              "date":"02/10/2022",
                              "parsedDate": function(){
                                    let parts =this.date.split("/");
                                    return `${parts[2]}-${parts[1]}-${parts[0]}`
                              },
                              // "homeClub": "East Coast Cavaliers",
                              "homeTeam": "East Coast Cavaliers",
                              "homeScore": 49,
                              "homePoints": 1,
                              "awayTeam": "Streete Warriors",
                              "awayScore": 58,
                              "awayPoints": 3,
                              "posted": true
      
                        },
                        {
                              "id":"1",
                              "date":"09/10/2022",
                              "parsedDate": function(){
                                    let parts =this.date.split("/");
                                    return `${parts[2]}-${parts[1]}-${parts[0]}`
                              },
                              // "homeClub": "East Coast Cavaliers",
                              "homeTeam": "East Coast Cavaliers",
                              "homeScore": 49,
                              "homePoints": 3,
                              "awayTeam": "Dunshaughlin Rockets B",
                              "awayScore": 11,
                              "awayPoints": 1,
                              "posted": true
                        },
                        {
                              "id":"2",
                              "date":"09/10/2022",
                              "parsedDate": function(){
                                    let parts =this.date.split("/");
                                    return `${parts[2]}-${parts[1]}-${parts[0]}`
                              },
                              // "homeClub": "East Coast Cavaliers",
                              "homeTeam": "Blackwater Steelers",
                              "homeScore": 40,
                              "homePoints": 3,
                              "awayTeam": "Dynamites",
                              "awayScore": 36,
                              "awayPoints": 1,
                              "posted": true
                        },
                        {
                              "id":"3",
                              "date":"01/10/2022",
                              "parsedDate": function(){
                                    let parts =this.date.split("/");
                                    return `${parts[2]}-${parts[1]}-${parts[0]}`
                              },
                              // "homeClub": "East Coast Cavaliers",
                              "homeTeam": "East Cavan Eagles",
                              "homeScore": 35,
                              "homePoints": 1,
                              "awayTeam": "Drogheda Arctic Wolves",
                              "awayScore": 96,
                              "awayPoints": 3,
                              "posted": true
                        },
                        {
                              "id":"4",
                              "date":"11/10/2022",
                              "parsedDate": function(){
                                    let parts =this.date.split("/");
                                    return `${parts[2]}-${parts[1]}-${parts[0]}`
                              },
                              // "homeClub": "East Coast Cavaliers",
                              "homeTeam": "East Cavan Eagles",
                              "homeScore": 0,
                              "homePoints": 0,
                              "awayTeam": "Drogheda Wolves",
                              "awayScore": 0,
                              "awayPoints": 0,
                              "posted": false
      
                        },
                  ],
                  "teams": [
                        "East Cavan Eagles",
                        "Drogheda Wolves",
                        "Drogheda Arctic Wolves",
                        "Dynamites",
                        "Blackwater Steelers",
                        "Dunshaughlin Rockets B",
                        "Streete Warriors",
                        "East Coast Cavaliers"
                  ]
            }

            res.render('fixtures-edit', {fixtures});
      }
);


module.exports = router;
