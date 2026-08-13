ALTER TABLE `audit_logs` DROP FOREIGN KEY `audit_logs_actor_user_id_users_id_fk`;--> statement-breakpoint
DROP INDEX `audit_logs_actor_user_id_created_at_index` ON `audit_logs`;--> statement-breakpoint
DROP INDEX `audit_logs_entity_type_entity_id_created_at_index` ON `audit_logs`;--> statement-breakpoint
ALTER TABLE `audit_logs`
	RENAME COLUMN `actor_user_id` TO `user_id`,
	RENAME COLUMN `metadata` TO `new_values`,
	ADD COLUMN `session_id` binary(16),
	ADD COLUMN `old_values` json,
	ADD COLUMN `entity_id_binary` binary(16);--> statement-breakpoint
UPDATE `audit_logs`
SET
	`action` = CASE
		WHEN `action` = 'auth.login' THEN 'LOGIN_SUCCEEDED'
		WHEN `action` = 'auth.login_failed' THEN 'LOGIN_FAILED'
		ELSE UPPER(REPLACE(`action`, '.', '_'))
	END,
	`entity_type` = UPPER(`entity_type`),
	`entity_id_binary` = CASE
		WHEN `entity_id` IS NULL THEN NULL
		ELSE UNHEX(REPLACE(`entity_id`, '-', ''))
	END;--> statement-breakpoint
ALTER TABLE `audit_logs`
	DROP COLUMN `entity_id`,
	RENAME COLUMN `entity_id_binary` TO `entity_id`,
	MODIFY COLUMN `created_at` datetime(6) NOT NULL DEFAULT (CURRENT_TIMESTAMP(6));--> statement-breakpoint
CREATE INDEX `audit_logs_entity_type_entity_id_index` ON `audit_logs` (`entity_type`,`entity_id`);--> statement-breakpoint
CREATE INDEX `audit_logs_user_id_created_at_index` ON `audit_logs` (`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `audit_logs_session_id_created_at_index` ON `audit_logs` (`session_id`,`created_at`);--> statement-breakpoint
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;--> statement-breakpoint
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_session_id_sessions_id_fk` FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
