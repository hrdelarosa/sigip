CREATE TABLE `permissions` (
	`id` binary(16) PRIMARY KEY,
	`code` varchar(100) NOT NULL,
	`description` varchar(500),
	`created_at` datetime(6) NOT NULL DEFAULT (CURRENT_TIMESTAMP(6)),
	CONSTRAINT `permissions_code_unique` UNIQUE INDEX(`code`)
);
--> statement-breakpoint
CREATE TABLE `role_permissions` (
	`role_id` binary(16) NOT NULL,
	`permissions_id` binary(16) NOT NULL,
	`created_at` datetime(6) NOT NULL DEFAULT (CURRENT_TIMESTAMP(6)),
	CONSTRAINT PRIMARY KEY(`role_id`,`permissions_id`)
);
--> statement-breakpoint
CREATE TABLE `roles` (
	`id` binary(16) PRIMARY KEY,
	`code` varchar(50) NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` varchar(355) NOT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` datetime(6) NOT NULL DEFAULT (CURRENT_TIMESTAMP(6)),
	`updated_at` datetime(6) NOT NULL DEFAULT (CURRENT_TIMESTAMP(6)),
	CONSTRAINT `roles_code_unique` UNIQUE INDEX(`code`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` binary(16) PRIMARY KEY,
	`user_id` binary(16) NOT NULL,
	`token_hash` char(64) NOT NULL,
	`created_at` datetime(6) NOT NULL DEFAULT (CURRENT_TIMESTAMP(6)),
	`last_activity_at` datetime(6) NOT NULL,
	`idle_expires_at` datetime(6) NOT NULL,
	`absolute_expires_at` datetime(6) NOT NULL,
	`revoked_at` datetime(6),
	`revoked_by` binary(16),
	`revoked_reason` varchar(255),
	`ip_address` varchar(45),
	`user_agent` varchar(500),
	CONSTRAINT `sessions_token_hash_unique` UNIQUE INDEX(`token_hash`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` binary(16) PRIMARY KEY,
	`role_id` binary(16) NOT NULL,
	`username` varchar(50) NOT NULL,
	`full_name` varchar(150) NOT NULL,
	`password` varchar(255) NOT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	`last_login_at` datetime(6),
	`created_at` datetime(6) NOT NULL DEFAULT (CURRENT_TIMESTAMP(6)),
	`updated_at` datetime(6) NOT NULL DEFAULT (CURRENT_TIMESTAMP(6)),
	CONSTRAINT `users_username_unique` UNIQUE INDEX(`username`)
);
--> statement-breakpoint
CREATE INDEX `roles_is_active_index` ON `roles` (`is_active`);--> statement-breakpoint
CREATE INDEX `sessions_user_id_revoked_at_absolute_expires_at_index` ON `sessions` (`user_id`,`revoked_at`,`absolute_expires_at`);--> statement-breakpoint
CREATE INDEX `sessions_idle_expires_at_index` ON `sessions` (`idle_expires_at`);--> statement-breakpoint
CREATE INDEX `sessions_absolute_expires_at_index` ON `sessions` (`absolute_expires_at`);--> statement-breakpoint
CREATE INDEX `users_role_id_is_active_index` ON `users` (`role_id`,`is_active`);--> statement-breakpoint
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_role_id_roles_id_fk` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;--> statement-breakpoint
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_permission_id_permissions_id_fk` FOREIGN KEY (`permissions_id`) REFERENCES `permissions`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_revoked_by_users_id_fk` FOREIGN KEY (`revoked_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_role_id_roles_id_fk` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;