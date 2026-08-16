INSERT INTO `document_types` (
	`id`, `code`, `name`, `description`, `is_active`, `sort_order`
) VALUES (
	UNHEX('019c0000000070008000000000000001'),
	'OFICIO_COMISION',
	'Oficio de comisión',
	'Oficio opcional que respalda una incidencia de tipo Comisión.',
	true,
	10
)
ON DUPLICATE KEY UPDATE
	`name` = VALUES(`name`),
	`description` = VALUES(`description`),
	`is_active` = VALUES(`is_active`),
	`sort_order` = VALUES(`sort_order`);
