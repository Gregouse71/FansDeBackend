import { randomUUIDv7 } from "bun"

//Initialisation BDD
//import 'dotenv/config';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { gameTable } from "./src/db/schema";
import { eq } from "drizzle-orm";

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

// class game_obj{
// 	/**
// 	 * 0 : waiting for the users to connect\
// 	 * 1 : running\
// 	 * 2 : finished
// 	 */
// 	status;
// 	constructor(){
// 		this.gameId = randomUUIDv7();

// 		this.p0token= randomUUIDv7();
// 		this.p1token= randomUUIDv7();
// 		this.p0connected = false;
// 		this.p1connected = false;

// 		this.status = 1;

// 		this.gameData = createBlankGame();
// 	}
// }

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
 * Return the game datas associated with this ID.
 * @param {string} gameId The id of the game you want to retrieve
 * @returns The game object associated with it (not the times, nor the connection status)
 */
async function getGameData(gameId) {
	db.update(gameTable)
		.set({ lastActionTime: Date.now() })
		.where(eq(gameTable.id, gameId))

	var { game_data } =
		(
			await db.select({ game_data: gameTable.game_data })
				.from(gameTable)
				.where(eq(gameTable.id, gameId))
		)[0];
	return game_data;
}


console.log("Defined smoothly")


///////////////////////////
///////// TESTS ///////////
///////////////////////////

//var id = await createGameInstance();
console.log("Instance créée avec ID $id");
console.log(JSON.stringify(createBlankGame()))
const testRead = await getGameData("0196f8d6-582f-7000-9d15-d208a97d25fd")
console.log(testRead)
console.log(typeof (testRead.currPlay))