CREATE TABLE `employee_assignments` (
	`id` binary(16) PRIMARY KEY,
	`employee_id` binary(16) NOT NULL,
	`organizational_unit_id` binary(16) NOT NULL,
	`position_id` binary(16) NOT NULL,
	`appointment_type` varchar(30) NOT NULL,
	`schedule` varchar(150),
	`effective_from` date NOT NULL,
	`effective_to` date,
	`notes` text,
	`created_at` datetime(6) NOT NULL DEFAULT (CURRENT_TIMESTAMP(6)),
	`updated_at` datetime(6) NOT NULL DEFAULT (CURRENT_TIMESTAMP(6)),
	CONSTRAINT `employee_assignments_id_employee_id_unique` UNIQUE INDEX(`id`,`employee_id`),
	CONSTRAINT `employee_assignments_appointment_type_check` CHECK(`employee_assignments`.`appointment_type` IN ('BASE', 'CONFIANZA')),
	CONSTRAINT `employee_assignments_effective_dates_check` CHECK(
        `employee_assignments`.`effective_to` IS NULL
        OR `employee_assignments`.`effective_to` >= `employee_assignments`.`effective_from`
      )
);
--> statement-breakpoint
CREATE TABLE `employees` (
	`id` binary(16) PRIMARY KEY,
	`employee_number` varchar(50) NOT NULL,
	`full_name` varchar(200) NOT NULL,
	`hire_date` date,
	`status` varchar(30) NOT NULL DEFAULT 'ACTIVE',
	`created_at` datetime(6) NOT NULL DEFAULT (CURRENT_TIMESTAMP(6)),
	`updated_at` datetime(6) NOT NULL DEFAULT (CURRENT_TIMESTAMP(6)),
	CONSTRAINT `employees_employee_number_unique` UNIQUE INDEX(`employee_number`),
	CONSTRAINT `employees_status_check` CHECK(`employees`.`status` IN ('ACTIVE', 'INACTIVE'))
);
--> statement-breakpoint
CREATE TABLE `organizational_units` (
	`id` binary(16) PRIMARY KEY,
	`parent_id` binary(16),
	`code` varchar(50) NOT NULL,
	`name` varchar(150) NOT NULL,
	`description` varchar(355),
	`is_active` boolean NOT NULL DEFAULT true,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` datetime(6) NOT NULL DEFAULT (CURRENT_TIMESTAMP(6)),
	`updated_at` datetime(6) NOT NULL DEFAULT (CURRENT_TIMESTAMP(6)),
	CONSTRAINT `organizational_units_code_unique` UNIQUE INDEX(`code`)
);
--> statement-breakpoint
CREATE TABLE `positions` (
	`id` binary(16) PRIMARY KEY,
	`code` varchar(50) NOT NULL,
	`name` varchar(150) NOT NULL,
	`description` varchar(355),
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` datetime(6) NOT NULL DEFAULT (CURRENT_TIMESTAMP(6)),
	`updated_at` datetime(6) NOT NULL DEFAULT (CURRENT_TIMESTAMP(6)),
	CONSTRAINT `positions_code_unique` UNIQUE INDEX(`code`)
);
--> statement-breakpoint
ALTER TABLE `roles` MODIFY COLUMN `description` varchar(355);--> statement-breakpoint
CREATE INDEX `employee_assignments_employee_dates_index` ON `employee_assignments` (`employee_id`,`effective_from`,`effective_to`);--> statement-breakpoint
CREATE INDEX `employee_assignments_unit_dates_index` ON `employee_assignments` (`organizational_unit_id`,`effective_from`,`effective_to`);--> statement-breakpoint
CREATE INDEX `employee_assignments_position_id_index` ON `employee_assignments` (`position_id`);--> statement-breakpoint
CREATE INDEX `employees_status_index` ON `employees` (`status`);--> statement-breakpoint
CREATE INDEX `employees_full_name_index` ON `employees` (`full_name`);--> statement-breakpoint
CREATE INDEX `organizational_units_parent_id_index` ON `organizational_units` (`parent_id`);--> statement-breakpoint
CREATE INDEX `organizational_units_is_active_sort_order_index` ON `organizational_units` (`is_active`,`sort_order`);--> statement-breakpoint
CREATE INDEX `positions_is_active_index` ON `positions` (`is_active`);--> statement-breakpoint
ALTER TABLE `employee_assignments` ADD CONSTRAINT `employee_assignments_employee_id_fk` FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;--> statement-breakpoint
ALTER TABLE `employee_assignments` ADD CONSTRAINT `employee_assignments_organizational_unit_id_fk` FOREIGN KEY (`organizational_unit_id`) REFERENCES `organizational_units`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;--> statement-breakpoint
ALTER TABLE `employee_assignments` ADD CONSTRAINT `employee_assignments_position_id_fk` FOREIGN KEY (`position_id`) REFERENCES `positions`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;--> statement-breakpoint
ALTER TABLE `organizational_units` ADD CONSTRAINT `organizational_units_parent_id_fk` FOREIGN KEY (`parent_id`) REFERENCES `organizational_units`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;