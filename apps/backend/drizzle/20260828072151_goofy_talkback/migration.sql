CREATE TABLE `employee_vacation_adjustments` (
	`id` binary(16) PRIMARY KEY,
	`employee_id` binary(16) NOT NULL,
	`reference_year` int NOT NULL,
	`period` varchar(20) NOT NULL,
	`days_delta` int NOT NULL,
	`reason` varchar(500) NOT NULL,
	`created_by` binary(16) NOT NULL,
	`created_at` datetime(6) NOT NULL DEFAULT (CURRENT_TIMESTAMP(6)),
	CONSTRAINT `employee_vacation_adjustments_employee_fk` FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`),
	CONSTRAINT `employee_vacation_adjustments_created_by_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`),
	CONSTRAINT `employee_vacation_adjustments_year_check` CHECK(`employee_vacation_adjustments`.`reference_year` BETWEEN 2000 AND 2100),
	CONSTRAINT `employee_vacation_adjustments_period_check` CHECK(`employee_vacation_adjustments`.`period` IN ('FIRST', 'SECOND')),
	CONSTRAINT `employee_vacation_adjustments_delta_check` CHECK(`employee_vacation_adjustments`.`days_delta` BETWEEN -10 AND 10 AND `employee_vacation_adjustments`.`days_delta` <> 0)
);
--> statement-breakpoint
CREATE INDEX `employee_vacation_adjustments_balance_index` ON `employee_vacation_adjustments` (`employee_id`,`reference_year`,`period`,`created_at`);--> statement-breakpoint
CREATE INDEX `employee_vacation_adjustments_actor_index` ON `employee_vacation_adjustments` (`created_by`,`created_at`);