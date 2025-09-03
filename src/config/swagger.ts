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
        url: 'http://localhost:9000',
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
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier for the user'
            },
            firstName: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              description: 'User\'s first name'
            },
            lastName: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              description: 'User\'s last name'
            },
            gender: {
              type: 'string',
              enum: ['Male', 'Female', 'Other'],
              description: 'User\'s gender'
            },
            province: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              description: 'User\'s province'
            },
            district: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              description: 'User\'s district'
            },
            sector: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              description: 'User\'s sector'
            },
            cell: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              description: 'User\'s cell'
            },
            village: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              description: 'User\'s village'
            },
            phone: {
              type: 'string',
              pattern: '^(\\+?25)?(07[0-9]{8})$',
              description: 'User\'s phone number (Rwandan format)'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User\'s email address'
            },
            roleId: {
              type: 'string',
              format: 'uuid',
              description: 'User\'s role ID'
            },
            schoolId: {
              type: 'string',
              format: 'uuid',
              description: 'User\'s school ID (optional)',
              nullable: true
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account last update timestamp'
            }
          }
        },
        RegisterRequest: {
          type: 'object',
          required: ['firstName', 'lastName', 'gender', 'province', 'district', 'sector', 'cell', 'village', 'phone', 'email', 'password'],
          properties: {
            firstName: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              example: 'John'
            },
            lastName: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              example: 'Doe'
            },
            gender: {
              type: 'string',
              enum: ['Male', 'Female', 'Other'],
              example: 'Male'
            },
            province: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              example: 'Kigali'
            },
            district: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              example: 'Nyarugenge'
            },
            sector: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              example: 'Nyamirambo'
            },
            cell: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              example: 'Biryogo'
            },
            village: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              example: 'Kanyinya'
            },
            phone: {
              type: 'string',
              pattern: '^(\\+?25)?(07[0-9]{8})$',
              example: '0788123456'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'john.doe@example.com'
            },
            password: {
              type: 'string',
              minLength: 8,
              pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)',
              example: 'SecurePassword123!'
            },
            schoolId: {
              type: 'string',
              format: 'uuid',
              description: 'Optional school ID',
              nullable: true
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'john.doe@example.com'
            },
            password: {
              type: 'string',
              example: 'SecurePassword123!'
            }
          }
        },
        ForgotPasswordRequest: {
          type: 'object',
          required: ['email'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'john.doe@example.com'
            }
          }
        },
        ResetPasswordRequest: {
          type: 'object',
          required: ['token', 'newPassword'],
          properties: {
            token: {
              type: 'string',
              example: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0'
            },
            newPassword: {
              type: 'string',
              minLength: 8,
              pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)',
              example: 'NewSecurePassword123!'
            }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'User registered successfully'
            },
            data: {
              type: 'object',
              properties: {
                user: {
                  $ref: '#/components/schemas/User'
                },
                token: {
                  type: 'string',
                  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                }
              }
            }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Operation completed successfully'
            },
            data: {
              type: 'object',
              description: 'Response data (varies by endpoint)'
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'An error occurred'
            },
            data: {
              type: 'object',
              description: 'Error details',
              nullable: true
            }
          }
        },
        ValidationErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Validation error'
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                    example: 'email'
                  },
                  message: {
                    type: 'string',
                    example: 'Please provide a valid email address'
                  }
                }
              }
            }
          }
        },
        TranslationResponse: {
          type: 'object',
          properties: {
            language: {
              type: 'string',
              example: 'en'
            },
            translation: {
              type: 'object',
              description: 'Translation data for the specified language'
            }
          }
        }
      }
    },
  },
  apis: ['./src/routes/*.ts', './src/server.ts'],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;