CREATE TABLE `offices` (
	`id` binary(16) PRIMARY KEY,
	`code` varchar(50) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` varchar(355),
	`municipality` varchar(100),
	`address` varchar(255),
	`is_active` boolean NOT NULL DEFAULT true,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` datetime(6) NOT NULL DEFAULT (CURRENT_TIMESTAMP(6)),
	`updated_at` datetime(6) NOT NULL DEFAULT (CURRENT_TIMESTAMP(6)),
	CONSTRAINT `offices_code_unique` UNIQUE INDEX(`code`)
);
--> statement-breakpoint
INSERT INTO `offices` (`id`, `code`, `name`, `description`, `municipality`, `address`, `is_active`, `sort_order`)
VALUES
	(UNHEX('019953f0000070008000000000000001'), 'ORGRO', 'Oficina de Representación en Guerrero', NULL, 'Acapulco de Juárez', NULL, true, 10),
	(UNHEX('019953f0000070008000000000000002'), 'ORLACAPULCO', 'Oficina Local Acapulco', NULL, 'Acapulco de Juárez', NULL, true, 20),
	(UNHEX('019953f0000070008000000000000003'), 'ORCHILPANCINGO', 'Oficina Local Chilpancingo', NULL, 'Chilpancingo de los Bravo', NULL, true, 30),
	(UNHEX('019953f0000070008000000000000004'), 'ORZIHUATANEJO', 'Oficina Local Zihuatanejo', NULL, 'Zihuatanejo de Azueta', NULL, true, 40);
--> statement-breakpoint
ALTER TABLE `employee_assignments` DROP CONSTRAINT `employee_assignments_organizational_unit_id_fk`;--> statement-breakpoint
ALTER TABLE `organizational_units` DROP CONSTRAINT `organizational_units_parent_id_fk`;--> statement-breakpoint
DROP INDEX `organizational_units_parent_id_index` ON `organizational_units`;--> statement-breakpoint
DROP INDEX `organizational_units_is_active_sort_order_index` ON `organizational_units`;--> statement-breakpoint
ALTER TABLE `users` ADD `office_id` binary(16);--> statement-breakpoint
ALTER TABLE `employee_assignments` ADD `office_id` binary(16);--> statement-breakpoint
ALTER TABLE `organizational_units` ADD `office_id` binary(16);--> statement-breakpoint
ALTER TABLE `positions` ADD `office_id` binary(16);--> statement-breakpoint
UPDATE `users` SET `office_id` = UNHEX('019953f0000070008000000000000001') WHERE `office_id` IS NULL;--> statement-breakpoint
UPDATE `employee_assignments` SET `office_id` = UNHEX('019953f0000070008000000000000001') WHERE `office_id` IS NULL;--> statement-breakpoint
UPDATE `organizational_units` SET `office_id` = UNHEX('019953f0000070008000000000000001') WHERE `office_id` IS NULL;--> statement-breakpoint
UPDATE `positions` SET `office_id` = UNHEX('019953f0000070008000000000000001') WHERE `office_id` IS NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY `office_id` binary(16) NOT NULL;--> statement-breakpoint
ALTER TABLE `employee_assignments` MODIFY `office_id` binary(16) NOT NULL;--> statement-breakpoint
ALTER TABLE `organizational_units` MODIFY `office_id` binary(16) NOT NULL;--> statement-breakpoint
ALTER TABLE `positions` MODIFY `office_id` binary(16) NOT NULL;--> statement-breakpoint
CREATE INDEX `users_office_id_is_active_index` ON `users` (`office_id`,`is_active`);--> statement-breakpoint
CREATE INDEX `employee_assignments_office_dates_index` ON `employee_assignments` (`office_id`,`effective_from`,`effective_to`);--> statement-breakpoint
CREATE UNIQUE INDEX `organizational_units_id_office_unique` ON `organizational_units` (`id`,`office_id`);--> statement-breakpoint
CREATE INDEX `organizational_units_parent_office_index` ON `organizational_units` (`parent_id`,`office_id`);--> statement-breakpoint
CREATE INDEX `organizational_units_office_active_sort_index` ON `organizational_units` (`office_id`,`is_active`,`sort_order`);--> statement-breakpoint
CREATE UNIQUE INDEX `positions_id_office_unique` ON `positions` (`id`,`office_id`);--> statement-breakpoint
CREATE INDEX `positions_office_active_index` ON `positions` (`office_id`,`is_active`);--> statement-breakpoint
CREATE INDEX `offices_active_sort_index` ON `offices` (`is_active`,`sort_order`);--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_office_id_offices_id_fk` FOREIGN KEY (`office_id`) REFERENCES `offices`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;--> statement-breakpoint
ALTER TABLE `employee_assignments` ADD CONSTRAINT `employee_assignments_office_id_fk` FOREIGN KEY (`office_id`) REFERENCES `offices`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;--> statement-breakpoint
ALTER TABLE `employee_assignments` ADD CONSTRAINT `employee_assignments_unit_office_fk` FOREIGN KEY (`organizational_unit_id`,`office_id`) REFERENCES `organizational_units`(`id`,`office_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;--> statement-breakpoint
ALTER TABLE `organizational_units` ADD CONSTRAINT `organizational_units_office_id_fk` FOREIGN KEY (`office_id`) REFERENCES `offices`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;--> statement-breakpoint
ALTER TABLE `organizational_units` ADD CONSTRAINT `organizational_units_parent_office_fk` FOREIGN KEY (`parent_id`,`office_id`) REFERENCES `organizational_units`(`id`,`office_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;--> statement-breakpoint
ALTER TABLE `positions` ADD CONSTRAINT `positions_office_id_fk` FOREIGN KEY (`office_id`) REFERENCES `offices`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;--> statement-breakpoint
ALTER TABLE `employee_assignments` DROP CONSTRAINT `employee_assignments_position_id_fk`;--> statement-breakpoint
ALTER TABLE `employee_assignments` ADD CONSTRAINT `employee_assignments_position_office_fk` FOREIGN KEY (`position_id`,`office_id`) REFERENCES `positions`(`id`,`office_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
