SET @drop_unit_fk = IF(
  EXISTS(
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_schema = DATABASE()
      AND table_name = 'employee_assignments'
      AND constraint_name = 'employee_assignments_unit_office_fk'
  ),
  'ALTER TABLE `employee_assignments` DROP FOREIGN KEY `employee_assignments_unit_office_fk`',
  'SELECT 1'
);--> statement-breakpoint
PREPARE drop_unit_fk FROM @drop_unit_fk;--> statement-breakpoint
EXECUTE drop_unit_fk;--> statement-breakpoint
DEALLOCATE PREPARE drop_unit_fk;--> statement-breakpoint
SET @drop_position_fk = IF(EXISTS(SELECT 1 FROM information_schema.table_constraints WHERE constraint_schema = DATABASE() AND table_name = 'employee_assignments' AND constraint_name = 'employee_assignments_position_office_fk'), 'ALTER TABLE `employee_assignments` DROP FOREIGN KEY `employee_assignments_position_office_fk`', 'SELECT 1');--> statement-breakpoint
PREPARE drop_position_fk FROM @drop_position_fk;--> statement-breakpoint
EXECUTE drop_position_fk;--> statement-breakpoint
DEALLOCATE PREPARE drop_position_fk;--> statement-breakpoint
SET @drop_unit_office_fk = IF(EXISTS(SELECT 1 FROM information_schema.table_constraints WHERE constraint_schema = DATABASE() AND table_name = 'organizational_units' AND constraint_name = 'organizational_units_office_id_fk'), 'ALTER TABLE `organizational_units` DROP FOREIGN KEY `organizational_units_office_id_fk`', 'SELECT 1');--> statement-breakpoint
PREPARE drop_unit_office_fk FROM @drop_unit_office_fk;--> statement-breakpoint
EXECUTE drop_unit_office_fk;--> statement-breakpoint
DEALLOCATE PREPARE drop_unit_office_fk;--> statement-breakpoint
SET @drop_parent_fk = IF(EXISTS(SELECT 1 FROM information_schema.table_constraints WHERE constraint_schema = DATABASE() AND table_name = 'organizational_units' AND constraint_name = 'organizational_units_parent_office_fk'), 'ALTER TABLE `organizational_units` DROP FOREIGN KEY `organizational_units_parent_office_fk`', 'SELECT 1');--> statement-breakpoint
PREPARE drop_parent_fk FROM @drop_parent_fk;--> statement-breakpoint
EXECUTE drop_parent_fk;--> statement-breakpoint
DEALLOCATE PREPARE drop_parent_fk;--> statement-breakpoint
SET @drop_position_office_fk = IF(EXISTS(SELECT 1 FROM information_schema.table_constraints WHERE constraint_schema = DATABASE() AND table_name = 'positions' AND constraint_name = 'positions_office_id_fk'), 'ALTER TABLE `positions` DROP FOREIGN KEY `positions_office_id_fk`', 'SELECT 1');--> statement-breakpoint
PREPARE drop_position_office_fk FROM @drop_position_office_fk;--> statement-breakpoint
EXECUTE drop_position_office_fk;--> statement-breakpoint
DEALLOCATE PREPARE drop_position_office_fk;--> statement-breakpoint
DROP INDEX `organizational_units_id_office_unique` ON `organizational_units`;--> statement-breakpoint
DROP INDEX `organizational_units_parent_office_index` ON `organizational_units`;--> statement-breakpoint
DROP INDEX `organizational_units_office_active_sort_index` ON `organizational_units`;--> statement-breakpoint
DROP INDEX `positions_id_office_unique` ON `positions`;--> statement-breakpoint
DROP INDEX `positions_office_active_index` ON `positions`;--> statement-breakpoint
CREATE INDEX `organizational_units_parent_index` ON `organizational_units` (`parent_id`);--> statement-breakpoint
CREATE INDEX `organizational_units_active_sort_index` ON `organizational_units` (`is_active`,`sort_order`);--> statement-breakpoint
ALTER TABLE `employee_assignments` ADD CONSTRAINT `employee_assignments_unit_id_fk` FOREIGN KEY (`organizational_unit_id`) REFERENCES `organizational_units`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;--> statement-breakpoint
ALTER TABLE `employee_assignments` ADD CONSTRAINT `employee_assignments_position_id_fk` FOREIGN KEY (`position_id`) REFERENCES `positions`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;--> statement-breakpoint
ALTER TABLE `organizational_units` ADD CONSTRAINT `organizational_units_parent_id_fk` FOREIGN KEY (`parent_id`) REFERENCES `organizational_units`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;--> statement-breakpoint
ALTER TABLE `organizational_units` DROP COLUMN `office_id`;--> statement-breakpoint
ALTER TABLE `positions` DROP COLUMN `office_id`;
