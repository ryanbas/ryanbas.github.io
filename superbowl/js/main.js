function main() {
    let tbody = document.getElementById("squares-tbody");

    let top_nums = document.createElement("tr");
    let blank_corner_td = document.createElement("td");
    blank_corner_td.setAttribute("id", "blank-corner")
    top_nums.appendChild(blank_corner_td);

    for (let top_col = 0; top_col < 10; top_col++) {
        let new_top_td = document.createElement("td");
        new_top_td.setAttribute("id", "top-nums-" + top_col);
        new_top_td.innerHTML = top_col;
        top_nums.appendChild(new_top_td);
    }
    tbody.appendChild(top_nums);
    
    for (let row = 0; row < 10; row++) {
        let new_row = document.createElement("tr");
        let left_nums = document.createElement("td");
        left_nums.setAttribute("id", "left-nums-" + row);
        left_nums.innerHTML = row;
        new_row.appendChild(left_nums);
    
        for (let col = 0; col < 10; col++) {
            let new_td = document.createElement("td");
            new_td.setAttribute("id", "td-" + row + "-" + col);
            new_row.appendChild(new_td);
        }
    
        tbody.appendChild(new_row);
    }
}

function addPlayer(new_player_num) {
    let new_div = document.createElement("div");

    let new_input = document.createElement("input");
    new_input.setAttribute("type", "text");
    new_input.setAttribute("name", "player-" + new_player_num);
    new_div.appendChild(new_input);

    let form_add_player = document.getElementById("form-add-player");
    let new_onclick = "addPlayer(" + (new_player_num + 1) + ");";
    form_add_player.setAttribute("onclick", new_onclick);
    let form_randomize_names = document.getElementById("form-randomize-names");

    let form = document.getElementById("players");
    form.removeChild(form_add_player);
    form.removeChild(form_randomize_names);
    
    form.appendChild(new_div);
    form.appendChild(form_add_player);
    form.appendChild(form_randomize_names);
}

function randomInRange(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function randomizeNumbers() {
    randomizeHeader("top");
    randomizeHeader("left");
}

function randomizeNames() {
    var num_players = 0;
    let player_names = [];

    Array.from(document.getElementsByTagName('input')).forEach( input => {
        if (input.getAttribute("type") === "text" && input.value != null && input.value != "") {
            num_players += 1;
            player_names.push(input.value);
        }
    });

    let squares_each = Math.floor(100 / num_players);
    let leftover = 100 - (squares_each * num_players);
    let player_entries = [];
    for (let player_i = 0; player_i < num_players; player_i++) {
        for (let i = 0; i < squares_each; i++) {
            player_entries.push(player_names[player_i]);
        }
    }

    for (let i = 0; i < leftover; i++) {
        player_entries.push("BLANK");
    }

    console.log("there are " + num_players + " players: " + player_names);
    console.log("each player gets " + squares_each + " squares with " + leftover + " leftover");
    
    shuffleEntries(player_entries);
}

function shuffleEntries(player_entries) {
    function getSquareAt(squares_index) {
        let row = Math.floor(squares_index / 10);
        let col = squares_index % 10;
        return document.getElementById("td-" + row + "-" + col);
    }

    let to_shuffle = player_entries.slice();
    var squares_index = 0;

    console.log("to_shuffle length is " + to_shuffle.length);
    for (let i = to_shuffle.length - 1; i >= 0; i--) {
        let j = randomInRange(0, i+1);
        let swapped = to_shuffle[i];
        to_shuffle[i] = to_shuffle[j];
        to_shuffle[j] = swapped;
        
        let square = getSquareAt(squares_index);
        square.innerHTML = to_shuffle[i];

        squares_index += 1;
    }
}

function randomizeHeader(topOrLeft) {
    let numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    for (let i = 9; i >= 0; i--) {
        let j = randomInRange(0, i+1);
        let swapped = numbers[i];
        numbers[i] = numbers[j];
        numbers[j] = swapped;
        document.getElementById(topOrLeft + "-nums-" + i).innerHTML = numbers[i];
    }
}

main();