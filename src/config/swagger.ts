import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Inzozi School API',
      version: '1.0.0',
      description: 'Backend API for Inzozi School platform. Supports school search, registration, and multi-language support.',
    },
    servers: [
  {
    url: 'https://inzozischool-backend.onrender.com/',
    description: 'Production Server (Render)',
  },
  {
    url: 'http://localhost:5000',
    description: 'Development Server',
  },
],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', example: 'admin@example.com' },
            password: { type: 'string', example: 'Password123' },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              properties: {
                user: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    email: { type: 'string' },
                    roleId: { type: 'string' },
                  },
                },
                token: { type: 'string' },
              },
            },
            message: { type: 'string', example: 'Login successful' },
            success: { type: 'boolean', example: true },
          },
        },
        ForgotPasswordRequest: {
          type: 'object',
          required: ['email'],
          properties: {
            email: { type: 'string', example: 'user@example.com' },
          },
        },
        ForgotPasswordResponse: {
          type: 'object',
          properties: {
            data: { type: 'null' },
            message: { type: 'string', example: 'Reset code sent' },
            success: { type: 'boolean', example: true },
          },
        },
        ResetPasswordRequest: {
          type: 'object',
          required: ['email', 'code', 'newPassword'],
          properties: {
            email: { type: 'string', example: 'user@example.com' },
            code: { type: 'string', example: '123456' },
            newPassword: { type: 'string', example: 'NewPass123!' },
          },
        },
        ResetPasswordResponse: {
          type: 'object',
          properties: {
            data: { type: 'string', example: 'NewPass123!' },
            message: { type: 'string', example: 'Password updated' },
            success: { type: 'boolean', example: true },
          },
        },
        CreateSchoolManagerRequest: {
          type: 'object',
          required: ['firstName', 'lastName', 'email', 'password', 'gender', 'district'],
          properties: {
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            email: { type: 'string', example: 'john@example.com' },
            password: { type: 'string', example: 'Password123' },
            gender: { type: 'string', enum: ['Male', 'Female', 'Other'], example: 'Male' },
            province: { type: 'string', example: 'Kigali' },
            district: { type: 'string', example: 'Nyarugenge' },
            schoolId: { type: 'string', format: 'uuid', example: null },
          },
        },
        CreateSchoolManagerResponse: {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              example: { id: 'uuid', email: 'john@example.com', roleId: 'uuid' },
            },
            message: { type: 'string', example: 'School Manager registered successfully' },
            success: { type: 'boolean', example: true },
          },
        },
           UpdateUserRequest: {
          type: 'object',
          properties: {
            firstName: { type: 'string', example: 'Jane' },
            lastName: { type: 'string', example: 'Smith' },
            email: { type: 'string', example: 'jane.smith@example.com' },
            password: { type: 'string', minLength: 6, example: 'NewPass123!' },
            gender: { type: 'string', enum: ['Male', 'Female', 'Other'], example: 'Female' },
            province: { type: 'string', example: 'Kigali' },
            district: { type: 'string', example: 'Gasabo' },
            profileImage: { type: 'string', example: 'https://cdn.example.com/avatar.png' },
            schoolId: { type: 'string', format: 'uuid', example: 'uuid-here' },
          },
        },
         UpdateUserResponse: {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              example: {
                id: 'uuid',
                firstName: 'Jane',
                lastName: 'Smith',
                email: 'jane.smith@example.com',
                gender: 'Female',
                province: 'Kigali',
                district: 'Gasabo',
                profileImage: 'https://cdn.example.com/avatar.png',
                schoolId: 'uuid-here',
              },
            },
            message: { type: 'string', example: 'User updated successfully' },
            success: { type: 'boolean', example: true },
          },
        },

          SchoolRegisterRequest: {
          type: 'object',
          required: ['schoolName', 'schoolCode', 'email', 'district'],
          properties: {
            schoolName: { type: 'string', example: 'Akagera High School' },
            schoolCode: { type: 'string', example: '1234567' },
            email: { type: 'string', example: 'school@example.com' },
            district: { type: 'string', example: 'Nyarugenge' },
            licenseDocument: { type: 'string', format: 'binary', description: 'Upload license document' },
            province: { type: 'string', example: 'Kigali' },
            sector: { type: 'string', example: 'Sector 1' },
            cell: { type: 'string', example: 'Cell A' },
            village: { type: 'string', example: 'Village X' },
            schoolCategory: { type: 'string', enum: ['REB', 'RTB'], example: 'REB' },
            schoolLevel: { type: 'string', enum: ['Nursery', 'Primary', 'O-Level', 'A-Level'], example: 'O-Level' },
            schoolType: { type: 'string', enum: ['Girls', 'Boys', 'Mixed'], example: 'Mixed' },
          },
        },
        SchoolResponse: {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid', example: 'uuid-here' },
                schoolName: { type: 'string', example: 'Akagera High School' },
                schoolCode: { type: 'string', example: '1234567' },
                email: { type: 'string', example: 'school@example.com' },
                district: { type: 'string', example: 'Nyarugenge' },
                status: { type: 'string', enum: ['pending', 'approved', 'rejected'], example: 'pending' },
                licenseDocument: { type: 'string', example: 'https://res.cloudinary.com/.../license.pdf' },
                approvedBy: { type: 'string', format: 'uuid', example: null },
                approvedAt: { type: 'string', format: 'date-time', example: null },
                rejectedReason: { type: 'string', example: null },
                createdAt: { type: 'string', format: 'date-time', example: '2025-09-09T10:06:28.223Z' },
                updatedAt: { type: 'string', format: 'date-time', example: '2025-09-09T10:06:28.223Z' },
              },
            },
            message: { type: 'string', example: 'School registered successfully' },
            success: { type: 'boolean', example: true },
          },
        },
             RejectSchoolRequest: {
          type: 'object',
          required: ['reason'],
          properties: {
            reason: { type: 'string', example: 'Incomplete documents' },
          },
        },
        ResubmitSchoolRequest: {
          type: 'object',
          properties: {
            schoolName: { type: 'string', example: 'Akagera High School Updated' },
            schoolCode: { type: 'string', example: '1234567' },
            email: { type: 'string', example: 'school@example.com' },
            district: { type: 'string', example: 'Nyarugenge' },
            licenseDocument: { type: 'string', format: 'binary', description: 'Upload updated license document' },
          },
        },
                GetMeResponse: {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'uuid' },
                firstName: { type: 'string', example: 'John' },
                lastName: { type: 'string', example: 'Doe' },
                email: { type: 'string', example: 'john@example.com' },
                gender: { type: 'string', example: 'Male' },
                province: { type: 'string', example: 'Kigali' },
                district: { type: 'string', example: 'Nyarugenge' },
                profileImage: { type: 'string', example: 'https://cdn.example.com/avatar.png' },
                roleId: { type: 'string', example: 'uuid-role' },
                schoolId: { type: 'string', format: 'uuid', example: 'uuid-school' },
              },
            },
            message: { type: 'string', example: 'Authenticated user fetched successfully' },
            success: { type: 'boolean', example: true },
          },
        },
        GetUserByIdResponse: {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'uuid' },
                firstName: { type: 'string', example: 'Jane' },
                lastName: { type: 'string', example: 'Smith' },
                email: { type: 'string', example: 'jane.smith@example.com' },
                gender: { type: 'string', example: 'Female' },
                province: { type: 'string', example: 'Kigali' },
                district: { type: 'string', example: 'Gasabo' },
                profileImage: { type: 'string', example: 'https://cdn.example.com/avatar.png' },
                roleId: { type: 'string', example: 'uuid-role' },
                schoolId: { type: 'string', format: 'uuid', example: 'uuid-school' },
              },
            },
            message: { type: 'string', example: 'User fetched successfully' },
            success: { type: 'boolean', example: true },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'], // path to your route files
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
