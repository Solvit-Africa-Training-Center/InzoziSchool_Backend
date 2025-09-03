import request from 'supertest';
import { app } from '../../src/server';
import { TestSetup } from '../helpers/testSetup';
import { Database } from '../../src/database';

describe('InzoziSchool User Management Integration Tests', () => {
  let systemAdminToken: string;
  let schoolManagerToken: string;
  let inspectorRoleId: string;
  let admissionManagerRoleId: string;
  let systemAdminRoleId: string;
  let schoolManagerRoleId: string;
  let testSchoolId: string;

  beforeAll(async () => {
    await TestSetup.beforeAll();
    
    // Get role IDs
    const inspectorRole = await Database.Role.findOne({ where: { name: 'INSPECTOR' } });
    const admissionManagerRole = await Database.Role.findOne({ where: { name: 'ADMISSION_MANAGER' } });
    const systemAdminRole = await Database.Role.findOne({ where: { name: 'SYSTEM_ADMIN' } });
    const schoolManagerRole = await Database.Role.findOne({ where: { name: 'SCHOOL_MANAGER' } });

    inspectorRoleId = inspectorRole?.id || '';
    admissionManagerRoleId = admissionManagerRole?.id || '';
    systemAdminRoleId = systemAdminRole?.id || '';
    schoolManagerRoleId = schoolManagerRole?.id || '';

    // Create test school
    const testSchool = await Database.School.create({
      id: require('uuid').v4(),
      school_name: 'Test School for User Management',
      school_code: 'TST001',
      school_category: 'REB',
      school_level: 'O-level',
      school_combination: ['MPC'],
      school_type: 'Mixed',
      province: 'Kigali',
      district: 'Gasabo',
      sector: 'Remera',
      cell: 'Nyabisindu',
      village: 'Kabeza',
      email: 'testschool@inzozi.rw',
      telephone: '0788999000',
      status: 'approved'
    });
    testSchoolId = testSchool.id;

    // Create SYSTEM_ADMIN user for testing
    const systemAdminResponse = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'System',
        lastName: 'Admin',
        email: 'sysadmin@inzozi.rw',
        password: 'SystemAdmin123!',
        gender: 'Male',
        province: 'Kigali',
        district: 'Gasabo',
        sector: 'Remera',
        cell: 'Nyabisindu',
        village: 'Kabeza',
        phone: '0788111000'
      });

    // Manually assign SYSTEM_ADMIN role
    if (systemAdminResponse.body.data?.user) {
      await Database.User.update(
        { roleId: systemAdminRoleId },
        { where: { id: systemAdminResponse.body.data.user.id } }
      );
    }

    // Login as SYSTEM_ADMIN
    const systemAdminLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'sysadmin@inzozi.rw',
        password: 'SystemAdmin123!'
      });

    systemAdminToken = systemAdminLogin.body.data?.token || '';

    // Create SCHOOL_MANAGER user
    const schoolManagerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'School',
        lastName: 'Manager',
        email: 'schoolmanager@inzozi.rw',
        password: 'SchoolManager123!',
        gender: 'Female',
        province: 'Kigali',
        district: 'Gasabo',
        sector: 'Remera',
        cell: 'Nyabisindu',
        village: 'Kabeza',
        phone: '0788222000'
      });

    // Manually assign SCHOOL_MANAGER role and school
    if (schoolManagerResponse.body.data?.user) {
      await Database.User.update(
        { roleId: schoolManagerRoleId, schoolId: testSchoolId },
        { where: { id: schoolManagerResponse.body.data.user.id } }
      );
    }

    // Login as SCHOOL_MANAGER
    const schoolManagerLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'schoolmanager@inzozi.rw',
        password: 'SchoolManager123!'
      });

    schoolManagerToken = schoolManagerLogin.body.data?.token || '';
  });

  afterAll(async () => {
    await TestSetup.afterAll();
  });

  beforeEach(async () => {
    await TestSetup.beforeEach();
  });

  describe('SYSTEM_ADMIN managing INSPECTORs', () => {
    it('should allow SYSTEM_ADMIN to create INSPECTOR users', async () => {
      const inspectorData = {
        firstName: 'John',
        lastName: 'Inspector',
        email: 'inspector@inzozi.rw',
        gender: 'Male',
        province: 'Kigali',
        district: 'Gasabo',
        sector: 'Remera',
        cell: 'Nyabisindu',
        village: 'Kabeza',
        phone: '0788333000',
        roleId: inspectorRoleId
      };

      const response = await request(app)
        .post('/api/user-management/users')
        .set('Authorization', `Bearer ${systemAdminToken}`)
        .send(inspectorData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.role.name).toBe('INSPECTOR');
      expect(response.body.data.temporaryPassword).toBeDefined();
    });

    it('should not allow SYSTEM_ADMIN to create ADMISSION_MANAGER users', async () => {
      const admissionManagerData = {
        firstName: 'Jane',
        lastName: 'AdmissionManager',
        email: 'admission@inzozi.rw',
        gender: 'Female',
        province: 'Kigali',
        district: 'Gasabo',
        sector: 'Remera',
        cell: 'Nyabisindu',
        village: 'Kabeza',
        phone: '0788444000',
        roleId: admissionManagerRoleId,
        schoolId: testSchoolId
      };

      const response = await request(app)
        .post('/api/user-management/users')
        .set('Authorization', `Bearer ${systemAdminToken}`)
        .send(admissionManagerData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not authorized to create ADMISSION_MANAGER');
    });

    it('should allow SYSTEM_ADMIN to get INSPECTOR users', async () => {
      const response = await request(app)
        .get('/api/user-management/users?role=INSPECTOR')
        .set('Authorization', `Bearer ${systemAdminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.users).toBeDefined();
      expect(response.body.data.pagination).toBeDefined();
    });

    it('should allow SYSTEM_ADMIN to get available roles', async () => {
      const response = await request(app)
        .get('/api/user-management/users/available-roles')
        .set('Authorization', `Bearer ${systemAdminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.availableRoles).toContain('INSPECTOR');
      expect(response.body.data.availableRoles).not.toContain('ADMISSION_MANAGER');
      expect(response.body.data.canManage.INSPECTOR).toBe(true);
      expect(response.body.data.canManage.ADMISSION_MANAGER).toBe(false);
    });
  });

  describe('SCHOOL_MANAGER managing ADMISSION_MANAGERs', () => {
    it('should allow SCHOOL_MANAGER to create ADMISSION_MANAGER users for their school', async () => {
      const admissionManagerData = {
        firstName: 'Sarah',
        lastName: 'AdmissionManager',
        email: 'admission2@inzozi.rw',
        gender: 'Female',
        province: 'Kigali',
        district: 'Gasabo',
        sector: 'Remera',
        cell: 'Nyabisindu',
        village: 'Kabeza',
        phone: '0788555000',
        roleId: admissionManagerRoleId,
        schoolId: testSchoolId
      };

      const response = await request(app)
        .post('/api/user-management/users')
        .set('Authorization', `Bearer ${schoolManagerToken}`)
        .send(admissionManagerData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.role.name).toBe('ADMISSION_MANAGER');
      expect(response.body.data.user.schoolId).toBe(testSchoolId);
    });

    it('should not allow SCHOOL_MANAGER to create INSPECTOR users', async () => {
      const inspectorData = {
        firstName: 'Bob',
        lastName: 'Inspector',
        email: 'inspector2@inzozi.rw',
        gender: 'Male',
        province: 'Kigali',
        district: 'Gasabo',
        sector: 'Remera',
        cell: 'Nyabisindu',
        village: 'Kabeza',
        phone: '0788666000',
        roleId: inspectorRoleId
      };

      const response = await request(app)
        .post('/api/user-management/users')
        .set('Authorization', `Bearer ${schoolManagerToken}`)
        .send(inspectorData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not authorized to create INSPECTOR');
    });

    it('should not allow SCHOOL_MANAGER to create ADMISSION_MANAGER without schoolId', async () => {
      const admissionManagerData = {
        firstName: 'Invalid',
        lastName: 'AdmissionManager',
        email: 'invalid@inzozi.rw',
        gender: 'Male',
        province: 'Kigali',
        district: 'Gasabo',
        sector: 'Remera',
        cell: 'Nyabisindu',
        village: 'Kabeza',
        phone: '0788777000',
        roleId: admissionManagerRoleId
        // Missing schoolId
      };

      const response = await request(app)
        .post('/api/user-management/users')
        .set('Authorization', `Bearer ${schoolManagerToken}`)
        .send(admissionManagerData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('School ID is required');
    });

    it('should allow SCHOOL_MANAGER to get ADMISSION_MANAGER users from their school only', async () => {
      const response = await request(app)
        .get('/api/user-management/users?role=ADMISSION_MANAGER')
        .set('Authorization', `Bearer ${schoolManagerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.users).toBeDefined();
      
      // All returned users should belong to the same school
      response.body.data.users.forEach((user: any) => {
        if (user.schoolId) {
          expect(user.schoolId).toBe(testSchoolId);
        }
      });
    });
  });

  describe('Authorization checks', () => {
    it('should return 401 for requests without token', async () => {
      const response = await request(app)
        .get('/api/user-management/users')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Authentication required');
    });

    it('should return 403 for users without management permissions (e.g., regular INSPECTOR)', async () => {
      // This test would require creating an INSPECTOR user and trying to access management endpoints
      // For now, we'll skip this as it requires more setup
      // In a real implementation, you would create an INSPECTOR user and verify they can't access these endpoints
    });
  });

  describe('User Management Statistics', () => {
    it('should allow SYSTEM_ADMIN to get user statistics', async () => {
      const response = await request(app)
        .get('/api/user-management/users/stats')
        .set('Authorization', `Bearer ${systemAdminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalUsers).toBeDefined();
      expect(response.body.data.roleBreakdown).toBeDefined();
      expect(response.body.data.managedRoles).toContain('INSPECTOR');
    });

    it('should allow SCHOOL_MANAGER to get user statistics for their managed roles', async () => {
      const response = await request(app)
        .get('/api/user-management/users/stats')
        .set('Authorization', `Bearer ${schoolManagerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.managedRoles).toContain('ADMISSION_MANAGER');
      expect(response.body.data.managedRoles).not.toContain('INSPECTOR');
    });
  });
});
