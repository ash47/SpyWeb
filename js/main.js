/*
    Constants
*/

// Teams
var TEAM_GOOD = 'good';
var TEAM_BAD = 'bad';

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
            var character = this.getCharacter(x, y);

            var charDisplay = $('<div>').attr('class', 'charDisplay').css('background-image', 'url("' + character.getImage(false) + '")').css('background-size', '128px 128px');
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

    // Setup a test board
    var board = new Board();

    for(var x=0; x<=2; ++x) {
        for(var y=0; y<=2; ++y) {
            board.setCharacter(x, y, goodCharacters[x+3*y]);
        }
    }

    board.display($('#content'));

    console.log(board.calcStats());
});
