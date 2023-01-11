var mainVueApp = {
    data: () => ({
      league: "unknown",
      games: [],
      games_clean: [],
      teams: [],
      leagueID: 0,
      leagueURL: "#",
      games_new:[],
      modified: false,
      cookie_expiry: null,
      time_to_expiry: {
        ms: null,
        str: null,
        },
    }),
  
    created() {
      // fetch on init
      this.getURL();
      this.fetchData();
      this.cookie_expiry = 3.6e+6 + Date.now();

      //Start the countdown for timeout
      setInterval(this.updateCountdown, 1000);
    },


    computed:{
        strapi_cookie(){
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
                return c.substring(name.length, c.length);
                }
            }
            return "";
        },

        // time_to_expiry(){

            
        // },

        changesMade(){
            // Unfortunately, need to deep check for equivalence
            // Because js can't equivalence check objects properly

            for(i = 0; i < this.games.length; i++){

                if(this.checkDifferences(this.games[i], i)){
                    //mark it as changed
                    this.games[i].modified = true;
                    return true;
                }

                //Also check if it's marked for deletion
                if(this.games[i].deleted) return true;
            }

            //Now check if there have been new additions
            if (this.newFixturesAdded) return true;

            // If we made it this far, then every game is the same as when it was fetched
            return false;

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
        async fetchData() {
            
            let data = await (await fetch(this.leagueURL)).json()
            //Now that we have the data, parse it

            this.league = data.league;
            this.games = data.games;
            this.games_clean = JSON.parse(JSON.stringify(data.games)); // For later comparisons for UI highlighting, deep copying is needed
            this.leagueID = data.id;
            this.teams = data.teams;
        },

        getURL(){
            let full_url = document.URL.split("/");
            let relevant_URL = full_url[full_url.length-1];
            this.leagueURL = "/fixtures/json/" + relevant_URL;
            // console.log(`Fetching from ${this.leagueURL}`)
        },

        updateCountdown(){

            //First get the number of ms
            let time_in_ms = this.cookie_expiry - Date.now();
            // console.log(time_in_ms, this.cookie_expiry, Date.now())

            //Convert that into ss, mm, hh
            let seconds = Math.floor(time_in_ms / 1000);
            let minutes = Math.floor(seconds / 60);
            // let hours = Math.floor(minutes / 60);

            seconds = seconds % 60;
            minutes = minutes % 60;

            //And now stringify it
            let seconds_string = seconds.toString().padStart(2, '0');
            let minutes_string = minutes.toString().padStart(2, '0');
            // let hours_string = hours.toString().padStart(2, '0');

            // And now update the props
            this.time_to_expiry.ms = time_in_ms;
            this.time_to_expiry.str = `${minutes_string}:${seconds_string}`;

            // return {time_in_ms, stringified: `${minutes_string}:${seconds_string}`};

            
            // let countdown = document.getElementById("countdown");
            // countdown.innerText = this.time_to_expiry.stringified;
            // console.log(this.time_to_expiry)
            // console.log(this.cookie_expiry)
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
        deleteFixtureFromServer(){
            //Send a delete request to the server for the selected fixture
            console.log("deleteFixtureFromServer()");
        },
        sendNewGames(){
            //Send new fixtures to the server
            //Update the "sent" flag to update the UI
            console.log("sendNewGames()");
        },
        
        //TODO
        // Pop up a modal
        // Display fixture review screen
        // When user sends clicks send, start sending and update UI to show send/failed/pending

        sendUpdates(){

            // Create modal
            // Send POST request
            // Update modal 
            // Send PUT request
            // Send DELETE request

            console.log(this.strapi_cookie);
            console.log("sendUpdates()");
        },

    }
  }