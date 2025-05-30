import { randomUUIDv7, sleep } from "bun"

//Initialisation BDD
//import 'dotenv/config';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { gameTable } from "./src/db/schema";
import { eq } from "drizzle-orm";

const GAME_MAX_TIME = 10800;//3h Temps en seconde avant qu'une partie soit fermée depuis sa création
const GAME_MAX_INACTIVITY_TIME = 1200;//20 minutes

const db = drizzle(process.env.DB_FILE_NAME);
//Fin initialisation BDD


function createBlankGame() {
	return {
		currentPlayer: 1,
		boards : [
			{
				board: [
					[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1,],
					[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1,],
					[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1,],
					[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1,],
					[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1,],
					[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1,],
					[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1,],
					[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1,],
					[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1,],
					[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1,],
				],
				ships: [
					[5, [0, 0], 1],  // Porte avion : 5 cases, position de départ, direction du navire
					[4, [0, 0], 1],  // Croiseur
					[3, [0, 0], 1],  // Contre torpilleur 1
					[2, [0, 0], 1],  // Contre torpilleur 2
					[1, [0, 0], 1],  // Torpilleur
				]
			},
			{
				board: [
					[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1,],
					[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1,],
					[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1,],
					[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1,],
					[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1,],
					[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1,],
					[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1,],
					[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1,],
					[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1,],
					[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1,],
				],
				ships: [
					[5, [0, 0], 1],  // Porte avion : 5 cases, position de départ, direction du navire
					[4, [0, 0], 1],  // Croiseur
					[3, [0, 0], 1],  // Contre torpilleur 1
					[2, [0, 0], 1],  // Contre torpilleur 2
					[1, [0, 0], 1],  // Torpilleur
				]
			}
		]
	};
}

/*
Exemple d'état d'un des joueurs
		board: [
			[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1,],
			[-1,  0,  0, -1,  0,  0, -1, -1, -1, -1,],
			[-1, -1, -1, -1, -1, -1, -1, -1,  1, -1,],
			[-1, -1, -1, -1, -1, -1, -1, -1,  1, -1,],
			[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1,],
			[-1, -1, -1, -1,  4, -1, -1, -1, -1, -1,],
			[-1, -1, -1, -1,  4, -1, -1, -1, -1, -1,],
			[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1,],
			[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1,],
			[-1, -1, -1, -1, -1, -1, -1,  3,  3,  3,],
		],
		ships: [
			[4, // Porte avion : a perdu sa case centrale
			2,  // Croiseur    : a perdu toute son avant (ou arrière ?)
			0,  // Contre torpilleur 1 : coulé
			3,  // Contre torpilleur 2 : en pleine santé
			2], // Torpilleur  : en pleine santé
		]
*/


class GameNotFound extends Error {
	constructor(gameId) {
	  super(`Game with ID ${gameId} has not been found in the database.`);
	  this.name = this.constructor.name;
	  this.message = `Game with ID ${gameId} has not been found in the database.`;
	}
  }

/**
 * Create a game in the database, initialized with the content of 
 * `createBlankGame()`.
 * It sets the players token, times and status for later use.
 * @returns `str` : the id of the created Game
 */
async function createGameInstance() {
	let gameId = randomUUIDv7();

	await db.insert(gameTable).values({
		id: gameId,

		startTime: Date.now(),
		lastActionTime: Date.now(),
		/**
		 * 0 : waiting for the users to connect\
		 * 1 : running\
		 * 2 : finished
		 */
		status: 0,

		p0token: randomUUIDv7(),
		p1token: randomUUIDv7(),

		game_data: createBlankGame(),
	}
	)
	return gameId;
}

/**
 * Return the game datas and metadatas associated with this ID. Not to be returned to the user, it contains everything.
 * 
 * _**For internal use only**_
 * @param {string} gameId The id of the game you want to retrieve
 * @returns The game object associated with it with all datas.
 */
async function getGame(gameId) {
	//On mets à jour la date de dernière action pour pouvoir faire le ménage
	//Si cette partie est abandonnée.
	await db.update(gameTable)
		.set({ lastActionTime: Date.now() })
		.where(eq(gameTable.id, gameId))

	var selection = await db.select()
		.from(gameTable)
		.where(eq(gameTable.id, gameId));
	
	if (selection.length == 0){
		throw GameNotFound;
	}else{//Normalement on n'a qu'une seule partie qui marche
		//Avec la façon dont on a fait les ID.
		return selection[0];
	}
}

/**
 * Return the game datas associated with this ID. Not to be returned to the user, it contains all the datas.
 * 
 * _**For internal use only**_
 * @param {string} gameId The id of the game you want to retrieve
 * @returns The game object associated with it (not the times, nor the connection status)
 */
function getGameData(gameId){
	return getGame(gameId).game_data;
}

/**
 * Write the new game data into the database. It overwrite the previous state.
 * @param {string} gameId 
 * @param {object} new_game_data 
 */
async function setGameData(new_game_data, gameId){
	await db.update(gameTable)
	.set({ lastActionTime: Date.now(),
		game_data: new_game_data
	 })
	.where(eq(gameTable.id, gameId))
}



/**
 * Updates the game identified by gameId
 * @param request The information associated with the request, of form {"x": int, "y": int, "player": 1 or 2}
 * @returns The http code and return info
 */
async function fire (request, gameId) {
	let state = await getGameData (gameId);

	let {x, y, player} = request;
	if (!(0 <= x <= 9)  // Si la case n'est pas valide
		|| !(0 <= y <= 9) // Ou si le joueur ne participe pas
		|| (player != state.p0token && player != state.p1token)) {
		return 400, {}  // Bad request
	}

	let player_num = -1;  // On trouve l'indice du joueur
	if (player == state.p0token) {
		player_num = 0
	} else if (player == state.p1token) {
		player_num = 1
	} else {
		return 400, {}  // Bad request
	}

	// Si ce n'est pas à son tour
	if (state.currentPlayer != player_num) {
		return 400, {}  // Bad request
	}

	// Là, on va enfin pouvoir jouer
	state.currentPlayer = 1 - player_num
	let navire_touche = state.boards[player_num].board[x][y]

	// Si on ne touche pas de navire :
	if (navire_touche == -1) {
		setGameData (state, gameId);
		return 200, {"kill": false, "hit": false};  // Plouf
	}

	// Sinon :
	// la case est marquée comme vide
	state.boards[player_num].board[x][y] = -1
	state.boards[player_num].ships[navire_touche] -= 1

	setGameData (state, gameId);
	if (state.boards[player_num].ships[navire_touche][0] == 0) {
		return 200, {"kill": true, "hit": true}
	}
	else {
		return 200, {"kill": false, "hit": true}
	}
}

console.log("Defined smoothly")


///////////////////////////
///////// TESTS ///////////
///////////////////////////

var id = await createGameInstance();
console.log(`Instance créée avec ID ${id}`);
console.log(JSON.stringify(createBlankGame()))
const testRead = await getGame(id)
console.log(testRead)
console.log(testRead.lastActionTime)

//test écriture
// var new_game_data = {
// 	truc:[1,2,3],
// 	chou:"croute"
// }
// setGameData(id, new_game_data);