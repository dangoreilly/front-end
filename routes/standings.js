var express = require('express');
var router = express.Router();
const nebb = require('../modules/fixturesManagement.js');
// const axios = require('axios');
// const dotenv = require('dotenv').config();

//////////////////////////////////
/*
//For testing rendering

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

      let league = req.params.league;

      var standings = {
            "league": "U18 Boys (B)",
            "leagueID": league,
            "teams": [
                  {
                        "team":"East Cavan Eagles",
                        "played":3,
                        "won": 3,
                        "lost": 0,
                        "points": 9
                  },
                  {
                        "team":"Drogheda Wolves",
                        "played":5,
                        "won": 3,
                        "lost": 2,
                        "points": 11
                  },
                  {
                        "team":"Dynamites",
                        "played":3,
                        "won": 1,
                        "lost": 2,
                        "points": 5
                  },
                  {
                        "team":"Blackwater Steelers",
                        "played":5,
                        "won": 2,
                        "lost": 3,
                        "points": 9
                  },
                  {
                        "team":"Streete Warriors",
                        "played":3,
                        "won": 0,
                        "lost": 3,
                        "points": 3
                  },
                  {
                        "team":"East Coast Cavaliers",
                        "played":5,
                        "won": 3,
                        "lost": 2,
                        "points": 11
                  }
            ]
      }

*/
//////////////////////////////////

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

        res.render('standings-index', {leagues}); 

    })
});

router.get('/:league', function(req, res, next) {

    let leagueURL = req.params.league;

    let _league = Promise.resolve(nebb.getLeagueObject(leagueURL))
    .then((fixtures) => {

        let standings = nebb.calculatePoints(fixtures);dfx
    
        if (fixtures.success){

            res.render('standings', {standings});

        }
        else {
            res.render('error-leaguenotfound', {contactMail: "info@nebb.ie"});
        }    

    })

    
    // res.render('index');

});


module.exports = router;
