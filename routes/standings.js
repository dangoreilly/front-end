var express = require('express');
var router = express.Router();
// const axios = require('axios');
// const dotenv = require('dotenv').config();

// let token = process.env.STRAPI_BEARER;

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

      res.render('standings-index', {leagues}); 
});

router.get('/:league', function(req, res, next) {

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


      res.render('standings', {standings});
      // res.render('index');

});


module.exports = router;
