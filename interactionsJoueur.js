import { getGameData, setGameData } from "./gestionParties";


export function createBlankGame() {
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