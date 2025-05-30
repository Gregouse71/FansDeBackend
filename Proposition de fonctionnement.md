# Proposition de fonctionnement

## Une gestion de plusieurs partie - Mathis

une creation de partie, genre
navale.com/create
Qui crée l'id de partie puis y redirige

Un id de partie, qu'on trouve dans l'URL, genre
navale.com/play/{gameID}
Avec une commande d'API
navale.com/play/{gameID}/join
Qui nous ajoute un petit cookie pour nous identifier en tant que joueur 0 ou 1 (cookie tiré au hasard pour pas qu'on se fasse passer pour l'autre), puis nous redirige éventuellement vers la page sans le /join. Ou bien juste on met pas le join dans l'URL (je me disais que peut-être on pourrait faire un /view pour des spectateurs, mais flemme)

naval.com/{gameID}/quit
Libère le jeton de joueur pour pouvoir se connecter sur autre chose.


### Propal d'implém :
Un objet
```js
game_obj =
{
	gameId: str,
	startTime: time,
	lastActionTime: time, //Pour enveler les parties abandonnée
	status: running | waiting | finished
	//waiting : un joueur n'est pas connecté
	//running : ils sont en train de jouer
	p0token: str,
	p0connected: bool,
	p1token: str,
	p1connected: bool:

	gameData: //Que qqun se débrouille pour faire ça je prends pas ce job
}
```
Je pensais faire une fonction
```js
// Mathis - DONE
function createGame(gameDataCreator) -> gameID
//Ou game_data_creator est une fonction que j'appelle sans argument pour instancier gameData

// Zéphyr
function join(request, gameID) -> TODO //Faut que celui qui fait la partie serveur dessous me dise comment il veut faire parce que là le but est de faire un setcookie.
//Après ça peut être une redirection, une page direct, jsp moi.

// Zéphyr
function getPlayer(request, gameID) -> 0|1|none
// selon les valeurs des cookies que j'ai mis
// none si le cookie n'est pas reconnu

//DONE
function getGameplayData(gameID) -> game_data | Error
//raise GameNotFound si je ne trouve pas la partie
//DONE
function getGame(gameID) -> game_obj | Error
//raise GameNotFound si pas existante
//Warning : utilisez pas ça sans m'en parler, et surtout pas pour y écrire
//Mathis - DONE
function setGameData(gameId, new_game_data) -> void


// Grégoire
function fire(request, gameID)
//A appeler systématiquement lorsqu'il y a une activité
//sur une partie pour pas que je la mette à la poubelle
function bomb()
function radar()

// Zéphyr
function putship()

//
function quit(request, gameID)

// Zéphyr
function markFinished(gameID)
//A appeler au bon moment pour que je puisse jeter le truc quand c'est fini.
```




### Limitation
* Ca ne permet pas de jouer plusieurs parties sur le même appareil. Si cette fonctionnalité est nécessaire je chercherai
* En cas de déconnecion intempestive, sans appel à quit, ça ne permet pas de se reconnecter.

## Une gestion du jeu
Gère les actions, les tirs, répond si c'est dans l'eau, touché, coulé, gagné, etc...

## Une partie serveur
Il gère les `Bun.serve`, s'arrange pour respecter la doc de l'API, voire l'écrire. Il appel les fonctions faite précédemment.
Faut qu'il me dise comment faire la fonction `join` parce que je veux y mettre un setcookie.

## Un frontend ???
Gustave en avait envie, donc je l'ai mis là.
Il se débrouille avec l'API lui
