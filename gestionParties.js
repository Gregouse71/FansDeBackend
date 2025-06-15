import { randomUUIDv7 } from "bun"

//Initialisation BDD
//import 'dotenv/config';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { gameTable } from "./src/db/schema";
import { DrizzleError, eq , lt } from "drizzle-orm";
import { createBlankGame } from "./interactionsJoueur";

//Temps en millisecondes
//Inutilisée const GAME_MAX_TIME = 10800_000;//3h Temps en seconde avant qu'une partie soit fermée depuis sa création
const GAME_MAX_INACTIVITY_TIME = 1200_000;//20 minutes
const DELAY_BETWEEN_CHECK = 60_000;

const db = drizzle(process.env.DB_FILE_NAME);
//Fin initialisation BDD


export class GameNotFound extends Error {
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
export async function createGameInstance() {
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
 * Finds a game in the database, given a fixed game_id
 * 
 * @returns `int` : 0 if the game is found and there is room to join, 
 * 					-1 if the game is not found, 
 * 					-2 if the game is already full
 */
export async function findGameInstance(gameId) {
	const query = await db.select().from(gameTable).where(eq(gameId, gameTable.id))
	if (query.length == 0) return -1;

	if (query.length > 1) throw DrizzleError("There are two active games with the same ID !!");

	const game = query[0];

	if (game.p0connected && game.p1connected) return -2;

	return 0;
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
		.where(eq(gameTable.id, gameId))
	;
	
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
export function getGameData(gameId){
	return getGame(gameId).game_data;
}

/**
 * Write the new game data into the database. It overwrite the previous state.
 * @param {string} gameId 
 * @param {object} new_game_data 
 */
export async function setGameData(new_game_data, gameId){
	await db.update(gameTable)
	.set({ lastActionTime: Date.now(),
		game_data: new_game_data
	 })
	.where(eq(gameTable.id, gameId))
}

async function removeInactiveGames(){
	await db.delete(gameTable)
	.where(lt(
		gameTable.lastActionTime, // <
		Date.now() - GAME_MAX_INACTIVITY_TIME
	));
	console.log("Elagage");
}
//A intervalles fixés, on retire les parties trop vieilles.
setInterval(removeInactiveGames, DELAY_BETWEEN_CHECK);



//console.log("Defined smoothly")


///////////////////////////
///////// TESTS ///////////
///////////////////////////


//Test du stockage en BDD et de la récupération de donénes.

// var id = await createGameInstance();
// console.log(`Instance créée avec ID ${id}`);
// console.log(JSON.stringify(createBlankGame()))
// const testRead = await getGame(id)
// console.log(testRead)
// console.log(testRead.lastActionTime)

//test écriture
// var new_game_data = {
// 	truc:[1,2,3],
// 	chou:"croute"
// }
// setGameData(id, new_game_data);