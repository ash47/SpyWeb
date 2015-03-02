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
            var slotNumber = 3*y + x;
            if(this.activeSlot == slotNumber) return null;

            return this.characters[slotNumber];
        }
    }

    // Check specical spaces
    if(x == 3 && y == 2) return VEHICLE_BOAT;
    if(x == -1 && y == 0) return VEHICLE_CAR;
    if(x == 2 && y == -1) return VEHICLE_PLANE;

    // Currently null
    return null;
}

// Returns the picked character
Board.prototype.getPicked = function() {
    if(this.activeSlot == null) return null;
    return this.characters[this.activeSlot];
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

// Puts a character into the direct slot
Board.prototype.setCharacterSlot = function(slot, character) {
    if(slot >= 0 && slot <= 8) {
        this.characters[slot] = character;
        return true;
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

    var picked = this.getPicked();
    if(picked != null) {
        var charDisplay = $('<div>').attr('class', 'charDisplayTop').css('background-image', 'url("' + picked.getImage(false) + '")').css('background-size', '128px 128px');
        ourCon.append(charDisplay);

        var newLine = $('<br>');
        ourCon.append(newLine);
    }

    // Create a container for each of our characters
    for(var y=0; y<=2; ++y) {
        for(var x=0; x<=2; ++x) {
            var charDisplay = $('<div>').attr('class', 'charDisplay');

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

// Picks the slot where the spy is hidding
Board.prototype.pickSlot = function(slot) {
    this.activeSlot = slot;
}

// Calculates stats used to rate a given board
Board.prototype.calcStats = function() {
    // Used to rank boards
    var total = 0;      // Total connections to characters
    var unique = 0;     // Unique connections to characters
    var vehicle = 0;    // Total connections to vehicles (these are BAD)
    var miss = 0;       // Total number of misdirections

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
                } else {
                    miss++;
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
                } else {
                    miss++;
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
                } else {
                    miss++;
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
                } else {
                    miss++;
                }
            }
        }
    }

    return {
        total: total,
        unique: unique,
        vehicle: vehicle,
        miss: miss
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

    var stats = [];
    var usedChars = [];

    var pool = goodCharacters;
    var board = new Board();
    function permute(input) {
        var i, j, ch;
        for (i=0; i<input.length; ++i) {
            ch = input.splice(i, 1)[0];
            usedChars.push(ch);
            if (input.length == 0) {
                var res = usedChars.slice();
                for(j=0; j<res.length; ++j) {
                    board.setCharacterSlot(j, pool[res[j]]);
                }

                for(j=0; j<9; ++j) {
                    board.pickSlot(j);

                    var ourStats = board.calcStats();
                    ourStats.state = res;
                    ourStats.pos = j;
                    stats.push(ourStats);
                }
            }
            permute(input);
            input.splice(i, 0, ch);
            usedChars.pop();
        }
    };

    console.log('Beginning permutations!');

    permute([
        0,
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8
    ]);

    console.log('Beginning sorting...');

    stats.sort(function(a, b) {
        if(a.vehicle != b.vehicle) return a.vehicle - b.vehicle;
        if(a.unique != b.unique) return a.unique - b.unique;
        if(a.miss != b.miss) return b.miss - a.miss;


        return a.total - b.total;
    });

    console.log('Results:');

    var pickNum = 0;

    var winnerState = stats[pickNum].state;
    var winnerPos = stats[pickNum].pos;
    for(var i=0; i<9; ++i) {
        board.setCharacterSlot(i, pool[winnerState[i]]);
    }
    board.pickSlot(winnerPos);

    board.display($('#content'));
});
