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
        return 'images/characters/' + this.name + '_suspect.jpg';
    } else {
        return 'images/characters/' + this.name + '.jpg';
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

// Iterates over a player's move
Character.prototype.loopOverMoves = function(func) {
    for(var direction in this.moves) {
        func(this, direction, this.moves[direction]);
    }
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
Board.prototype.getCharacter = function(x, y, direction) {
    // Handle the direction param
    if(direction != null) {
        if(direction == DIR_LEFT) x -= 1;
        if(direction == DIR_RIGHT) x += 1;
        if(direction == DIR_UP) y -= 1;
        if(direction == DIR_DOWN) y += 1;
    }

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

    // Add a container for the board
    var boardCon = $('<div>').attr('class', 'boardCon');
    ourCon.append(boardCon);

    // Create a container for each of our characters
    for(var y=0; y<=2; ++y) {
        for(var x=0; x<=2; ++x) {
            var charDisplay = $('<div>').attr('class', 'charDisplay');

            var character = this.getCharacter(x, y);
            if(character) {
                charDisplay.css('background-image', 'url("' + character.getImage(false) + '")').css('background-size', '128px 128px');
            }

            boardCon.append(charDisplay);
        }

        if(y < 2) {
            var newLine = $('<br>');
            boardCon.append(newLine);
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
    var totalGraphs = 0;// Total number of graphs

    // List of chars that are already in our graph
    var handled = {};
    var graph = {};
    var graphNum = 1;

    // Add stats for the picked character
    var character = this.getPicked();
    if(character != null) {
        character.loopOverMoves(function(chr, dir, move) {
            miss++;
        });
    }

    // Grab a reference to this board
    var thisBoard = this;

    for(var y=0; y<=2; y++) {
        for(var x=0; x<=2; ++x) {
            var character = this.getCharacter(x, y);

            if(character != null) {
                // Build a graph
                if(!handled[character.getName()]) {
                    var myGraph = graphNum++;
                    graph[character.getName()] = myGraph;
                    handled[character.getName()] = true;
                    totalGraphs++;

                    function buildGraph(character, ox, oy) {
                        character.loopOverMoves(function(chr, dir, move) {
                            var newX = ox;
                            var newY = oy;

                            // Adjust positioning
                            if(dir == DIR_LEFT) newX -= 1;
                            if(dir == DIR_RIGHT) newX += 1;
                            if(dir == DIR_UP) newY -= 1;
                            if(dir == DIR_DOWN) newY += 1;

                            var moveCharacter = thisBoard.getCharacter(newX, newY);
                            if(moveCharacter != null) {
                                if(handled[moveCharacter.getName()]) {
                                    // This is a graph that already exists, check for merge
                                    var theirGraph = graph[moveCharacter.getName()];
                                    if(theirGraph != myGraph) {
                                        for(var key in graph) {
                                            if(graph[key] == myGraph) {
                                                graph[key] = theirGraph;
                                            }
                                        }

                                        myGraph = theirGraph;
                                        totalGraphs--;
                                    }
                                } else {
                                    // This graph is new
                                    graph[moveCharacter.getName()] = myGraph;
                                    handled[moveCharacter.getName()] = true;
                                    buildGraph(moveCharacter, newX, newY);
                                }
                            }
                        });
                    }
                    buildGraph(character, x, y);
                }

                // Handle move stats
                if(character.canMove(DIR_RIGHT)) {
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

                if(character.canMove(DIR_DOWN)) {
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

                if(character.canMove(DIR_LEFT)) {
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

                if(character.canMove(DIR_UP)) {
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
    }

    // Calculate how many unique vehicle graphs there are
    var vehicleGraphTotal = 0;
    var vehicleGraphs = {};

    function checkVehicleGraph(veh) {
        if(handled[veh]) {
            var vehGraphNum = graph[veh];
            if(!vehicleGraphs[vehGraphNum]) {
                vehicleGraphs[vehGraphNum] = true;
                vehicleGraphTotal++;
            }
        }
    }

    checkVehicleGraph(VEHICLE_PLANE.getName());
    checkVehicleGraph(VEHICLE_CAR.getName());
    checkVehicleGraph(VEHICLE_BOAT.getName());


    return {
        total: total,
        unique: unique,
        vehicle: vehicle,
        miss: miss,
        totalGraphs: totalGraphs,
        vehicleGraphTotal: vehicleGraphTotal
    }
}

/*
    Useful vars
*/

// Arrays of characters
var goodCharacters = [];
var badCharacters = [];

// Stats on all the characters
var stats = [];

/*
    Data sorting
*/

function prepareData() {
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
}

/*
    Proccessor function
*/

function processData(pool, callback) {
    // Reset our stats store
    stats = [];

    // Used for progress updating
    var totalPermutations = 1;
    var totalDone = 0;
    var checkIncease = 0.05;
    for(var i=2; i<=9; ++i) {
        totalPermutations *= i;
    }

    var usedChars = [];
    var outStanding = [];
    function permute(input, noRecursion) {
        var i, j, ch;
        for (i=0; i<input.length; ++i) {
            ch = input.splice(i, 1)[0];
            usedChars.push(ch);
            if (input.length == 0) {
                var res = usedChars.slice();

                // Store as something that needs to be done
                outStanding.push(res);
            }
            permute(input);
            input.splice(i, 0, ch);
            usedChars.pop();
        }
    };

    // Build permutations
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

    var board = new Board();
    function asyncProcessStats() {
        var totalLeft = 5000;
        while(outStanding.length && totalLeft--) {
            // Grab data
            var res = outStanding.pop();

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

            ++totalDone;
        }

        // Check if we should print progress
        $('#progress').text(Math.floor(totalDone/totalPermutations*100) + '% (' + totalDone + ' / ' + totalPermutations) + ')';

        if(outStanding.length > 0) {
            // More work to do
            setTimeout(asyncProcessStats, 0);
        } else {
            // Done!
            callback();
        }
    }

    // Begin async stat calculation
    asyncProcessStats();
}

/*
    Data Sorting
*/

function sortData() {
    stats.sort(function(a, b) {
        if(a.totalGraphs != b.totalGraphs) return b.totalGraphs - a.totalGraphs;
        if(a.vehicleGraphTotal != b.vehicleGraphTotal) return a.vehicleGraphTotal - b.vehicleGraphTotal;
        if(a.miss != b.miss) return b.miss - a.miss;
        if(a.unique != b.unique) return a.unique - b.unique;
        if(a.total != b.total) return a.total - b.total;
        if(a.vehicle != b.vehicle) return a.vehicle - b.vehicle;

        return 0;
    });
}

/*
    Result UI
*/

function buildResultUI(pool) {
    // Board used to display stuff
    var board = new Board();

    // Displays the given result
    function displayResult(pickNum) {
        var winnerStats = stats[pickNum];
        var winnerState = winnerStats.state;
        var winnerPos = winnerStats.pos;
        for(var i=0; i<9; ++i) {
            board.setCharacterSlot(i, pool[winnerState[i]]);
        }
        board.pickSlot(winnerPos);

        board.display($('#content'));

        var statsPan = $('#stats');
        statsPan.empty();

        statsPan.append('<b>Graphs:</b> ' + winnerStats.totalGraphs + '<br>');
        statsPan.append('<b>vehicle Graphs:</b> ' + winnerStats.vehicleGraphTotal + '<br>');
        statsPan.append('<b>Miss:</b> ' + winnerStats.miss + '<br>');
        statsPan.append('<b>Unique:</b> ' + winnerStats.unique + '<br>');
        statsPan.append('<b>Total:</b> ' + winnerStats.total + '<br>');
        statsPan.append('<b>Vehicle:</b> ' + winnerStats.vehicle);
    }

    displayResult(0);

    var controls = $('#controls');

    var slider = $('<div>')
    controls.append(slider);
    slider.slider({min:0, max:stats.length-1, step:1, slide: function( event, ui ) {
        displayResult(ui.value);
    }});
}

/*
    Main program
*/

// When everything is ready, do things
$(document).ready(function(){
    // Prepare the data for use
    prepareData();

    function doit(dataSet) {
        // Process the data
        processData(dataSet, function() {
            // Sort the data
            $('#progress').text('Sorting data...');
            setTimeout(function() {
                sortData();
                $('#progress').text('');

                // Build the UI
                buildResultUI(dataSet);
            }, 0)
        });
    }

    $('#good').click(function() {
        doit(goodCharacters);
    });

    $('#bad').click(function() {
        doit(badCharacters);
    });

    // Put in a temp board
    var board = new Board();
    board.display($('#content'));
    delete board;
});
