import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'InzoziSchool Backend API',
      version: '1.0.0',
      description: 'Comprehensive backend API for InzoziSchool platform. Features include: Authentication, User Management with Role Hierarchy (SYSTEM_ADMIN manages INSPECTORs, SCHOOL_MANAGER manages ADMISSION_MANAGERs), School Management, and Multi-language Support.',
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
        },
        Role: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier for the role'
            },
            name: {
              type: 'string',
              enum: ['SYSTEM_ADMIN', 'SCHOOL_MANAGER', 'INSPECTOR', 'ADMISSION_MANAGER'],
              description: 'Role name in InzoziSchool hierarchy'
            }
          }
        },
        School: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier for the school'
            },
            school_name: {
              type: 'string',
              description: 'Name of the school'
            },
            school_code: {
              type: 'string',
              description: 'Unique school code'
            }
          }
        },
        CreateUserRequest: {
          type: 'object',
          required: ['firstName', 'lastName', 'gender', 'province', 'district', 'sector', 'cell', 'village', 'phone', 'email', 'roleId'],
          properties: {
            firstName: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              example: 'John',
              description: 'User\'s first name'
            },
            lastName: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              example: 'Inspector',
              description: 'User\'s last name'
            },
            gender: {
              type: 'string',
              enum: ['Male', 'Female', 'Other'],
              example: 'Male'
            },
            province: {
              type: 'string',
              example: 'Kigali'
            },
            district: {
              type: 'string',
              example: 'Gasabo'
            },
            sector: {
              type: 'string',
              example: 'Remera'
            },
            cell: {
              type: 'string',
              example: 'Nyabisindu'
            },
            village: {
              type: 'string',
              example: 'Kabeza'
            },
            phone: {
              type: 'string',
              pattern: '^(\\+?25)?(07[0-9]{8})$',
              example: '0788123456'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'inspector@inzozi.rw'
            },
            roleId: {
              type: 'string',
              format: 'uuid',
              description: 'Role ID (must be manageable by current user)'
            },
            schoolId: {
              type: 'string',
              format: 'uuid',
              description: 'School ID (required for ADMISSION_MANAGER)',
              nullable: true
            },
            password: {
              type: 'string',
              minLength: 8,
              description: 'Optional password (system generates if not provided)',
              example: 'SecurePass123!'
            }
          }
        },
        UpdateUserRequest: {
          type: 'object',
          properties: {
            firstName: {
              type: 'string',
              minLength: 2,
              maxLength: 50
            },
            lastName: {
              type: 'string',
              minLength: 2,
              maxLength: 50
            },
            gender: {
              type: 'string',
              enum: ['Male', 'Female', 'Other']
            },
            province: { type: 'string' },
            district: { type: 'string' },
            sector: { type: 'string' },
            cell: { type: 'string' },
            village: { type: 'string' },
            phone: {
              type: 'string',
              pattern: '^(\\+?25)?(07[0-9]{8})$'
            },
            email: {
              type: 'string',
              format: 'email'
            },
            roleId: {
              type: 'string',
              format: 'uuid'
            },
            schoolId: {
              type: 'string',
              format: 'uuid',
              nullable: true
            }
          }
        },
        UserManagementResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'User created successfully'
            },
            data: {
              type: 'object',
              properties: {
                user: {
                  allOf: [
                    { $ref: '#/components/schemas/User' },
                    {
                      type: 'object',
                      properties: {
                        role: { $ref: '#/components/schemas/Role' },
                        school: { $ref: '#/components/schemas/School' }
                      }
                    }
                  ]
                },
                temporaryPassword: {
                  type: 'string',
                  description: 'Temporary password (only for new users)'
                }
              }
            }
          }
        },
        UsersListResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Users retrieved successfully'
            },
            data: {
              type: 'object',
              properties: {
                users: {
                  type: 'array',
                  items: {
                    allOf: [
                      { $ref: '#/components/schemas/User' },
                      {
                        type: 'object',
                        properties: {
                          role: { $ref: '#/components/schemas/Role' },
                          school: { $ref: '#/components/schemas/School' }
                        }
                      }
                    ]
                  }
                },
                pagination: {
                  type: 'object',
                  properties: {
                    currentPage: { type: 'integer', example: 1 },
                    totalPages: { type: 'integer', example: 5 },
                    totalUsers: { type: 'integer', example: 45 },
                    usersPerPage: { type: 'integer', example: 10 },
                    hasNextPage: { type: 'boolean', example: true },
                    hasPrevPage: { type: 'boolean', example: false }
                  }
                }
              }
            }
          }
        },
        UserStatsResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'User statistics retrieved successfully'
            },
            data: {
              type: 'object',
              properties: {
                totalUsers: {
                  type: 'integer',
                  example: 25,
                  description: 'Total number of users you can manage'
                },
                roleBreakdown: {
                  type: 'object',
                  properties: {
                    INSPECTOR: {
                      type: 'integer',
                      example: 15,
                      description: 'Number of INSPECTOR users (SYSTEM_ADMIN only)'
                    },
                    ADMISSION_MANAGER: {
                      type: 'integer',
                      example: 10,
                      description: 'Number of ADMISSION_MANAGER users (SCHOOL_MANAGER only)'
                    }
                  }
                },
                managedRoles: {
                  type: 'array',
                  items: {
                    type: 'string'
                  },
                  example: ['INSPECTOR'],
                  description: 'Roles that the current user can manage'
                }
              }
            }
          }
        },
        AvailableRolesResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Available roles retrieved successfully'
            },
            data: {
              type: 'object',
              properties: {
                availableRoles: {
                  type: 'array',
                  items: {
                    type: 'string'
                  },
                  example: ['INSPECTOR'],
                  description: 'Roles that current user can assign to new users'
                },
                currentUserRole: {
                  type: 'string',
                  example: 'SYSTEM_ADMIN',
                  description: 'Current user\'s role'
                },
                canManage: {
                  type: 'object',
                  properties: {
                    INSPECTOR: {
                      type: 'boolean',
                      example: true,
                      description: 'Can manage INSPECTOR users'
                    },
                    ADMISSION_MANAGER: {
                      type: 'boolean',
                      example: false,
                      description: 'Can manage ADMISSION_MANAGER users'
                    }
                  }
                }
              }
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