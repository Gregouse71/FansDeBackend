import {
	createGameInstance,
	findGameInstance
} from "./gestionParties.js";
import {
	fire
} from "./interactionsJoueur.js";

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
				console.log(error);
				return internalServerError;
			}
		},
		"/play/join/:game_id": async (req) => {
			try {
				const game_id = req.params.game_id;
				const status = await findGameInstance(game_id);
				console.log(status)
				switch (status) {
					case 0: {
						return new Response(game_id, {
							body: game_id,
							status:200
						})
					}
					case -1: {
						return new Response("Error, game not found !", {
							body: game_id,
							status:404
						})
					}
					case -2: {
						return new Response("The game you are looking for is full !", {
							body: game_id,
							status:409
						})
					}
				}
			} catch(error) {
				console.log(error)
				return internalServerError;
			}
		},
		"/play/:game_id/fire": async (req) => {
			try {
				const game_id = req.params.game_id;
				let code, body = fire (req, game_id);
				console.log (code, body);
				return new Response ({
					body: body,
					status: code
				});
			} catch(error) {
				console.log(error)
				return internalServerError;
			}
		}
	}
}
)

console.log(`Le serveur tourne sur le port ${SERVER_PORT}. Bonne journée !`)