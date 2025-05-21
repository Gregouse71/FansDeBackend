CREATE TABLE `game_table` (
	`_id_db` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`id` text,
	`startTime` integer,
	`lastActionTime` integer,
	`status` integer,
	`private` integer DEFAULT true,
	`game_obj` blob
);
--> statement-breakpoint
CREATE UNIQUE INDEX `game_table_id_unique` ON `game_table` (`id`);