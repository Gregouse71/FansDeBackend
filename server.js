import {
	createGameInstance
} from "./gestionParties.js";

const SERVER_PORT = 8080


const internalServerError = new Response("Désolé, ça a crash chez nous", {status:500});

Bun.serve({
	port: SERVER_PORT,
	routes:{
		"/play/create": async () => {
			try {
				const game_id = await createGameInstance();
				return new Response(game_id, {
					body: game_id,
					status:200
				})
			} catch (error) {
				return internalServerError
			}
		}
	}
}
)

console.log(`Le serveur tourne sur le port ${SERVER_PORT}. Bonne journée !`)