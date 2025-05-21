import { datetime, time } from "drizzle-orm/mysql-core";
import { blob, int, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const gameTable = sqliteTable("game_table", {
  _id_db: int().primaryKey({ autoIncrement: true }),
  id: text().unique(),

  startTime: integer(),//Timestamp en ms, comme retourné par "Date.now()"
  lastActionTime:integer(),//Timestamp en ms
  	/**
	 * 0 : waiting for the users to connect\
	 * 1 : running\
	 * 2 : finished
	 */
  status: integer(),
  private: integer({mode: 'boolean'}).default(true),

  p0token: text().notNull(),
  p1token: text().notNull(),
  p0connected: integer({mode:'boolean'}).default(false),
  p1connected: integer({mode:'boolean'}).default(false),

  game_data: blob(),
});