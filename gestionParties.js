import { randomUUIDv7 } from "bun"

//Initialisation BDD
//import 'dotenv/config';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { gameTable } from "./src/db/schema";

const db = drizzle(process.env.DB_FILE_NAME);
//Fin initialisation BDD


function createBlankGame(){
	return [[1,2],
[3,4]];
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

			game_data: createBlankGame().toString(),
		}
	)
	return gameId;
}

console.log("Defined smoothly")


var id = await createGameInstance();
console.log("Instance créée avec ID $id");
