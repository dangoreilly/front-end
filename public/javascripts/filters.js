function filterTable() {
    // Declare variables
    let checkboxes, toggle, body, rows; 
    // let filter = [];
    let checks = [];

    //Check the toggler
    toggle = document.getElementById('allTeamsFilterToggle');

    // Get the list of checkboxes that are actually checked <checks>
    checkboxes = document.getElementsByClassName('form-check-input');
    for (i = 0; i < checkboxes.length; i++){
        if (checkboxes[i].checked){
            checks.push(checkboxes[i].value);
        }
    }
    
    // get trs as array for ease of use
    body = document.querySelector("#fixturesTable tbody");
    rows = [].slice.call(body.querySelectorAll("tr"));


    // Check the the "All" switch
    // If the all swich is on, just show everything
    if (toggle.checked){

        //Make everything reappear
        showAll(rows);
        
    }
    else if(checks.length == 0){
    
        //If someone deselects all the teams just show everyone
        showAll(rows);
    }
    else {
        
        // If the result is nonzero, then show the returns
        // Loop through all list items, and hide those who don't match the search query
        for (i = 0; i < rows.length; i++) {

            
            if (checks.includes(rows[i].cells[1].innerText) || checks.includes(rows[i].cells[3].innerText)) {
                rows[i].style.display = "";
            } 
            else {
                rows[i].style.display = "none";
                
            }
        }

    }

}

function showAll(elements){

    for (i = 0; i < elements.length; i++) {

        elements[i].style.display = "";
    }

}
