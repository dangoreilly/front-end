var express = require('express');
var router = express.Router();

var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
const axios = require('axios');
const { resource } = require('../app');
const dotenv = require('dotenv').config();

const nebb = require('../modules/fixturesManagement.js');

let token = process.env.STRAPI_BEARER;
let auth_path = process.env.STRAPI + "/api/auth/local";


//////////////////////////////////
/*
//For testing rendering
let test_fixtures = {
      "league": "U18 Boys (B)",
      "games": [
            {
                  "date":"02/10/2022",
                  // "homeClub": "East Coast Cavaliers",
                  "homeTeam": "East Coast Cavaliers",
                  "homeScore": 49,
                  "awayTeam": "Streete Warriors",
                  "awayScore": 58,
                  "homeWin": function(){return (this.homeScore > this.awayScore)},
                  "posted": true

            },
            {
                  "date":"09/10/2022",
                  // "homeClub": "East Coast Cavaliers",
                  "homeTeam": "East Coast Cavaliers",
                  "homeScore": 49,
                  "awayTeam": "Dunshaughlin Rockets B",
                  "awayScore": 11,
                  "homeWin": function(){return (this.homeScore > this.awayScore)},
                  "posted": true
            },
            {
                  "date":"09/10/2022",
                  // "homeClub": "East Coast Cavaliers",
                  "homeTeam": "Blackwater Steelers",
                  "homeScore": 40,
                  "awayTeam": "Dynamites",
                  "awayScore": 36,
                  "homeWin": function(){return (this.homeScore > this.awayScore)},
                  "posted": true
            },
            {
                  "date":"01/10/2022",
                  // "homeClub": "East Coast Cavaliers",
                  "homeTeam": "East Cavan Eagles",
                  "homeScore": 35,
                  "awayTeam": "Drogheda Arctic Wolves",
                  "awayScore": 96,
                  "homeWin": function(){return (this.homeScore > this.awayScore)},
                  "posted": true
            },
            {
                  "date":"11/10/2022",
                  // "homeClub": "East Coast Cavaliers",
                  "homeTeam": "East Cavan Eagles",
                  "homeScore": 0,
                  "awayTeam": "Drogheda Wolves",
                  "awayScore": 0,
                  "homeWin": function(){return (this.homeScore > this.awayScore)},
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
var test_leagues = {
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
*/
//////////////////////////////////

// const config = {
//   headers: { Authorization: `Bearer ${token}` }
// };

router.get('/', function(req, res, next) {
      
      // Separate them into our three groupings
      // Manually for now, because we have a preferred render order that is nontrivial to 
      // define programmatically: Girls, Boys, Senior
      let leagues = {
            girlsJuvenile: [],
            boysJuvenile: [],
            senior: []
      }

      // Grab the list of leagues
      Promise.resolve(nebb.getLeagues())
      .then((_leagues) => {

            _leagues.leagues.forEach(lg => {

                              if(lg.grouping == "Juvenile Girls")
                                    leagues.girlsJuvenile.push(lg);
                              else if(lg.grouping == "Juvenile Boys")
                                    leagues.boysJuvenile.push(lg);
                              else if(lg.grouping == "Senior")
                                    leagues.senior.push(lg);
                        });


                        res.render('fixtures-index', {leagues});

      })

});

// Route for fixtures secretary to manage fixtures
router.get('/edit/', function(req, res) {

            // console.log(req.cookies);
            let user_jwt = "";

            //Check the user doesn't already have a cookie 
            if (req.cookies.nebb_jwt_token){
                  user_jwt = req.cookies.nebb_jwt_token;
            }
            else {
                  //If they don't have a cookie, then send them to strapi for login
                  console.log(`Redirecting to ${process.env.STRAPI + "/api/connect/google"}`)
                  res.redirect(process.env.STRAPI + "/api/connect/google");
                  return 200;
            }
            // Prepare the edit page to send
            // We're not rendering this one, because rendering it client side with Vue
            // is more powerful, and we don't care about SEO on this page
            fileName = "fixtures-edit-vue.html";
            options = { root: "public/pages"};

            // And send the page
            res.sendFile(fileName, options, function (err) {
                  if (err) {
                        next(err);
                  }
                  });
            
      }
);

// Standard route for viewing fixtures
router.get('/:league', function(req, res, next) {

      let leagueURL = req.params.league;

      let _league = Promise.resolve(nebb.getLeagueObject(leagueURL))
      .then((fixtures) => {

            // console.log(league);
        
            if (fixtures.success){

                  res.render('fixtures', {fixtures});

            }
            else {
                  res.render('error-leaguenotfound', {contactMail: "info@nebb.ie"});
            }    

      })
      

});

//Private route for in-place fixture editing
passport.use(new BasicStrategy(
      function(userid, password, done) {

            // Temporary hardcoded credentials to save effort
            // of typing them in every time while testing CRUD interface
            userid = "fixtures@nebb.ie";
            password = "password1";

            //Otherwise, talk to Strapi and see if this user is allowed see this screen
            axios
            .post(auth_path, {
            "identifier": userid,
            "password": password,
            })
            .then(response => {
                  // Handle success.
                  // Return to the router the JWT (as 'user' string) 
                  return done(null, response.data.jwt);
            })
            .catch(error => {
                  // Handle error.
                  // No need to be graceful, this isn't public facing
                  return done(null, false);
            });

      }
));



module.exports = router;
