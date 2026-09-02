ALTER TABLE `incidents` MODIFY COLUMN `employee_assignment_id` binary(16);--> statement-breakpoint
ALTER TABLE `employees` ADD `office_id` binary(16);--> statement-breakpoint
UPDATE `employees` AS `employee`
SET `employee`.`office_id` = COALESCE(
	(
		SELECT `assignment`.`office_id`
		FROM `employee_assignments` AS `assignment`
		WHERE `assignment`.`employee_id` = `employee`.`id`
		ORDER BY `assignment`.`effective_from` DESC, `assignment`.`created_at` DESC
		LIMIT 1
	),
	UNHEX('019953f0000070008000000000000001')
)
WHERE `employee`.`office_id` IS NULL;--> statement-breakpoint
ALTER TABLE `employees` MODIFY COLUMN `office_id` binary(16) NOT NULL;--> statement-breakpoint
CREATE INDEX `employees_office_id_index` ON `employees` (`office_id`);--> statement-breakpoint
ALTER TABLE `employees` ADD CONSTRAINT `employees_office_id_fk` FOREIGN KEY (`office_id`) REFERENCES `offices`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
