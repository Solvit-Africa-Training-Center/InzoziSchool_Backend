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
            email: { type: 'string', format: 'email', example: 'user@example.com' },
            password: { type: 'string', example: 'password123' },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            token: { type: 'string', example: 'jwt-token' },
            userId: { type: 'string', format: 'uuid', example: 'b1a2c3d4-e5f6-7890-abcd-1234567890ab' },
          },
        },
        ForgotPasswordRequest: {
          type: 'object',
          required: ['email'],
          properties: {
            email: { type: 'string', format: 'email', example: 'user@example.com' },
          },
        },
        ForgotPasswordResponse: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Password reset link sent to your email.' },
          },
        },
        CreateSchoolManagerRequest: {
          type: 'object',
          required: ['email', 'fullName', 'schoolId'],
          properties: {
            email: { type: 'string', format: 'email', example: 'manager@school.com' },
            fullName: { type: 'string', example: 'Jane Doe' },
            schoolId: { type: 'string', format: 'uuid', example: 'b1a2c3d4-e5f6-7890-abcd-1234567890ab' },
          },
        },
        CreateSchoolManagerResponse: {
          type: 'object',
          properties: {
            managerId: { type: 'string', format: 'uuid', example: 'b1a2c3d4-e5f6-7890-abcd-1234567890ab' },
            message: { type: 'string', example: 'School manager created successfully.' },
          },
        },
        CreateSchoolRequest: {
          type: 'object',
          required: ['name', 'province', 'district', 'sector', 'cell', 'village'],
          properties: {
            name: { type: 'string', example: 'Inzozi Primary School' },
            province: { type: 'string', example: 'Kigali' },
            district: { type: 'string', example: 'Gasabo' },
            sector: { type: 'string', example: 'Kacyiru' },
            cell: { type: 'string', example: 'Gasharu' },
            village: { type: 'string', example: 'Umucyo' },
          },
        },
        CreateSchoolResponse: {
          type: 'object',
          properties: {
            schoolId: { type: 'string', format: 'uuid', example: 'b1a2c3d4-e5f6-7890-abcd-1234567890ab' },
            message: { type: 'string', example: 'School registered successfully.' },
          },
        },
        RegisterStudentRequest: {
          type: 'object',
          required: [
            'firstName', 'lastName', 'gender', 'DOB', 'fathersNames', 'mothersNames',
            'representerEmail', 'representerPhone', 'nationality', 'province', 'district',
            'sector', 'cell', 'village', 'studentType', 'passportPhoto', 'schoolId'
          ],
          properties: {
            firstName: { type: 'string', example: 'Eric' },
            lastName: { type: 'string', example: 'Niyonzima' },
            gender: { type: 'string', enum: ['MALE', 'FEMALE', 'OTHER'], example: 'MALE' },
            DOB: { type: 'string', format: 'date', example: '2010-05-12' },
            fathersNames: { type: 'string', example: 'Jean Bosco' },
            mothersNames: { type: 'string', example: 'Marie Claire' },
            representerEmail: { type: 'string', format: 'email', example: 'parent@example.com' },
            representerPhone: { type: 'string', example: '+250788123456' },
            nationality: { type: 'string', example: 'Rwandan' },
            province: { type: 'string', example: 'Kigali' },
            district: { type: 'string', example: 'Gasabo' },
            sector: { type: 'string', example: 'Kacyiru' },
            cell: { type: 'string', example: 'Gasharu' },
            village: { type: 'string', example: 'Umucyo' },
            studentType: { type: 'string', enum: ['newcomer', 'ongoing'], example: 'newcomer' },
            schoolId: { type: 'string', format: 'uuid', example: 'b1a2c3d4-e5f6-7890-abcd-1234567890ab' },
            indexNumber: { type: 'string', example: 'P6-2025-001' },
            passportPhoto: { type: 'string', format: 'binary' },
            resultSlip: { type: 'string', format: 'binary' },
            previousReport: { type: 'string', format: 'binary' },
            mitationLetter: { type: 'string', format: 'binary' },
          },
        },
        RegisterStudentResponse: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', example: 'stu_12345' },
            message: { type: 'string', example: 'Student registered successfully' },
            success: { type: 'boolean', example: true },
          },
        },
      },
    },
    paths: {
      '/api/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login to the system',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginRequest' },
              },
            },
          },
          responses: {
            '200': {
              description: 'Login successful',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/LoginResponse' },
                },
              },
            },
            '401': {
              description: 'Invalid credentials',
            },
          },
        },
      },
      '/api/auth/forgot-password': {
        post: {
          tags: ['Auth'],
          summary: 'Request password reset',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ForgotPasswordRequest' },
              },
            },
          },
          responses: {
            '200': {
              description: 'Reset link sent',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ForgotPasswordResponse' },
                },
              },
            },
            '404': {
              description: 'Email not found',
            },
          },
        },
      },
      '/api/users/school-manager': {
        post: {
          tags: ['Users'],
          summary: 'Create a school manager',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateSchoolManagerRequest' },
              },
            },
          },
          responses: {
            '201': {
              description: 'School manager created',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/CreateSchoolManagerResponse' },
                },
              },
            },
            '400': {
              description: 'Validation error',
            },
          },
        },
      },
      '/api/schools': {
        post: {
          tags: ['Schools'],
          summary: 'Register a new school',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateSchoolRequest' },
              },
            },
          },
          responses: {
            '201': {
              description: 'School registered',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/CreateSchoolResponse' },
                },
              },
            },
            '400': {
              description: 'Validation error',
            },
          },
        },
        get: {
          tags: ['Schools'],
          summary: 'Get all schools',
          responses: {
            '200': {
              description: 'List of schools',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/CreateSchoolResponse' },
                  },
                },
              },
            },
          },
        },
      },
      '/api/students': {
        post: {
          tags: ['Students'],
          summary: 'Register a new student',
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: { $ref: '#/components/schemas/RegisterStudentRequest' },
              },
            },
          },
          responses: {
            '201': {
              description: 'Student registered successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/RegisterStudentResponse' },
                },
              },
            },
            '400': {
              description: 'Validation error',
              content: {
                'application/json': {
                  example: {
                    success: false,
                    message: 'Missing required fields: firstName, passportPhoto',
                  },
                },
              },
            },
            '500': {
              description: 'Server error',
              content: {
                'application/json': {
                  example: {
                    success: false,
                    message: 'Failed to register student',
                  },
                },
              },
            },
          },
        },
        get: {
          tags: ['Students'],
          summary: 'Get all students',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'List of students',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/RegisterStudentResponse' },
                  },
                },
              },
            },
            '403': { description: 'Unauthorized' },
          },
        },
      },
      '/api/students/{id}': {
        get: {
          tags: ['Students'],
          summary: 'Get student by ID',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            '200': {
              description: 'Student found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/RegisterStudentResponse' },
                },
              },
            },
            '403': { description: 'Unauthorized' },
            '404': { description: 'Student not found' },
          },
        },
      },
      '/api/students/{id}/status': {
        patch: {
          tags: ['Students'],
          summary: 'Update student status',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['status'],
                  properties: {
                    status: { type: 'string', enum: ['approved', 'rejected'] },
                  },
                  example: { status: 'approved' },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Status updated',
              content: {
                'application/json': {
                  example: { id: 'stu_12345', status: 'approved' },
                },
              },
            },
            '403': { description: 'Unauthorized' },
            '404': { description: 'Student not found' },
          },
        },
      },
      '/api/students/{id}/babyeyi': {
        post: {
          tags: ['Students'],
          summary: 'Issue Babyeyi document',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  required: ['file'],
                  properties: {
                    file: { type: 'string', format: 'binary' },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Babyeyi document issued',
              content: {
                'application/json': {
                  example: {
                    studentId: 'stu_12345',
                    fileUrl: 'https://cloudinary.com/myfile.pdf',
                    message: 'Babyeyi document issued successfully',
                  },
                },
              },
            },
            '400': { description: 'Validation error' },
            '403': { description: 'Unauthorized' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
