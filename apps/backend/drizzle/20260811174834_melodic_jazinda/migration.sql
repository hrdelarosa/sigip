CREATE TABLE `audit_logs` (
	`id` binary(16) PRIMARY KEY,
	`actor_user_id` binary(16),
	`action` varchar(100) NOT NULL,
	`entity_type` varchar(100) NOT NULL,
	`entity_id` varchar(36),
	`metadata` json,
	`ip_address` varchar(45),
	`user_agent` varchar(500),
	`created_at` datetime(6) NOT NULL,
	CONSTRAINT `audit_logs_actor_user_id_users_id_fk` FOREIGN KEY (`actor_user_id`) REFERENCES `users`(`id`)
);
--> statement-breakpoint
CREATE INDEX `audit_logs_actor_user_id_created_at_index` ON `audit_logs` (`actor_user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `audit_logs_entity_type_entity_id_created_at_index` ON `audit_logs` (`entity_type`,`entity_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `audit_logs_created_at_index` ON `audit_logs` (`created_at`);
