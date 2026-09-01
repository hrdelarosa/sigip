import { toUserDetailsResponse } from './user.presenter';

describe('toUserDetailsResponse', () => {
  it('includes the actor who created the user', () => {
    const createdBy = {
      id: '0198a68e-e5b2-7000-8000-000000000001',
      username: 'admin',
      fullName: 'Administrador',
    };

    const response = toUserDetailsResponse({
      user: {
        id: '0198a68e-e5b2-7000-8000-000000000002',
        roleId: '0198a68e-e5b2-7000-8000-000000000003',
        officeId: '0198a68e-e5b2-7000-8000-000000000004',
        username: 'analista',
        fullName: 'Usuario Analista',
        isActive: true,
        lastLoginAt: null,
        createdAt: new Date('2026-08-12T12:00:00.000Z'),
        updatedAt: new Date('2026-08-12T12:00:00.000Z'),
      },
      role: {
        id: '0198a68e-e5b2-7000-8000-000000000003',
        code: 'analyst',
        name: 'Analista',
        description: null,
        isActive: true,
        createdAt: new Date('2026-08-12T12:00:00.000Z'),
        updatedAt: new Date('2026-08-12T12:00:00.000Z'),
      },
      permissions: [],
      sessionSummary: null,
      recentAudit: null,
      createdBy,
    });

    expect(response.createdBy).toEqual(createdBy);
  });
});
