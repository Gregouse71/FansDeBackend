Petit jeu :
Devinez pourquoi ces erreurs surviennent 

```15 |   logger;
16 |   exec(query) {
17 |     this.client.exec(query);
18 |   }
19 |   prepareQuery(query, fields, executeMethod, isResponseInArrayMode, customResultMapper) {
20 |     const stmt = this.client.prepare(query.sql);
                                  ^
SQLiteError: near "=": syntax error```

Et bien là, c'est que j'avais fait une requête sur une colonne qui n'existait pas.