import { randomUUIDv7 } from "bun"

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
		currPlay: 1,
		board: [
			[1, 2],
			[2, 3]
		]
	};
}

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
async function setGameData(gameId, new_game_data){
	await db.update(gameTable)
	.set({ lastActionTime: Date.now(),
		game_data: new_game_data
	 })
	.where(eq(gameTable.id, gameId))
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
var new_game_data = {
	truc:[1,2,3],
	chou:"croute"
}
setGameData(id, new_game_data);