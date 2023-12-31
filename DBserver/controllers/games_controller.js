const { GameModel } = require('../models/games_model'); // Destructure GameModel for direct use
const { GameEventModel } = require('../models/game_events_model'); // Destructure GameModel for direct use

function getAllGames() {
    console.log("+++ GAMES");
    return new Promise((resolve, reject) => {
        GameModel.find({ season: { $gte: 2022 } }) // Use GameModel directly
            .then(result => {
                console.log("RES: ", result);
                resolve(result);
            })
            .catch(error => {
                console.error("Error in getAllGames:", error); // More specific error log
                reject(error);
            });
    });
}

module.exports.getAllGames = getAllGames;

function getAllGamesEvents(game_id) {
    console.log("+++ GAMES EVENT");
    return new Promise((resolve, reject) => {
        GameEventModel.find({ game_id: game_id } ) // Use GameModel directly
            .then(result => {
                console.log("RES: ", result);
                resolve(result);
            })
            .catch(error => {
                console.error("Error in getGamesEvent:", error); // More specific error log
                reject(error);
            });
    });
}

module.exports.getAllGamesEvents = getAllGamesEvents;