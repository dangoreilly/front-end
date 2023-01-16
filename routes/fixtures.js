var express = require('express');
var router = express.Router();

var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
const axios = require('axios');
const { resource } = require('../app');
const dotenv = require('dotenv').config();

let token = process.env.STRAPI_BEARER;
let auth_path = process.env.STRAPI + "api/auth/local";


//////////////////////////////////
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
//////////////////////////////////

// const config = {
//   headers: { Authorization: `Bearer ${token}` }
// };

router.get('/', function(req, res, next) {
      
      //TODO: Function for async league pull

      res.render('fixtures-index', {test_leagues}); 
});

// Route for fixtures secretary to manage fixtures
router.get('/edit/', 

      //Check STRAPI to see if this user is allowed make edits
                  //TODO: Integrate actual login page
      passport.authenticate('basic', { session: false }),
      function(req, res) {

            //If the user has permissions, STRAPI will give us a jwt token 
            let user_jwt = req.user;

            // Prepare the edit page to send
            // We're not rendering this one, because rendering it client side with Vue
            // is more powerful, and we don't care about SEO on this page
            fileName = "fixtures-edit-vue.html";
            options = { root: "public/pages"};

            // Send the jwt token to use client side
            res.cookie("nebb_jwt_token", user_jwt);

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

      let _league = Promise.resolve(getLeagueObject(leagueURL))
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

// API route that just serves league object, not HTML
router.get('/json/:league', function(req, res, next) {

      let leagueURL = req.params.league;
      let league = Promise.resolve(getLeagueObject(leagueURL))
      .then((fixtures) => {
            // We don't need to verify that the fixtures object actually exists 
            // Because this should never be called unless the edit page is loaded
            // And the edit page won't load unless this is verified. 
            res.json(fixtures)
      })

});



async function getLeagueObject(leagueURL){
      //INPUT
      // url: string
      
      //METHOD
      // Make async calls to API for raw data
      // Combine processed data into a single object for easier UI comsumption
 
      //OUTPUT
      // <league> object

      //Initialise league object with fail flag
      let league = {"success": false};

      // let _fixtures = Promise.resolve(getFixtures(leagueURL));
      // let _teams = Promise.resolve(getTeams(leagueURL));
      let f = await getFixtures(leagueURL);
      let t = await getTeams(leagueURL);


      // Promise.all([_fixtures, _teams]).then((resolvedPromises) =>{
            // let f = resolvedPromises[0];
            // let t = resolvedPromises[1];

            // console.log("Fixtures: ", f.success);
            // console.log("Teams: ", t.success)
            
            if (f.success && t.success){

                  // If we have both a list of clubs matched to teams 
                  // and a list of games w/ the teams, we can match them for rendering later 
                  let games = matchClubsAndTeams(f.games, t.teams);

                  league = {
                        "id": f.id,
                        "league": f.league,
                        "games": games,
                        "teams": t.teams,
                        "success": true
                  }


            }

      // });
      // console.log(league);
      return league;
}

function matchClubsAndTeams(fixtures, teams){
      //INPUT
      // fixtures: array of fixture objects, with <homeTeam and <awayTeam> properties
      // teams: array of {team, club} objects
      
      //METHOD
      // For each fixture in <fixtures>, matches the home and away team names with a club.
      // Popluates a new <league> array that replaces the home and away teams with
      // {team, club} objects
 
      //OUTPUT
      // <games> object

      let games = [];

      fixtures.forEach(fixture => {

            //Don't mutate the original
            // let f = Object.create(fixture);

            fixture.homeTeam = getClubForTeam(fixture.homeTeam, teams);
            fixture.awayTeam = getClubForTeam(fixture.awayTeam, teams);

            games.push(fixture);

      })

      return games;


}

function getClubForTeam(searchTeam, teams){
      //INPUT
      // searchTeam: string
      // teams: array of {team, club} objects
      
      //METHOD
      // loop through <teams> for a match
 
      //OUTPUT
      // {team, club} object


      //If no match is found, just call the club unknown
      let searchResult = {"teamName": searchTeam, "clubName": "unknown"};;

      teams.forEach(t => {

            if (t.teamName == searchTeam){
                  searchResult = t;
            }

      })

      return searchResult;
}


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


function parseDate(_date){
      //Takes in a date string in the format YYYY-MM-DD
      //Returns date string in the format DD/MM/YYYY

      let parts =_date.split("-");
      
      return `${parts[2]}/${parts[1]}/${parts[0]}`

}

async function getTeams(leagueURL){
      // Function that sends a GET request to the server
      // GETs all Teams related to leagueURL
      // Returns array of all matching teams, and 'Success' flag
      // Success = true if array size is greater than 0

      // FILTER: for the league with the matching URL
      // POPULATE[TEAMS]: Include data about the related teams
      // POPULATE[1]=CLUB: For each team, include data about the related club
      let requestAddress =  process.env.STRAPI + `api/leagues?filters[url][$eq]=${leagueURL}&populate[teams][populate][1]=club`

      try{
            // Use the requestAddress to get team list from CMS
            var response = await axios.get(requestAddress);

            // Set up empty array to hold the processed teams
            // We want to transform the data from the CMS to make it a bit cleaner first
            let teams = [];
            let _teams = response.data.data[0].attributes.teams.data;

            _teams.forEach(element => {

                  let attribs = element.attributes;

                  let id = element.id;
                  let teamName = attribs.Name;
                  let clubName = attribs.club.data.attributes.Name;

                  //Pair the teamName and ClubName into an objectm and add to the list
                  teams.push({id, teamName, clubName});
                  
            });

            // console.log(teams);

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

      let requestAddress =  process.env.STRAPI + `api/fixtures?filters[league][url][$eq]=${leagueURL}&populate=*&pagination[pageSize]=100&sort=Date%3Aasc`
      // console.log(requestAddress)

      try{
            // Use the requestAddress to get fixtures list from CMS
            var response = await axios.get(requestAddress);
            
            // Set up empty array to hold the processed fixtures
            // We want to transform the data from the CMS to make it a bit cleaner first
            let fixtures = [];
            let _fixtures = response.data.data;
            // console.log(_fixtures[0]);
            
            // Use the first fixture to grab the name and ID of the league
            let leagueName = _fixtures[0].attributes.league.data.attributes.name;
            let leagueId = _fixtures[0].id;

            _fixtures.forEach(element => {

                  let attribs = element.attributes;

                  let fixtureInfo = 
                  {
                        "id":element.id,
                        "ISO_date": attribs.Date,
                        "date":parseDate(attribs.Date),
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
                        "homeWin": attribs.homeTeamScore > attribs.awayTeamScore,  // Quick check for the winner
                        "posted": attribs.homeTeamPointsAwarded + attribs.awayTeamPointsAwarded > 0,  // If points were awarded to either team, then the fixture should be displayed
                        "pastDue": attribs.Date < Date.now() && !this.posted // Flag for seeing if the fixture is in the past, but hasn't been updated
                  }
                  // console.log(fixtureInfo);

                  fixtures.push(fixtureInfo);
                  
            });

            // Return an object with both games and the league name to be consumed by the view engine
            let responseObject= {
                  "id": leagueId,
                  "league": leagueName,
                  "games": fixtures,
                  "success": fixtures.length > 0
            };
            // console.log(responseObject)
                  
            return responseObject;
            
      }
      catch(error) {
            // handle error
            console.error(error);
            //Return an object indicating a failure
            return {"success": false};
      }
}


module.exports = router;
