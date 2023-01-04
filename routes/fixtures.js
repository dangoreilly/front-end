var express = require('express');
var router = express.Router();

var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
const axios = require('axios');
const { resource } = require('../app');
const dotenv = require('dotenv').config();

let token = process.env.STRAPI_BEARER;
let fixturesEditUser = "user"; //process.env.FIXTURES_EDIT_USER;
let fixturesEditPass = "pass";//process.env.FIXTURES_EDIT_PASS;
let auth_path = process.env.STRAPI + "api/auth/local";

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

      let leagueURL = req.params.league;

      let __fixtures = {
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

      let _fixtures = Promise.resolve(getFixtures(leagueURL));
      let _teams = Promise.resolve(getTeams(leagueURL));

      // fixtures.then((_fix) => {
      //       // console.log("fixtures:")
      //       console.log(_fix);

      //       res.render('fixtures', {_fixtures});
      // });
      // res.render('index');

      Promise.all([_fixtures, _teams]).then((resolvedPromises) =>{
            let f = resolvedPromises[0];
            let t = resolvedPromises[1];

            let fixtures = {
                  "league": f.league,
                  "games": f.games,
                  "teams": t
            }
            res.render('fixtures', {fixtures});
      });

});

//Temporary dummy user for testing
// var User = {"username":"user", "password":"pass"}

//Private route for in-place fixture editing
passport.use(new BasicStrategy(
      function(userid, password, done) {

            // If we're in a dev enviroment, can just skip auth
            // Unless Auth is thing being developed, ofc
            // if (req.app.get('env') === 'development')
            //       return done(null, true);

            // If Auth is thing being developed, then hardcode some credentials to save effort
            // of typing them in every time
            _userid = "fixtures@nebb.ie";
            _password = "password1";

            //Otherwise, talk to Strapi and see if this user is allowed see this screen
            axios
            .post(auth_path, {
            "identifier": _userid,
            "password": _password,
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

router.get('/edit/:league', 
      passport.authenticate('basic', { session: false }),
      function(req, res) {

            let league = req.params.league;
            let user_jwt = req.user;
            

            let fixtures = {
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

            res.render('fixtures-edit', {fixtures, user_jwt});
      }
);

async function getTeams(leagueURL){
      // Function that sends a GET request to the server
      // GETs all Teams related to leagueURL
      // Returns array of all matching teams, and 'Success' flag
      // Success = true if array size is greater than 0

      let requestAddress =  process.env.STRAPI + `api/leagues?filters[url][$eq]=${leagueURL}&populate[teams]=*`

      try{
            // Use the requestAddress to get team list from CMS
            var response = await axios.get(requestAddress);

            // Set up empty array to hold the processed fixtures
            // We want to transform the data from the CMS to make it a bit cleaner first
            let teams = [];
            let _teams = response.data.data[0].attributes.teams;

            _team.forEach(element => {

                  let attribs = element.attributes;

                  let teamName = attribs.Name;

                  teams.push(teamName);
                  
            });

            // Return an object with both games and the league name to be consumed by the view engine
            return responseObject= {
                  "teams": teams,
                  "success": teams.length > 0
            };
      }
      catch(error) {
            // handle error
            console.error(error);
            //Return an object indicating a failure
            return {"success": false};
      }
}

async function getFixtures(leagueURL){
      // Function that sends a GET request to the server
      // GETs all fixtures related to leagueURL
      // Returns object of all matching fixtures, league name, and 'Success' flag
      // Success = true if array size is greater than 0

      let requestAddress =  process.env.STRAPI + `api/fixtures?filters[league][url][$eq]=${leagueURL}&populate=*&pagination[pageSize]=100&sort=Date%3Adesc`
      // console.log(requestAddress)

      try{
            // Use the requestAddress to get fixtures list from CMS
            var response = await axios.get(requestAddress);
            
            // Set up empty array to hold the processed fixtures
            // We want to transform the data from the CMS to make it a bit cleaner first
            let fixtures = [];
            let _fixtures = response.data.data;
            // console.log(_fixtures[0]);
            
            //Use the first fixture to grab the name of the league
            let leagueName = _fixtures[0].attributes.league.data.attributes.name;
            // console.log(leagueName);

            _fixtures.forEach(element => {

                  let attribs = element.attributes;

                  let fixtureInfo = 
                  {
                        "id":element.id,
                        "date":attribs.Date,
                        // "parsedDate": function(){
                        //       let parts =this.date.split("/");
                        //       return `${parts[2]}-${parts[1]}-${parts[0]}`
                        // },
                        // "homeClub": "East Coast Cavaliers",
                        "homeTeam": attribs.team.data.attributes.Name,
                        "homeScore": attribs.homeTeamScore || "-",
                        "homePoints": attribs.homeTeamPointsAwarded || "-",
                        "awayTeam": attribs.awayTeam.data.attributes.Name,
                        "awayScore": attribs.awayTeamScore || "-",
                        "awayPoints": attribs.awayTeamPointsAwarded || "-",
                        "posted": attribs.posted
                  }
                  // console.log(fixtureInfo);

                  fixtures.push(fixtureInfo);
                  
            });

            // Return an object with both games and the league name to be consumed by the view engine
            return responseObject= {
                  "league": leagueName,
                  "games": fixtures,
                  "success": fixtures.length > 0
            };
                  

            
      }
      catch(error) {
            // handle error
            console.error(error);
            //Return an object indicating a failure
            return {"success": false};
      }
}


module.exports = router;
