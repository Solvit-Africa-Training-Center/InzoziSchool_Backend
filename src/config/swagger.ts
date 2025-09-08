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
      },
    },
  },
  apis: ['./src/routes/*.ts'], // path to your route files
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
