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

//When sorting, the symbols need to be updated to give visual feedback

var sortIcons = {
    "up":"bi bi-arrow-up",
    "down":"bi bi-arrow-down",
    "none":"bi bi-arrow-down-up",
}

function setIcons(){

}

//Function for sorting list based on data values
function sortTable_byScore() {

    var table, i, switching, b, shouldSwitch;

    body = document.querySelector("#standingsTable tbody");
    
    table = document.getElementById("standingsTable");

    switching = true;
    /* Make a loop that will continue until
    no switching has been done: */
    while (switching) {
        // Start by saying: no switching is done:
        switching = false;
        rows = [].slice.call(body.querySelectorAll("tr"));
        
        // Loop through all list items:
            for (i = 0; i < (rows.length - 1); i++) {

                // Start by saying there should be no switching:
                shouldSwitch = false;

                /* Check if the next item should
                switch place with the current item: */
                if (parseInt(rows[i].cell[4].value) > parseInt(rows[i+1].cell[4].value)) {

                    /* If next item is alphabetically lower than current item,
                    mark as a switch and break the loop: */
                    shouldSwitch = true;
                    break;
                }
            }
        if (shouldSwitch) {
        /* If a switch has been marked, make the switch
        and mark the switch as done: */
        console.log(`Swapping ${rows[i].cells[0].value} and ${rows[i+1].cells[0].value}`)
        rows[i].parentNode.insertBefore(b[i + 1], b[i]);
        switching = true;
        }
    }
}

function sortTable_byPoints() {
    var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
    table = document.getElementById("standingsTable");
    switching = true;
    // Set the sorting direction to ascending:
    dir = "desc";
    /* Make a loop that will continue until
    no switching has been done: */
    while (switching) {
      // Start by saying: no switching is done:
      switching = false;
      rows = table.rows;
      /* Loop through all table rows (except the
      first, which contains table headers): */
      for (i = 1; i < (rows.length - 1); i++) {
        // Start by saying there should be no switching:
        shouldSwitch = false;
        /* Get the two elements you want to compare,
        one from current row and one from the next: */
        x = rows[i].getElementsByTagName("TD")[1];
        y = rows[i + 1].getElementsByTagName("TD")[1];
        /* Check if the two rows should switch place,
        based on the direction, asc or desc: */
        if (dir == "asc") {
          if (parseInt(x.innerHTML) > parseInt(y.innerHTML)) {
            // If so, mark as a switch and break the loop:
            shouldSwitch = true;
            break;
          }
        } else if (dir == "desc") {
          if (parseInt(x.innerHTML) < parseInt(y.innerHTML)) {
            // If so, mark as a switch and break the loop:
            shouldSwitch = true;
            break;
          }
        }
      }
      if (shouldSwitch) {
        /* If a switch has been marked, make the switch
        and mark that a switch has been done: */
        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
        switching = true;
        // Each time a switch is done, increase this count by 1:
        switchcount ++;
      } else {
        /* If no switching has been done AND the direction is "asc",
        set the direction to "desc" and run the while loop again. */
        if (switchcount == 0 && dir == "desc") {
          dir = "asc";
          switching = true;
        }
      }
    }

    //We just sorted by points, so the name sort icon needs to reset
    document.getElementById("teamSortIcon").className = sortIcons.none;

    //Check what way we just sorted and set the icons
    if(dir == "desc"){
        document.getElementById("pointsSortIcon").className = sortIcons.up;
    }
    else {
        document.getElementById("pointsSortIcon").className = sortIcons.down;
    }
}

function sortTable_byName() {
    var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
    table = document.getElementById("standingsTable");
    switching = true;
    // Set the sorting direction to ascending:
    dir = "asc";
    /* Make a loop that will continue until
    no switching has been done: */
    while (switching) {
      // Start by saying: no switching is done:
      switching = false;
      rows = table.rows;
      /* Loop through all table rows (except the
      first, which contains table headers): */
      for (i = 1; i < (rows.length - 1); i++) {
        // Start by saying there should be no switching:
        shouldSwitch = false;
        /* Get the two elements you want to compare,
        one from current row and one from the next: */
        x = rows[i].getElementsByTagName("TD")[0];
        y = rows[i + 1].getElementsByTagName("TD")[0];
        /* Check if the two rows should switch place,
        based on the direction, asc or desc: */
        if (dir == "asc") {
          if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
            // If so, mark as a switch and break the loop:
            shouldSwitch = true;
            break;
          }
        } else if (dir == "desc") {
          if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
            // If so, mark as a switch and break the loop:
            shouldSwitch = true;
            break;
          }
        }
      }
      if (shouldSwitch) {
        /* If a switch has been marked, make the switch
        and mark that a switch has been done: */
        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
        switching = true;
        // Each time a switch is done, increase this count by 1:
        switchcount ++;
      } else {
        /* If no switching has been done AND the direction is "asc",
        set the direction to "desc" and run the while loop again. */
        if (switchcount == 0 && dir == "asc") {
          dir = "desc";
          switching = true;
        }
      }
    }

    //We just sorted by name, so the Points sort icon needs to reset
    document.getElementById("pointsSortIcon").className = sortIcons.none;

    //Check what way we just sorted and set the icons
    if(dir == "desc"){
        document.getElementById("teamSortIcon").className = sortIcons.up;
    }
    else {
        document.getElementById("teamSortIcon").className = sortIcons.down;
    }
}



//   document.getElementById("MyElement").className = "MyClass";

