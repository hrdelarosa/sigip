import { ApiProperty } from '@nestjs/swagger';

const dateProperty = { type: String, format: 'date-time', nullable: true };

export class HealthResponse {
  @ApiProperty({ example: 'ok' }) status!: string;
  @ApiProperty({ example: 'SIGIP Backend' }) service!: string;
  @ApiProperty({ example: '1.0.0' }) version!: string;
  @ApiProperty({ example: '2026-01-01T12:00:00.000Z', format: 'date-time' })
  timestamp!: string;
}

export class UserApiResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ format: 'uuid' }) roleId!: string;
  @ApiProperty({ example: 'jdoe' }) username!: string;
  @ApiProperty({ example: 'Jane Doe' }) fullName!: string;
  @ApiProperty() isActive!: boolean;
  @ApiProperty(dateProperty) lastLoginAt!: string | null;
  @ApiProperty({ ...dateProperty, nullable: false }) createdAt!: string;
  @ApiProperty({ ...dateProperty, nullable: false }) updatedAt!: string;
}

export class PermissionSummaryApiResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ example: 'users:read' }) code!: string;
  @ApiProperty({ nullable: true }) description!: string | null;
}

export class RoleApiResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ example: 'ADMIN' }) code!: string;
  @ApiProperty({ example: 'Administrador' }) name!: string;
  @ApiProperty({ nullable: true }) description!: string | null;
  @ApiProperty() isActive!: boolean;
  @ApiProperty({ ...dateProperty, nullable: false }) createdAt!: string;
  @ApiProperty({ ...dateProperty, nullable: false }) updatedAt!: string;
}

export class RolePermissionsApiResponse {
  @ApiProperty({ type: RoleApiResponse }) role!: RoleApiResponse;
  @ApiProperty({ type: PermissionSummaryApiResponse, isArray: true })
  permissions!: PermissionSummaryApiResponse[];
}

export class PermissionApiResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ example: 'users:read' }) code!: string;
  @ApiProperty({ nullable: true }) description!: string | null;
  @ApiProperty({ ...dateProperty, nullable: false }) createdAt!: string;
}

export class PermissionRoleApiResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty() code!: string;
  @ApiProperty() name!: string;
  @ApiProperty() isActive!: boolean;
}

export class PermissionDetailsApiResponse extends PermissionApiResponse {
  @ApiProperty({ example: 2 }) assignmentCount!: number;
  @ApiProperty({ type: PermissionRoleApiResponse, isArray: true })
  roles!: PermissionRoleApiResponse[];
}

export class EmployeeApiResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ example: 'EMP-001' }) employeeNumber!: string;
  @ApiProperty() fullName!: string;
  @ApiProperty({ type: String, format: 'date', nullable: true })
  hireDate!: string | null;
  @ApiProperty({ enum: ['ACTIVE', 'INACTIVE'] }) status!: string;
  @ApiProperty({ ...dateProperty, nullable: false }) createdAt!: string;
  @ApiProperty({ ...dateProperty, nullable: false }) updatedAt!: string;
}

export class PaginationMetaApiResponse {
  @ApiProperty({ example: 1 }) page!: number;
  @ApiProperty({ example: 20 }) limit!: number;
  @ApiProperty({ example: 100 }) total!: number;
  @ApiProperty({ example: 5 }) totalPages!: number;
  @ApiProperty() hasPreviousPage!: boolean;
  @ApiProperty() hasNextPage!: boolean;
}

export class EmployeesApiResponse {
  @ApiProperty({ type: EmployeeApiResponse, isArray: true })
  items!: EmployeeApiResponse[];
  @ApiProperty({ type: PaginationMetaApiResponse })
  meta!: PaginationMetaApiResponse;
}

export class UsersApiResponse {
  @ApiProperty({ type: UserApiResponse, isArray: true })
  items!: UserApiResponse[];
  @ApiProperty({ type: PaginationMetaApiResponse })
  meta!: PaginationMetaApiResponse;
}

export class AssignmentCatalogApiResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty() code!: string;
  @ApiProperty() name!: string;
}

export class EmployeeAssignmentApiResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ format: 'uuid' }) employeeId!: string;
  @ApiProperty({ format: 'uuid' }) organizationalUnitId!: string;
  @ApiProperty({ format: 'uuid' }) positionId!: string;
  @ApiProperty({ type: AssignmentCatalogApiResponse })
  organizationalUnit!: AssignmentCatalogApiResponse;
  @ApiProperty({ type: AssignmentCatalogApiResponse })
  position!: AssignmentCatalogApiResponse;
  @ApiProperty({ enum: ['BASE', 'CONFIANZA'] }) appointmentType!: string;
  @ApiProperty({ nullable: true }) schedule!: string | null;
  @ApiProperty({ type: String, format: 'date' }) effectiveFrom!: string;
  @ApiProperty({ type: String, format: 'date', nullable: true }) effectiveTo!:
    string | null;
  @ApiProperty({ nullable: true }) notes!: string | null;
  @ApiProperty({ ...dateProperty, nullable: false }) createdAt!: string;
  @ApiProperty({ ...dateProperty, nullable: false }) updatedAt!: string;
}

export class EmployeeDetailsApiResponse extends EmployeeApiResponse {
  @ApiProperty({ type: EmployeeAssignmentApiResponse, isArray: true })
  assignments!: EmployeeAssignmentApiResponse[];
}

export class PositionEmployeeApiResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty() employeeNumber!: string;
  @ApiProperty() fullName!: string;
  @ApiProperty({ enum: ['ACTIVE', 'INACTIVE'] }) status!: string;
}

export class PositionApiResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty() code!: string;
  @ApiProperty() name!: string;
  @ApiProperty({ nullable: true }) description!: string | null;
  @ApiProperty() isActive!: boolean;
  @ApiProperty({ ...dateProperty, nullable: false }) createdAt!: string;
  @ApiProperty({ ...dateProperty, nullable: false }) updatedAt!: string;
}

export class PositionDetailsApiResponse extends PositionApiResponse {
  @ApiProperty() assignmentCount!: number;
  @ApiProperty({ type: PositionEmployeeApiResponse, isArray: true })
  employees!: PositionEmployeeApiResponse[];
}

export class OrganizationalUnitApiResponse {
  @ApiProperty({ format: 'uuid', nullable: true }) parentId!: string | null;
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty() code!: string;
  @ApiProperty() name!: string;
  @ApiProperty({ nullable: true }) description!: string | null;
  @ApiProperty() isActive!: boolean;
  @ApiProperty() sortOrder!: number;
  @ApiProperty({ ...dateProperty, nullable: false }) createdAt!: string;
  @ApiProperty({ ...dateProperty, nullable: false }) updatedAt!: string;
}
