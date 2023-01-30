var mainVueApp = {
    data: () => ({
        leagues: [],
        currentLeague: null,
        selectedLeague: "", // A placeholder to avoid issues with the currentLeague object being overwritten
        games: [],
        games_clean: [],
        teams: [],
        leagueID: 0,
        games_new:[],
        modified: false,
        strapi_cookie: "test",
        STRAPI_BASE_URL: "", // For easy swapping between localhost testing and deployment address

    }),
  
    created() {
        // TODO: Figure out why the cookie is being set to null after setting
        this.strapi_cookie = this.getStrapiCookie();
        Promise.resolve(this.getStrapiURL())
        .then((r) => {console.log("CMS address acquired")});
        Promise.resolve(this.fetchLeagues())
        .then((r) => {console.log("League data fetched")});
    },


    computed:{
        leagueURL(){

            if(this.currentLeague)
                return "/json/fixtures/" + this.currentLeague.url;

            else
                return "/#";

        },

        changesMade(){
            // Unfortunately, need to deep check for equivalence
            // Because js can't equivalence check objects properly

            let rtrn = false;

            for(i = 0; i < this.games.length; i++){

                if(this.checkDifferences(this.games[i], i)){
                    //mark it as changed
                    this.games[i].modified = true;
                    rtrn = true;
                }

                //Also check if it's marked for deletion
                if(this.games[i].deleted) rtrn = true;
            }

            //Now check if there have been new additions
            if (this.newFixturesAdded) rtrn = true;

            return rtrn;

        },
        newFixturesAdded(){
            return this.games_new.length > 0;
        },
        modifiedCount(){

            let count = 0;
            //Cycle through the games list and see how many have modifications
            for(i = 0; i < this.games.length; i++){

                // If the fixture is marked for deletion but also modified, deletion takes precedence
                if(this.checkDifferences(this.games[i], i) && !this.games[i].deleted) count++;
            }

            return count;
        },
        newFixturesCount(){
            
            return this.games_new.length;

        },
        deletedCount(){

            let count = 0;
            //Cycle through the games list and see how many marked for deletion
            for(i = 0; i < this.games.length; i++){

                if(this.games[i].deleted) count++;
            }

            return count;
        },
        updateValid(){

            // Cycle through the games list
            // and new games list
            // If any are invalid, the whole update is
            // for(i = 0; i < this.games.length; i++){

            //     if(!this.checkValidity(this.games[i])) return false;
            // }
            
            for(i = 0; i < this.games_new.length; i++){

                if(!this.checkValidity(this.games_new[i])) return false;
            }

            return true;
        }

    },
  
    methods: {
        async fetchLeagueData() {
            
            // console.log(`Fetching from ${this.leagueURL}`)
            let data = await (await fetch(this.leagueURL)).json()
            //Now that we have the data, parse it
            // console.log(data);
            this.league = data.league;
            this.games = data.games;
            this.games_clean = JSON.parse(JSON.stringify(data.games)); // For later comparisons for UI highlighting, deep copying is needed
            this.leagueID = data.id;
            this.teams = data.teams;
        },

        async fetchLeagues() {
            
            let data = await (await fetch("/json/leagues")).json()
            // this.leagues = this.getLeagueUrlsOnly(data.leagues);
            this.leagues = data.leagues;
            // console.log(this.leagues)
            // Initialise the first currentLeague
            this.currentLeague = this.leagues[0]; 
            this.selectedLeague = this.currentLeague.leagueName;
            this.fetchLeagueData();
        },

        getLeagueUrlsOnly(leagueObjectArray){

            // For each object in the array
            // extract it's URL and add it to a new array
            // return only the stripped array
            let leagueURLs = []

            leagueObjectArray.forEach((league) => {

                leagueURLs.push(league.url);

            });
            // console.log(leagueObjectArray);
            // console.log(leagueURLs);

            return leagueURLs;
        },

        // We're editing the leagueName directly in the select box
        // So we need to manually update the currentLeague Object
        // And refetch the data
        reconcileLeague(){

            //Find the league object that has the same name as the input box, and update the CurrentLeague object.
            this.leagues.forEach(lg => {

                if (lg.leagueName == this.selectedLeague){
                    // Deep copy league
                    this.currentLeague = JSON.parse(JSON.stringify(lg))
                } 
            });

            this.fetchLeagueData();

        },

        reconcileTeams(game){
            // When a teamName is updated, make the rest of the team attribute match it
            game.homeTeam = this.matchTeamToTeamObject(game.homeTeam.teamName);
            game.awayTeam = this.matchTeamToTeamObject(game.awayTeam.teamName);

        },

        matchTeamToTeamObject(_teamName){
            // Takes in a teamName as a string
            // Returns the corresponding Team Object

            for(i = 0; i < this.teams.length; i++){
            
                if (_teamName == this.teams[i].teamName) {
                    // Deep copy to avoid overwriting good data
                    return JSON.parse(JSON.stringify(this.teams[i]));
                }
            }

            // Return a null object if no match was found 
            return {
                "clubName": null,
                "teamName": null,
                "id": null
            }
        },

        async getStrapiURL(){
            let data = await (await fetch("/json/appinfo")).json()
            this.STRAPI_BASE_URL = data.cms;
            // console.log(`Fetching from ${this.leagueURL}`)
        },

        getStrapiCookie(){
            // Reads the cookies in local storage, 
            let name = "nebb_jwt_token=";
            let decodedCookie = decodeURIComponent(document.cookie);
            let ca = decodedCookie.split(';');

            for(let i = 0; i <ca.length; i++) {

                let c = ca[i];
                while (c.charAt(0) == ' ') {
                    c = c.substring(1);
                }
                if (c.indexOf(name) == 0) {
                    let cookie = c.substring(name.length, c.length)
                    return cookie;
                }
            }
            console.log("no cookie found")
            return "";
        },

        checkDifferences(game, index){
            //Check the properties against the clean copy
            let gc = this.games_clean;

            if(game.ISO_date != gc[index].ISO_date) return true;
            if(game.homeTeam.teamName != gc[index].homeTeam.teamName) return true;
            if(game.homeScore != gc[index].homeScore) return true;
            if(game.homePoints != gc[index].homePoints) return true;
            if(game.awayTeam.teamName != gc[index].awayTeam.teamName) return true;
            if(game.awayScore != gc[index].awayScore) return true;
            if(game.awayPoints != gc[index].awayPoints) return true;
            
            //If we made it through all those checks
            game.modified = false;
            return false;

        },

        checkValidity(game){
            // Check that key fields have been populated
            // Doesn't really matter what the values are, just that the values exist
            
            //Assume game is invalid
            game.valid = false;

            if(!game.ISO_date) return false;
            if(!game.homeTeam.teamName) return false;
            // if(!game.homeScore) return false;
            // if(!game.homePoints) return false;
            if(!game.awayTeam.teamName) return false;
            // if(!game.awayScore) return false;
            // if(!game.awayPoints) return false;
            
            // Add a flag for the UI to check
            game.valid = true;
            return true

        },

        addNewFixture(){
            //Add a new fixture, held in a different 
            let newFixture = {
                "ISO_date": null,
                "homeTeam": {
                    "clubName": null,
                    "teamName": null
                },
                "homeScore": null,
                "homePoints": null,
                "awayTeam": {
                    "clubName": null,
                    "teamName": null
                },
                "awayScore": null,
                "awayPoints": null,
                "posted": true
            }

            this.games_new.push(newFixture);
        },
        deleteNewFixture(index){
            //Delete the fixture that hasn't yet been pushed 
            this.games_new.splice(index, 1);
        },
        resetAll(){
            // Clear the list of new games
            this.games_new = [];
            // Restore the values from the clean copy
            // Don't refresh from server
            // We might add that as a different function later
            // Deep copying as before
            this.games = JSON.parse(JSON.stringify(this.games_clean));

        },
        resetOne(index){
            // Restore the values from the clean copy, for this fixture only
            // Deep copying as before
            this.games[index] = JSON.parse(JSON.stringify(this.games_clean[index]));

        },
        
        // TODO: Fixture Update Review Modal
        // Pop up a modal
        // Display fixture review screen
        // When user sends clicks send, start sending and update UI to show send/failed/pending

        async sendUpdates(){

            // Send POST request
            await this.POSTnewFixtures();
            // Send PUT request
            await this.PUTupdatedFixtures();
            // Send DELETE request
            await this.deleteFixturesFromServer();
            // Report to the user
            window.alert("Fixtures updated");
            // Refresh the UI
            this.resetAll();
            this.fetchLeagueData();
            // console.log(this.strapi_cookie);
            // console.log("sendUpdates()");

        },
        async deleteFixturesFromServer(){
            // Collect an array of fixtures to be deleted
            // This could be done live, but it's easier to do it here
            let toBeDeleted = [];
            let deletedGames = [];
            let deleted = 0;

            this.games.forEach((game) => {
                if (game.deleted){
                    toBeDeleted.push(game);
                }
            });

            // For each game that's getting deleted, send a delete request in a promise. 
            // We'll resolve them all later
            for( i = 0; i < toBeDeleted.length; i ++){

                deletedGames[i] =  await fetch(
                    `${this.STRAPI_BASE_URL}/api/fixtures/${toBeDeleted[i].id}`, 
                    {
                        method: 'DELETE',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            "Authorization": `Bearer ${this.getStrapiCookie()}`,

                        }
                    }
                )

                if (deletedGames[i].ok){
                    console.log(`Deleted Fixture ${toBeDeleted[i].id}`);
                    Modifed++;
                }
                else {
                    // If a fixture fails to be deleted, throw an alert to the user with the 
                    // fixture ID that failed to delete. 
                    console.log(`DELETE Failed - ${toBeDeleted[i].id}`);
                }

            }

            //When finished, Print succesful number of deletes
            window.alert(`Deleted ${deleted} fixtures`)
            let timestamp = new Date(Date.now()).toISOString()
            console.log(`${timestamp}: Deleted ${deleted} fixtures`);

        },
        async PUTupdatedFixtures(){
            //Send updates to the server           
            
            // Collect an array of fixtures to be modifed
            // This could be done live, but it's easier to do it here
            let toBeModified = [];
            let ModifedGames = [];
            let Modifed = 0;

            this.games.forEach((game) => {
                if (game.modified){
                    toBeModified.push(game);
                }
            });

            // For each game that's getting modifed, create a Promise with that new fixture. 
            // We'll resolve them all later
            for( i = 0; i < toBeModified.length; i++){
                //TODO: Update Strapi Link
                ModifedGames[i] = await fetch(
                    `${this.STRAPI_BASE_URL}/api/fixtures/${toBeModified[i].id}`, 
                    {
                        method: 'PUT',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            "Authorization": `Bearer ${this.getStrapiCookie()}`,

                        },
                        // We don't need to send all the fields, strapi would interpret
                        // a PUT with incomplete data to only update the specified fields
                        // but it's easier to just send the full lot
                        body: JSON.stringify(this.packageFixture(toBeModified[i]))
                    }
                )
                
                if (ModifedGames[i].ok){
                    console.log(`Updated Fixture ${ModifedGames[i].id}`);
                    Modifed++;
                }
                else {
                    // If a fixture fails to be deleted, throw an alert to the user with the 
                    // fixture ID that failed to delete. 
                    console.log(`PUT Failed - ${ModifedGames[i].id}`);
                }

            }

            //When finished, Print succesful number of deletes
            window.alert(`Modified ${Modifed} fixtures`)
            let timestamp = new Date(Date.now()).toISOString()
            console.log(`${timestamp}: Modified ${Modifed} fixtures`);
        },
        async POSTnewFixtures(){
            //Send new fixtures to the server
            console.log("POSTnewFixtures()");
        },

        packageFixture(f){
            // Takes in a fixture object
            // Transforms to have the appropriate fingerprint for Strapi to consume

            return {
                "data": {
                    "Date": f.ISO_date,
                    "homeTeamScore": f.homeScore,
                    "awayTeamScore": f.awayScore,
                    "awayTeamPointsAwarded": f.awayPoints,
                    "homeTeamPointsAwarded": f.homePoints,
                    "posted": true,
                    "team": f.homeTeam.id,
                    "awayTeam": f.awayTeam.id
                }
            }
        }

    }
  }