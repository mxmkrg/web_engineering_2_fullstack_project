CREATE TABLE `workout_set` (
	`id` integer PRIMARY KEY NOT NULL,
	`workout_exercise_id` integer NOT NULL,
	`set_number` integer NOT NULL,
	`reps` integer,
	`weight` real,
	`completed` integer DEFAULT true NOT NULL,
	`notes` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`workout_exercise_id`) REFERENCES `workout_exercise`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `exercise` ADD `muscle_groups` text NOT NULL;--> statement-breakpoint
ALTER TABLE `exercise` ADD `equipment` text;--> statement-breakpoint
ALTER TABLE `user` ADD `role` text DEFAULT 'user' NOT NULL;--> statement-breakpoint
ALTER TABLE `workout` ADD `status` text DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE `workout_exercise` ADD `order` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `workout_exercise` DROP COLUMN `sets`;--> statement-breakpoint
ALTER TABLE `workout_exercise` DROP COLUMN `reps`;--> statement-breakpoint
ALTER TABLE `workout_exercise` DROP COLUMN `weight`;--> statement-breakpoint
ALTER TABLE `workout_exercise` DROP COLUMN `duration`;--> statement-breakpoint
ALTER TABLE `workout_exercise` DROP COLUMN `distance`;--> statement-breakpoint
ALTER TABLE `workout_exercise` DROP COLUMN `rest_time`;