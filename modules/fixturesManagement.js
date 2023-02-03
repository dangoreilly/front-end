// Common functions for handling various League data
const axios = require('axios');

async function getLeagues(){
    // Function that sends a GET request to the server
    // GETs all leagues
    // Returns array of all leagues

    let requestAddress =  process.env.STRAPI + `/api/leagues?sort=name`

    try{
          // Use the requestAddress to get team list from CMS
          var response = await axios.get(requestAddress,
            {headers: { "Accept-Encoding": "gzip,deflate,compress" } });

          // Set up empty array to hold the processed teams
          // We want to transform the data from the CMS to make it a bit cleaner first
          let leagues = [];
          let _leagues = response.data.data;

          _leagues.forEach(element => {

                let attribs = element.attributes;

                let id = element.id;
                let leagueName = attribs.name;
                let grouping = attribs.Grouping;
                let url = attribs.url;

                // Form the league object and push it to the list
                leagues.push({id, leagueName, grouping, url});
                
          });

          // Now that we have the leagues, build a list of Groupings
          let groupings = []
          leagues.forEach(element => {

                // Check if the grouping of the current league has already been recorded
                if (!groupings.includes(element.grouping)){
                      // If it hasn't, add it to the list
                      groupings.push(element.grouping);
                }
          });

      //     console.log(leagues);

          // Return the list of leagues and groupings
          return {leagues, groupings};
    }
    catch(error) {
          // handle error
          console.error(error);
    }
}




async function getLeagueObject(leagueURL){
      //INPUT
      // url: string
      
      //METHOD
      // Make async calls to API for raw data
      // Combine processed data into a single object for easier UI comsumption
 
      //OUTPUT
      // <league> object

      //Initialise empty league object with fail flag
      let league = {
            "id": 0,
            "league": "none",
            "games": [],
            "teams": [],
            "success": false
      }

      // let _fixtures = Promise.resolve(getFixtures(leagueURL));
      // let _teams = Promise.resolve(getTeams(leagueURL));
      let f = await getFixtures(leagueURL);
      let t = await getTeams(leagueURL);


      // Promise.all([_fixtures, _teams]).then((resolvedPromises) =>{
            // let f = resolvedPromises[0];
            // let t = resolvedPromises[1];

            // console.log("Fixtures: ", f.success);
            // console.log("Teams: ", t.success)
            
            if (f.success || t.success){

                  // If we have both a list of clubs matched to teams 
                  // or a list of games w/ the teams, we can match them for rendering later
                  // The only time we will ever have one without the other is in preseason
                  // But we still need the league object to be sent to the management portal
                  let games = []

                  if (f.success && t.success){
                        // If the fixtures object exists, match up the clubs
                        // else, we're just going to send an empty array
                        games = matchClubsAndTeams(f.games, t.teams);
                  }

                  league = {
                        "id": t.leagueId, 
                        "league": f.league,
                        "leagueURL": f.leagueURL,
                        "games": games,
                        "teams": t.teams,
                        "success": true
                  }


            }

      // });
      // console.log(f);
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
      let searchResult = {"teamName": searchTeam, "clubName": "unknown"};

      teams.forEach(t => {

            if (t.teamName == searchTeam){
                  searchResult = t;
            }

      })

      return searchResult;
}



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
      let requestAddress =  process.env.STRAPI + `/api/leagues?filters[url][$eq]=${leagueURL}&populate[teams][populate][1]=club`

      try{
            // Use the requestAddress to get team list from CMS
            var response = await axios.get(requestAddress,
                {headers: { "Accept-Encoding": "gzip,deflate,compress" } });

            // Set up empty array to hold the processed teams
            // We want to transform the data from the CMS to make it a bit cleaner first
            let teams = [];
            let _teams = response.data.data[0].attributes.teams.data;
            // console.log(response.data.data[0])

            leagueId = response.data.data[0].id;

            try{

                _teams.forEach(element => {

                    let attribs = element.attributes;

                    let id = element.id;
                    let teamName = attribs.Name;
                    let clubName = attribs.club.data.attributes.Name;

                    //Pair the teamName and ClubName into an objectm and add to the list
                    teams.push({id, teamName, clubName});
                    
                });
            }
            catch(e){
                console.error("No teams found for this league");
                // Create a dummy team to let the page render
                teams.push({
                    "id": 0, 
                    "teamName": 'null', 
                    "clubName": 'null'
                });
            }

            // console.log(teams);

            // Return an object with both games and the league name to be consumed by the view engine
            return responseObject= {
                  leagueId,
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

      let requestAddress =  process.env.STRAPI + `/api/fixtures?filters[league][url][$eq]=${leagueURL}&populate=*&pagination[pageSize]=100&sort=Date%3Aasc`
      // console.log(requestAddress)

      try{
            // Use the requestAddress to get fixtures list from CMS
            var response = await axios.get(requestAddress,
                {headers: { "Accept-Encoding": "gzip,deflate,compress" } });
            
            // Set up empty array to hold the processed fixtures
            // We want to transform the data from the CMS to make it a bit cleaner first
            let fixtures = [];
            let _fixtures = response.data.data;
            // console.log(_fixtures[0]);
            
            // Use the first fixture to grab the name and ID of the league
            // If there is a first game, that is. The league might be empty in the preseason
            let leagueName = "Unpopulated League";
            let leagueId = 0;
            
            if(_fixtures.length > 0){
                  leagueName = _fixtures[0].attributes.league.data.attributes.name;
                  leagueId = _fixtures[0].id;
            }

            _fixtures.forEach(element => {

                  let attribs = element.attributes;

                  let fixtureInfo = 
                  {
                        "id":element.id,
                        "ISO_date": attribs.Date || 0,
                        "date":parseDate(attribs.Date),
                        // "parsedDate": function(){
                        //       let parts =this.date.split("/");
                        //       return `${parts[2]}-${parts[1]}-${parts[0]}`
                        // },
                        "venue": attribs.venue || "",
                        "publicNote": attribs.publicNote || "",
                        "publicNoteExists": attribs.publicNote != "",
                        "homeTeam": attribs.team.data ? attribs.team.data.attributes.Name : "?",
                        "homeScore": attribs.homeTeamScore || 0,
                        "homePoints": attribs.homeTeamPointsAwarded || 0,
                        "awayTeam": attribs.awayTeam.data ? attribs.awayTeam.data.attributes.Name : "?",
                        "awayScore": attribs.awayTeamScore || 0,
                        "awayPoints": attribs.awayTeamPointsAwarded || 0,
                        "homeWin": attribs.homeTeamScore > attribs.awayTeamScore,  // Quick check for the winner
                        "posted": attribs.homeTeamPointsAwarded + attribs.awayTeamPointsAwarded != 0,  // If points were awarded to either team, then the fixture should be displayed
                        "pastDue": attribs.Date < Date.now() && !this.posted // Flag for seeing if the fixture is in the past, but hasn't been updated
                  }
                  // console.log(fixtureInfo);

                  fixtures.push(fixtureInfo);
                  
            });

            // Return an object with both games and the league name to be consumed by the view engine
            let responseObject= {
                  "id": leagueId,
                  "league": leagueName,
                  leagueURL,
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

function calculatePoints(league){
    // Given a league object
    // Calcuate the points for each team
    // Return an array of objects 
    //{ team, points, played, wins, losses }


    // UI is expecting this fingerprint
    /*
    "league": "U18 Boys (B)",
    "leagueID": league,
    "teams": [
        {
            "team":"East Cavan Eagles",
            "played":3,
            "won": 3,
            "lost": 0,
            "points": 9
        }
    ]
    */

    let returnLeagueObject = {
        "leagueName": league.league,
        "leagueID": league.id,
        "leagueURL": league.leagueURL,
        "teams": []
    }

    //Generate an object of all teams with their stats set to 0
    for(i = 0; i < league.teams.length; i++){
    
        returnLeagueObject.teams.push({
            "team":league.teams[i].teamName,
            "club": league.teams[i].clubName,
            "teamID": league.teams[i].id,
            "played":0,
            "won": 0,
            "lost": 0,
            "points": 0
        })
    
    }


    // Loop through all the games
    for(i = 0; i < league.games.length; i++){

        let currentGame = league.games[i]

        //Make sure the fixture has actually been fulfilled before counting it
        if (currentGame.posted){

            // Get index of homeTeam
            let homeTeamIndex = getTeamIndexFromID(returnLeagueObject.teams, currentGame.homeTeam.id)
            // Get index of awayTeam
            let awayTeamIndex = getTeamIndexFromID(returnLeagueObject.teams, currentGame.awayTeam.id)

            // Increment homeTeam playCount
            returnLeagueObject.teams[homeTeamIndex].played += 1;
            // Increment awayTeam playCount
            returnLeagueObject.teams[awayTeamIndex].played += 1;

            // Check if this is a homeWin
            if (currentGame.homeWin){
                // increment homeTeam winCount
                returnLeagueObject.teams[homeTeamIndex].won += 1;
                // increment awayTeam lossCount
                returnLeagueObject.teams[awayTeamIndex].lost += 1;
            }
            else{ 
                // increment homeTeam lossCount
                returnLeagueObject.teams[homeTeamIndex].lost += 1;
                // increment awayTeam winCount
                returnLeagueObject.teams[awayTeamIndex].win += 1;
            } 
                
            
                
            // Add homePoints to homeTeam points
            returnLeagueObject.teams[homeTeamIndex].points += currentGame.homePoints;
            // Add awayPoints to awayTeam points
            returnLeagueObject.teams[homeTeamIndex].points += currentGame.awayPoints;
        }

    }

    //return the object with team stats
    return returnLeagueObject;

}

function getTeamIndexFromID(teams, id){
    // Takes in an array of team objects and an id
    // Returns the index of the team with the corresponding index

    for (i = 0; i < teams.length; i++){

        if (teams[i].teamID == id) return i;

    }

    //If we get this far, something has gone horribly wrong
    console.error(`getTeamIndexFromID: Team not found with id ${id}`)
    return -1

}

module.exports = {getLeagues, getLeagueObject, getTeams, getFixtures, calculatePoints}