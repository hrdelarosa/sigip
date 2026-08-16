CREATE TABLE IF NOT EXISTS `incident_types` (
	`id` binary(16) PRIMARY KEY,
	`code` varchar(50) NOT NULL,
	`name` varchar(150) NOT NULL,
	`description` text,
	`temporal_mode` varchar(30) NOT NULL,
	`appointment_scope` varchar(30) NOT NULL DEFAULT 'ALL',
	`is_active` boolean NOT NULL DEFAULT true,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` datetime(6) NOT NULL DEFAULT (CURRENT_TIMESTAMP(6)),
	`updated_at` datetime(6) NOT NULL DEFAULT (CURRENT_TIMESTAMP(6)),
	CONSTRAINT `incident_types_code_unique` UNIQUE INDEX(`code`),
	INDEX `incident_types_active_sort_index` (`is_active`,`sort_order`),
	CONSTRAINT `incident_types_sort_order_check` CHECK(`sort_order` >= 0)
);
--> statement-breakpoint
SET @migration_sql = IF(
	EXISTS(
		SELECT 1 FROM information_schema.columns
		WHERE table_schema = DATABASE()
			AND table_name = 'incident_types'
			AND column_name = 'temporal_mode'
	),
	'SELECT 1',
	'ALTER TABLE `incident_types` ADD COLUMN `temporal_mode` varchar(30) NULL AFTER `description`'
);
--> statement-breakpoint
PREPARE migration_statement FROM @migration_sql;
--> statement-breakpoint
EXECUTE migration_statement;
--> statement-breakpoint
DEALLOCATE PREPARE migration_statement;
--> statement-breakpoint
UPDATE `incident_types`
SET `temporal_mode` = CASE
	WHEN `code` IN (
		'VACACIONES_PRIMER_PERIODO',
		'VACACIONES_SEGUNDO_PERIODO',
		'VACACIONES_ESTIMULOS'
	) THEN 'MULTIPLE_DATES'
	WHEN `code` IN ('INCAPACIDAD', 'COMISION') THEN 'DATE_RANGE'
	ELSE 'SINGLE_DATE'
END
WHERE `temporal_mode` IS NULL;
--> statement-breakpoint
ALTER TABLE `incident_types`
	MODIFY COLUMN `temporal_mode` varchar(30) NOT NULL;
--> statement-breakpoint
SET @migration_sql = IF(
	EXISTS(
		SELECT 1 FROM information_schema.table_constraints
		WHERE constraint_schema = DATABASE()
			AND table_name = 'incident_types'
			AND constraint_name = 'incident_types_temporal_mode_check'
	),
	'SELECT 1',
	'ALTER TABLE `incident_types` ADD CONSTRAINT `incident_types_temporal_mode_check` CHECK (`temporal_mode` IN (''SINGLE_DATE'', ''MULTIPLE_DATES'', ''DATE_RANGE''))'
);
--> statement-breakpoint
PREPARE migration_statement FROM @migration_sql;
--> statement-breakpoint
EXECUTE migration_statement;
--> statement-breakpoint
DEALLOCATE PREPARE migration_statement;
--> statement-breakpoint
SET @migration_sql = IF(
	EXISTS(
		SELECT 1 FROM information_schema.table_constraints
		WHERE constraint_schema = DATABASE()
			AND table_name = 'incident_types'
			AND constraint_name = 'incident_types_appointment_scope_check'
	),
	'ALTER TABLE `incident_types` DROP CHECK `incident_types_appointment_scope_check`',
	'SELECT 1'
);
--> statement-breakpoint
PREPARE migration_statement FROM @migration_sql;
--> statement-breakpoint
EXECUTE migration_statement;
--> statement-breakpoint
DEALLOCATE PREPARE migration_statement;
--> statement-breakpoint
ALTER TABLE `incident_types`
	ADD CONSTRAINT `incident_types_appointment_scope_check`
	CHECK (`appointment_scope` IN ('ALL', 'BASE', 'CONFIANZA'));
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `incidents` (
	`id` binary(16) PRIMARY KEY,
	`employee_id` binary(16) NOT NULL,
	`employee_assignment_id` binary(16) NOT NULL,
	`incident_type_id` binary(16) NOT NULL,
	`issued_date` date,
	`received_at` datetime(6) NOT NULL,
	`reference_year` int,
	`observations` text,
	`status` varchar(30) NOT NULL DEFAULT 'REGISTERED',
	`registered_by` binary(16) NOT NULL,
	`updated_by` binary(16),
	`cancelled_at` datetime(6),
	`cancelled_by` binary(16),
	`cancellation_reason` text,
	`created_at` datetime(6) NOT NULL DEFAULT (CURRENT_TIMESTAMP(6)),
	`updated_at` datetime(6) NOT NULL DEFAULT (CURRENT_TIMESTAMP(6)),
	INDEX `incidents_employee_status_index` (`employee_id`,`status`),
	INDEX `incidents_type_status_index` (`incident_type_id`,`status`),
	INDEX `incidents_assignment_index` (`employee_assignment_id`),
	INDEX `incidents_status_received_index` (`status`,`received_at`),
	INDEX `incidents_registered_by_created_index` (`registered_by`,`created_at`),
	CONSTRAINT `incidents_employee_id_fk` FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
	CONSTRAINT `incidents_assignment_employee_fk` FOREIGN KEY (`employee_assignment_id`,`employee_id`) REFERENCES `employee_assignments`(`id`,`employee_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
	CONSTRAINT `incidents_assignment_id_fk` FOREIGN KEY (`employee_assignment_id`) REFERENCES `employee_assignments`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
	CONSTRAINT `incidents_incident_type_id_fk` FOREIGN KEY (`incident_type_id`) REFERENCES `incident_types`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
	CONSTRAINT `incidents_registered_by_fk` FOREIGN KEY (`registered_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
	CONSTRAINT `incidents_updated_by_fk` FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
	CONSTRAINT `incidents_cancelled_by_fk` FOREIGN KEY (`cancelled_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
	CONSTRAINT `incidents_status_check` CHECK(`status` IN ('REGISTERED', 'CANCELLED')),
	CONSTRAINT `incidents_cancellation_fields_check` CHECK(
		(`status` = 'REGISTERED' AND `cancelled_at` IS NULL AND `cancelled_by` IS NULL AND `cancellation_reason` IS NULL)
		OR (`status` = 'CANCELLED' AND `cancelled_at` IS NOT NULL AND `cancelled_by` IS NOT NULL AND `cancellation_reason` IS NOT NULL)
	)
);
--> statement-breakpoint
SET @migration_sql = IF(
	EXISTS(
		SELECT 1 FROM information_schema.columns
		WHERE table_schema = DATABASE()
			AND table_name = 'incidents'
			AND column_name = 'issued_date'
	),
	'SELECT 1',
	'ALTER TABLE `incidents` ADD COLUMN `issued_date` date NULL AFTER `incident_type_id`'
);
--> statement-breakpoint
PREPARE migration_statement FROM @migration_sql;
--> statement-breakpoint
EXECUTE migration_statement;
--> statement-breakpoint
DEALLOCATE PREPARE migration_statement;
--> statement-breakpoint
SET @migration_sql = IF(
	EXISTS(
		SELECT 1 FROM information_schema.columns
		WHERE table_schema = DATABASE()
			AND table_name = 'incidents'
			AND column_name = 'reference_year'
	),
	'SELECT 1',
	'ALTER TABLE `incidents` ADD COLUMN `reference_year` int NULL AFTER `received_at`'
);
--> statement-breakpoint
PREPARE migration_statement FROM @migration_sql;
--> statement-breakpoint
EXECUTE migration_statement;
--> statement-breakpoint
DEALLOCATE PREPARE migration_statement;
--> statement-breakpoint
SET @migration_sql = IF(
	EXISTS(
		SELECT 1 FROM information_schema.columns
		WHERE table_schema = DATABASE()
			AND table_name = 'incidents'
			AND column_name = 'format_date'
	),
	'UPDATE `incidents` SET `issued_date` = `format_date` WHERE `issued_date` IS NULL',
	'SELECT 1'
);
--> statement-breakpoint
PREPARE migration_statement FROM @migration_sql;
--> statement-breakpoint
EXECUTE migration_statement;
--> statement-breakpoint
DEALLOCATE PREPARE migration_statement;
--> statement-breakpoint
SET @migration_sql = IF(
	EXISTS(
		SELECT 1 FROM information_schema.columns
		WHERE table_schema = DATABASE()
			AND table_name = 'incidents'
			AND column_name = 'format_date'
	),
	'ALTER TABLE `incidents`
		MODIFY COLUMN `format_date` date NULL,
		MODIFY COLUMN `organizational_unit_code_snapshot` varchar(50) NULL,
		MODIFY COLUMN `organizational_unit_name_snapshot` varchar(150) NULL,
		MODIFY COLUMN `position_code_snapshot` varchar(50) NULL,
		MODIFY COLUMN `position_name_snapshot` varchar(150) NULL,
		MODIFY COLUMN `appointment_type_snapshot` varchar(30) NULL',
	'SELECT 1'
);
--> statement-breakpoint
PREPARE migration_statement FROM @migration_sql;
--> statement-breakpoint
EXECUTE migration_statement;
--> statement-breakpoint
DEALLOCATE PREPARE migration_statement;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `incident_occurrences` (
	`id` binary(16) PRIMARY KEY,
	`incident_id` binary(16) NOT NULL,
	`start_date` date NOT NULL,
	`end_date` date,
	`normalized_end_date` date GENERATED ALWAYS AS (coalesce(`end_date`, `start_date`)) STORED NOT NULL,
	`created_at` datetime(6) NOT NULL DEFAULT (CURRENT_TIMESTAMP(6)),
	CONSTRAINT `incident_occurrences_unique_dates` UNIQUE INDEX(`incident_id`,`start_date`,`normalized_end_date`),
	INDEX `incident_occurrences_dates_index` (`start_date`,`end_date`),
	CONSTRAINT `incident_occurrences_dates_check` CHECK(`end_date` IS NULL OR `end_date` >= `start_date`),
	CONSTRAINT `incident_occurrences_incident_id_fk` FOREIGN KEY (`incident_id`) REFERENCES `incidents`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `document_types` (
	`id` binary(16) PRIMARY KEY,
	`code` varchar(50) NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` varchar(500),
	`is_active` boolean NOT NULL DEFAULT true,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` datetime(6) NOT NULL DEFAULT (CURRENT_TIMESTAMP(6)),
	`updated_at` datetime(6) NOT NULL DEFAULT (CURRENT_TIMESTAMP(6)),
	CONSTRAINT `document_types_code_unique` UNIQUE INDEX(`code`),
	INDEX `document_types_active_sort_index` (`is_active`,`sort_order`),
	CONSTRAINT `document_types_sort_order_check` CHECK(`sort_order` >= 0)
);
--> statement-breakpoint
INSERT INTO `document_types` (
	`id`, `code`, `name`, `description`, `is_active`, `sort_order`
) VALUES (
	UNHEX('01a000f8a78b74de9c2f4fa22afc996e'),
	'FORMATO_INCIDENCIA',
	'Formato de incidencia',
	'Formato institucional asociado al registro de una incidencia.',
	true,
	0
)
ON DUPLICATE KEY UPDATE
	`name` = VALUES(`name`),
	`description` = VALUES(`description`),
	`is_active` = VALUES(`is_active`),
	`sort_order` = VALUES(`sort_order`);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `documents` (
	`id` binary(16) PRIMARY KEY,
	`incident_id` binary(16) NOT NULL,
	`document_type_id` binary(16) NOT NULL,
	`original_name` varchar(255) NOT NULL,
	`stored_name` varchar(255) NOT NULL,
	`storage_path` varchar(1000) NOT NULL,
	`mime_type` varchar(150) NOT NULL,
	`size_bytes` bigint unsigned NOT NULL,
	`content_hash` char(64),
	`uploaded_by` binary(16) NOT NULL,
	`created_at` datetime(6) NOT NULL DEFAULT (CURRENT_TIMESTAMP(6)),
	`deleted_at` datetime(6),
	`deleted_by` binary(16),
	`deletion_reason` varchar(500),
	CONSTRAINT `documents_stored_name_unique` UNIQUE INDEX(`stored_name`),
	INDEX `documents_incident_deleted_index` (`incident_id`,`deleted_at`),
	INDEX `documents_document_type_index` (`document_type_id`),
	INDEX `documents_uploaded_by_created_index` (`uploaded_by`,`created_at`),
	CONSTRAINT `documents_incident_id_fk` FOREIGN KEY (`incident_id`) REFERENCES `incidents`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
	CONSTRAINT `documents_document_type_id_fk` FOREIGN KEY (`document_type_id`) REFERENCES `document_types`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
	CONSTRAINT `documents_uploaded_by_fk` FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
	CONSTRAINT `documents_deleted_by_fk` FOREIGN KEY (`deleted_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
	CONSTRAINT `documents_size_bytes_check` CHECK(`size_bytes` >= 0),
	CONSTRAINT `documents_deletion_fields_check` CHECK(
		(`deleted_at` IS NULL AND `deleted_by` IS NULL AND `deletion_reason` IS NULL)
		OR (`deleted_at` IS NOT NULL AND `deleted_by` IS NOT NULL AND `deletion_reason` IS NOT NULL)
	)
);
