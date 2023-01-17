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

    }),
  
    created() {
      // TODO: Figure out why the cookie is being set to null after setting
      this.strapi_cookie = this.getStrapiCookie();
        Promise.resolve(this.fetchLeagues())
        .then((r) => {console.log("Vue mounted")});
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
        }

    },
  
    methods: {
        async fetchLeagueData() {
            
            console.log(`Fetching from ${this.leagueURL}`)
            let data = await (await fetch(this.leagueURL)).json()
            //Now that we have the data, parse it
            console.log(data);
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
                    this.currentLeague = lg;
                } 
            });

            this.fetchLeagueData();

        },

        // getURL(){
        //     let full_url = document.URL.split("/");
        //     let relevant_URL = full_url[full_url.length-1];
        //     this.leagueURL = "/fixtures/json/" + relevant_URL;
        //     // console.log(`Fetching from ${this.leagueURL}`)
        // },

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
        addNewFixture(){
            //Add a new fixture, held in a different 
            let newFixture = {
                "ISO_date": null,
                "homeTeam": "",
                "homeScore": null,
                "homePoints": null,
                "awayTeam": "",
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

        sendUpdates(){

            // Send POST request
            this.POSTnewFixtures();
            // Send PUT request
            this.PUTupdatedFixtures();
            // Send DELETE request
            this.deleteFixturesFromServer();
            // Report to the user
            window.alert("Fixtures updated");
            // Refresh the UI
            this.resetAll();
            this.fetchLeagueData();
            // console.log(this.strapi_cookie);
            // console.log("sendUpdates()");

        },
        deleteFixturesFromServer(){
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
                // TODO: Update CMS link
                deletedGames[i] = Promise.resolve( 
                    fetch(`http://localhost:1337/api/fixtures/${toBeDeleted[i].id}`, {
                        method: 'DELETE',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            "Authorization": `Bearer ${this.getStrapiCookie()}`,

                        }
                    })
                );
            }

            Promise.all(deletedGames)
            .then(deletedGames_resolved => {
                // Now that we have responses for all our DELETEs, check how many were actually successful
                for( i = 0; i < deletedGames_resolved.length; i ++){
                    if (deletedGames_resolved[i].ok){
                        console.log(`Deleted Fixture ${deletedGames_resolved[i].id}`);
                        deleted++;
                    }
                    else {
                        // If a fixture fails to be deleted, throw an alert to the user with the 
                        // fixture ID that failed to delete. 
                        console.log("Deletion Failed");
                        console.log(deletedGames_resolved[i]);
                        window.alert(`Failed to delete Fixture ${deletedGames_resolved[i].id}`)
                    }
                }

                window.alert(`Deleted ${deleted} fixtures`)
            })



            //When finished, Print succesful number of deletes to console
            console.log(`Deleted ${deleted} fixtures`);
        },
        POSTnewFixtures(){
            //Send new fixtures to the server
            console.log("POSTnewFixtures()");
        },
        PUTupdatedFixtures(){
            //Send updates to the server
            console.log("PUTupdatedFixtures()");
        },

    }
  }