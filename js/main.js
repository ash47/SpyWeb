/*
    Constants
*/

// Teams
var TEAM_GOOD = 'good';
var TEAM_BAD = 'bad';
var TEAM_VEHICLE = 'vehicle';

// Directions
var DIR_LEFT = 'left';
var DIR_UP = 'up';
var DIR_DOWN = 'down';
var DIR_RIGHT = 'right';

// Moves
var MOVE_LOOK = 'look';
var MOVE_LISTEN = 'listen';
var MOVE_POINT = 'point';

/*
    Character class
*/
function Character(name, data) {
    // The name of the character
    this.name = name;

    // The bounty they generate
    this.bounty = data.bounty;

    // The team they belong to
    this.team = data.team;

    // If they are a vehicle
    if(data.vehicle) this.vehicle = data.vehicle;

    /* The moves that are allowed
        {
            left:   <something>,
            right:  <something>,
            up:     <something>,
            down:   <something>
        }
    */
    this.moves = data.moves;
}

// Returns the image for this character
Character.prototype.getImage = function(suspect) {
    if(suspect) {
        return 'images/characters/' + this.name + '_suspect.png';
    } else {
        return 'images/characters/' + this.name + '.png';
    }
}

// Returns the team
Character.prototype.getTeam = function() {
    return this.team;
}

// Returns the name
Character.prototype.getName = function() {
    return this.name;
}

// Checks if this character can move in the given direction
Character.prototype.canMove = function(direction) {
    return this.moves[direction] != null;
}

// Returns true if this is a vehicle
Character.prototype.isVehicle = function() {
    return this.vehicle != null;
}

// Sets the type of vehicle this is
Character.prototype.setVehicle = function(sort) {
    this.vehicle = sort;
}

/* Create vehicles */
var VEHICLE_BOAT = new Character('boat', {
    moves: {},
    team: TEAM_VEHICLE,
    bounty: 0,
    vehicle: 'boat'
});

var VEHICLE_CAR = new Character('car', {
    moves: {},
    team: TEAM_VEHICLE,
    bounty: 0,
    vehicle: 'car'
});

var VEHICLE_PLANE = new Character('plane', {
    moves: {},
    team: TEAM_VEHICLE,
    bounty: 0,
    vehicle: 'plane'
});

/*
    Board class
*/

function Board() {
    /* Contains the characters in each square
        0   1   2
        3   4   5
        6   7   8
    */
    this.characters = [];
}

// Returns the character in the given space
Board.prototype.getCharacter = function(x, y) {
    // Check if it is a standard square
    if(x >= 0 && x <= 2) {
        if(y >= 0 && y <= 2) {
            return this.characters[3*y + x];
        }
    }

    // Check specical spaces
    if(x == 3 && y == 2) return VEHICLE_BOAT;
    if(x == -1 && y == 0) return VEHICLE_CAR;
    if(x == 2 && y == -1) return VEHICLE_PLANE;

    // Currently null
    return null;
}

// Puts a character into the given slot
Board.prototype.setCharacter = function(x, y, character) {
    // Check if it is a standard square
    if(x >= 0 && x <= 2) {
        if(y >= 0 && y <= 2) {
            this.characters[3*y + x] = character;
            return true;
        }
    }

    return false;
}

// Displays the board into the given element
Board.prototype.display = function(div) {
    // Empty the div
    div.empty();

    // Create and insert our container
    var ourCon = $('<div>').attr('class', 'board');
    div.append(ourCon);

    // Create a container for each of our characters
    for(var y=0; y<=2; ++y) {
        for(var x=0; x<=2; ++x) {
            var charDisplay = $('<div>').attr('class', 'charDisplay')

            var character = this.getCharacter(x, y);
            if(character) {
                charDisplay.css('background-image', 'url("' + character.getImage(false) + '")').css('background-size', '128px 128px');
            }

            ourCon.append(charDisplay);
        }

        if(y < 2) {
            var newLine = $('<br>');
            ourCon.append(newLine);
        }
    }
}

// Calculates stats used to rate a given board
Board.prototype.calcStats = function() {
    // Used to rank boards
    var total = 0;      // Total connections to characters
    var unique = 0;     // Unique connections to characters
    var vehicle = 0;    // Total connections to vehicles (these are BAD)

    for(var y=0; y<=2; y++) {
        for(var x=0; x<=2; ++x) {
            var character = this.getCharacter(x, y);

            if(character != null && character.canMove(DIR_RIGHT)) {
                var moveCharacter = this.getCharacter(x+1, y);

                if(moveCharacter != null) {
                    if(moveCharacter.isVehicle()) {
                        vehicle++;
                        total++;
                        unique++;
                    } else {
                        total++;
                        unique++;
                    }
                }
            }

            if(character != null && character.canMove(DIR_DOWN)) {
                var moveCharacter = this.getCharacter(x, y+1);

                if(moveCharacter != null) {
                    if(moveCharacter.isVehicle()) {
                        vehicle++;
                        total++;
                        unique++;
                    } else {
                        total++;
                        unique++;
                    }
                }
            }

            if(character != null && character.canMove(DIR_LEFT)) {
                var moveCharacter = this.getCharacter(x-1, y);

                if(moveCharacter != null) {
                    if(moveCharacter.isVehicle()) {
                        vehicle++;
                        total++;
                        unique++;
                    } else {
                        total++;

                        if(!moveCharacter.canMove(DIR_RIGHT)) {
                            unique++;
                        }
                    }
                }
            }

            if(character != null && character.canMove(DIR_UP)) {
                var moveCharacter = this.getCharacter(x, y-1);

                if(moveCharacter != null) {
                    if(moveCharacter.isVehicle()) {
                        vehicle++;
                        total++;
                        unique++;
                    } else {
                        total++;

                        if(!moveCharacter.canMove(DIR_DOWN)) {
                            unique++;
                        }
                    }
                }
            }
        }
    }

    return {
        total: total,
        unique: unique,
        vehicle: vehicle
    }
}

/*
    Main program
*/

// When everything is ready, do things
$(document).ready(function(){
    // Arrays of characters
    var goodCharacters = [];
    var badCharacters = [];

    // Process character data
    for(var characterName in characterData) {
        // Grab the data for this character
        var data = characterData[characterName];

        // Create a character
        var character = new Character(characterName, data);

        // Grab their team
        var team = character.getTeam();

        // Decide where to store them
        if(team == TEAM_GOOD) {
            goodCharacters.push(character);
        } else if(team == TEAM_BAD) {
            badCharacters.push(character);
        } else {
            console.log(character.getName() + ' is on an unknown team: ' + team);
            continue;
        }
    }

    // We can cleanup the characterData now
    delete characterData;

    /*function applyLoop(pool, board, slot, charNumber) {
        if(board == null) {
            board = new Board();
        }

        console.log(slot + ' ' + charNumber);

        if(charNumber < pool.length) {
            charNumber++;
        } else {
            slot++;
            charNumber = 0;
        }

        if(slot > 8) {
            return;
        }

        applyLoop(pool, board, slot, charNumber);

        //for(var i=0; i<pool.length; ++i) {
        //    console.log(i);
        //}
    }

    var board = new Board();
    applyLoop(goodCharacters, board, 0, 0);*/

    // Setup a test board
    /*var board = new Board();

    for(var x=0; x<=2; ++x) {
        for(var y=0; y<=2; ++y) {
            board.setCharacter(x, y, goodCharacters[x+3*y]);
        }
    }

    board.setCharacter(1, 1, null);

    board.display($('#content'));*/

    //console.log(board.calcStats());
});
