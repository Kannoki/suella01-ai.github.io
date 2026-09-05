export const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'MechGirl Portal API',
    version: '1.0.0',
    description:
      'Comprehensive REST API documentation and management interface for MechGirl - Empowering Women in Mechanics, Robotics & STEM.\n\nManage activities, projects, hero carousel slides, profile information, contact messages, and publications.\n\n### Authentication\nAll mutation endpoints (`POST`, `PUT`, `DELETE`) are protected by authentication. You can authenticate using any of:\n- **Bearer Token**: Click **Authorize** and enter your `ADMIN_API_KEY` (or `NEXTAUTH_SECRET` / `SECRET`).\n- **API Key**: Enter the same value in the `x-admin-key` header.\n- **NextAuth Session**: Automatically sent when logged in via cookie.',
    contact: {
      name: 'MechGirl Admin',
      email: 'contact@mechgirl.com',
    },
  },
  servers: [
    {
      url: '',
      description: 'Current Environment (relative)',
    },
    {
      url: 'http://localhost:3000',
      description: 'Local Development Server',
    },
  ],
  tags: [
    { name: 'About', description: 'Personal profile, biography, and timeline management' },
    { name: 'Activities', description: 'Events, workshops, registrations, and seat tracking' },
    { name: 'Carousel', description: 'Hero section carousel images and display order' },
    { name: 'Contact', description: 'Contact details, social media links, and user inquiries' },
    { name: 'Products', description: 'Engineering projects, hardware showcases, and robotics' },
    { name: 'Registrations', description: 'Participant event registrations' },
    { name: 'Posts', description: 'Community feed, articles, and draft publication' },
    { name: 'Users', description: 'User accounts, roles, Base64 profile pictures, and career timelines' },
    { name: 'Auth', description: 'Authentication and session credentials management' },
  ],
  paths: {
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Authenticate user with email and password',
        description: 'Validates email and password, returning user profile data and bearer token for localStorage persistence.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'admin@mechgirl.com' },
                  password: { type: 'string', format: 'password', example: 'YOUR_ADMIN_PASSWORD' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Authentication successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Login successful' },
                    user: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Invalid credentials',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/about': {
      get: {
        tags: ['About'],
        summary: 'Get about profile and timeline',
        description: 'Retrieves the complete profile including name, bio, photo, and career/education timeline items.',
        responses: {
          '200': {
            description: 'Profile successfully retrieved',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AboutProfile' },
              },
            },
          },
          '500': {
            description: 'Server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      put: {
        tags: ['About'],
        summary: 'Update about profile',
        description: 'Updates bio, name, tagline, photo URL, or timeline items. Requires authentication.',
        security: [{ bearerAuth: [] }, { apiKeyAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AboutProfile' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Profile updated successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AboutProfile' },
              },
            },
          },
          '401': {
            description: 'Unauthorized - Authentication required',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '500': {
            description: 'Failed to update profile',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/activities': {
      get: {
        tags: ['Activities'],
        summary: 'List all activities and events',
        description: 'Returns all workshops, seminars, and competitions ordered by most recent.',
        responses: {
          '200': {
            description: 'List of activities',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Activity' },
                },
              },
            },
          },
          '500': {
            description: 'Failed to fetch activities',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      post: {
        tags: ['Activities'],
        summary: 'Create a new activity',
        description: 'Adds a new event or workshop to the portal. Requires authentication.',
        security: [{ bearerAuth: [] }, { apiKeyAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateActivityInput' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Activity successfully created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Activity' },
              },
            },
          },
          '401': {
            description: 'Unauthorized - Authentication required',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '500': {
            description: 'Failed to create activity',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/activities/{id}': {
      get: {
        tags: ['Activities'],
        summary: 'Get activity by ID or slug',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Activity ID or URL slug',
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Activity details',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Activity' },
              },
            },
          },
          '404': {
            description: 'Activity not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '500': {
            description: 'Server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      put: {
        tags: ['Activities'],
        summary: 'Update activity details',
        description: 'Requires authentication.',
        security: [{ bearerAuth: [] }, { apiKeyAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Activity ID or slug to update',
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateActivityInput' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Activity successfully updated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Activity' },
              },
            },
          },
          '401': {
            description: 'Unauthorized - Authentication required',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '404': {
            description: 'Activity not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Activities'],
        summary: 'Delete activity',
        description: 'Requires authentication.',
        security: [{ bearerAuth: [] }, { apiKeyAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Activity ID or slug to remove',
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Activity deleted',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessResponse' },
              },
            },
          },
          '401': {
            description: 'Unauthorized - Authentication required',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/activities/{id}/register': {
      post: {
        tags: ['Activities', 'Registrations'],
        summary: 'Register for an activity',
        description: 'Public endpoint. Submits a registration for a user to attend an activity.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Activity ID or slug to register for',
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ActivityRegistrationInput' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Successfully registered',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessResponse' },
              },
            },
          },
          '400': {
            description: 'Missing required fields or registration failed',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/carousel': {
      get: {
        tags: ['Carousel'],
        summary: 'List active hero carousel slides',
        description: 'Returns all slides configured for the home page hero carousel ordered by display sequence.',
        responses: {
          '200': {
            description: 'List of carousel slides',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/CarouselSlide' },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Carousel'],
        summary: 'Add a new carousel slide',
        description: 'Requires authentication.',
        security: [{ bearerAuth: [] }, { apiKeyAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateCarouselSlideInput' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Carousel slide added',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CarouselSlide' },
              },
            },
          },
          '401': {
            description: 'Unauthorized - Authentication required',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/carousel/{id}': {
      delete: {
        tags: ['Carousel'],
        summary: 'Delete carousel slide',
        description: 'Requires authentication.',
        security: [{ bearerAuth: [] }, { apiKeyAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Carousel slide ID',
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Slide removed',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessResponse' },
              },
            },
          },
          '401': {
            description: 'Unauthorized - Authentication required',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/contact': {
      get: {
        tags: ['Contact'],
        summary: 'Get site contact details',
        responses: {
          '200': {
            description: 'Contact information and social links',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ContactInfo' },
              },
            },
          },
        },
      },
      put: {
        tags: ['Contact'],
        summary: 'Update contact details',
        description: 'Requires authentication.',
        security: [{ bearerAuth: [] }, { apiKeyAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ContactInfo' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Contact info successfully updated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ContactInfo' },
              },
            },
          },
          '401': {
            description: 'Unauthorized - Authentication required',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/contact/messages': {
      get: {
        tags: ['Contact'],
        summary: 'List contact form submissions',
        responses: {
          '200': {
            description: 'List of inquiries submitted by visitors',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/ContactMessage' },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Contact'],
        summary: 'Submit a new contact message',
        description: 'Public endpoint for website visitors.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SubmitContactMessageInput' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Message recorded successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ContactMessage' },
              },
            },
          },
          '400': {
            description: 'Missing required fields (name, email, or message)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/products': {
      get: {
        tags: ['Products'],
        summary: 'List all engineering projects and products',
        responses: {
          '200': {
            description: 'List of projects/products',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Product' },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Products'],
        summary: 'Create a new product or project showcase',
        description: 'Requires authentication.',
        security: [{ bearerAuth: [] }, { apiKeyAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateProductInput' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Product created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Product' },
              },
            },
          },
          '401': {
            description: 'Unauthorized - Authentication required',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/products/{id}': {
      get: {
        tags: ['Products'],
        summary: 'Get project details by ID or slug',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Product ID or slug',
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Product information',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Product' },
              },
            },
          },
          '404': {
            description: 'Product not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      put: {
        tags: ['Products'],
        summary: 'Update product or project details',
        description: 'Requires authentication.',
        security: [{ bearerAuth: [] }, { apiKeyAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Product ID or slug to update',
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateProductInput' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Product updated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Product' },
              },
            },
          },
          '401': {
            description: 'Unauthorized - Authentication required',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Products'],
        summary: 'Delete project',
        description: 'Requires authentication.',
        security: [{ bearerAuth: [] }, { apiKeyAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Product ID or slug to remove',
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Product removed',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessResponse' },
              },
            },
          },
          '401': {
            description: 'Unauthorized - Authentication required',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/registrations': {
      get: {
        tags: ['Registrations'],
        summary: 'List all event registrations',
        responses: {
          '200': {
            description: 'List of attendee registrations',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Registration' },
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Registrations'],
        summary: 'Delete registration by ID',
        description: 'Requires authentication.',
        security: [{ bearerAuth: [] }, { apiKeyAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'query',
            required: true,
            description: 'Registration ID to remove',
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Registration deleted',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessResponse' },
              },
            },
          },
          '401': {
            description: 'Unauthorized - Authentication required',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '400': {
            description: 'Missing registration ID parameter',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/post': {
      post: {
        tags: ['Posts'],
        summary: 'Create a new blog draft post',
        description: 'Requires authentication.',
        security: [{ bearerAuth: [] }, { apiKeyAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreatePostInput' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Post created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Post' },
              },
            },
          },
          '401': {
            description: 'Unauthorized - Authentication required',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/post/{id}': {
      delete: {
        tags: ['Posts'],
        summary: 'Delete post by ID',
        description: 'Requires authentication.',
        security: [{ bearerAuth: [] }, { apiKeyAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Post ID',
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Post removed',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Post' },
              },
            },
          },
          '401': {
            description: 'Unauthorized - Authentication required',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/publish/{id}': {
      put: {
        tags: ['Posts'],
        summary: 'Publish a draft post',
        description: 'Sets published flag to true for the specified post ID. Requires authentication.',
        security: [{ bearerAuth: [] }, { apiKeyAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Post ID',
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Post published',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Post' },
              },
            },
          },
          '401': {
            description: 'Unauthorized - Authentication required',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/users': {
      get: {
        tags: ['Users'],
        summary: 'List all users',
        description: 'Retrieves all user profiles including roles, Base64 profile pictures, and career timelines.',
        responses: {
          '200': {
            description: 'List of users',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/User' },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Users'],
        summary: 'Create a new user',
        description: 'Requires admin authentication. Accepts Base64 encoded image and timeline array of objects.',
        security: [{ bearerAuth: [] }, { apiKeyAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateUserInput' },
            },
          },
        },
        responses: {
          '201': {
            description: 'User created successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' },
              },
            },
          },
          '400': {
            description: 'Bad Request - Validation error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Get user details by ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'User ID',
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'User details',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' },
              },
            },
          },
          '404': {
            description: 'User not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      put: {
        tags: ['Users'],
        summary: 'Update user by ID',
        description: 'Requires admin authentication. Allows updating name, email, role, tagline, bio, Base64 image, and timeline array.',
        security: [{ bearerAuth: [] }, { apiKeyAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'User ID to update',
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateUserInput' },
            },
          },
        },
        responses: {
          '200': {
            description: 'User updated successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '404': {
            description: 'User not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Users'],
        summary: 'Delete user by ID',
        description: 'Requires admin authentication.',
        security: [{ bearerAuth: [] }, { apiKeyAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'User ID to delete',
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'User deleted successfully',
          },
          '401': {
            description: 'Unauthorized',
          },
          '404': {
            description: 'User not found',
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'API Key or Token',
        description:
          'Enter your `ADMIN_API_KEY` (or `NEXTAUTH_SECRET` / `SECRET` from `.env`) or a NextAuth JWT token obtained via `/api/auth/callback/credentials`.',
      },
      apiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'x-admin-key',
        description: 'Same key as `ADMIN_API_KEY`, sent in the `x-admin-key` header.',
      },
    },
    schemas: {
      TimelineItem: {
        type: 'object',
        required: ['id', 'startYear', 'title', 'institution', 'description'],
        properties: {
          id: { type: 'string', example: 'edu-1' },
          startYear: { type: 'integer', example: 2024 },
          endYear: { type: 'integer', nullable: true, example: 2027 },
          title: { type: 'string', example: 'B.Sc. Mechanical Engineering' },
          institution: { type: 'string', example: 'State University' },
          description: { type: 'string', example: 'Focus on robotics, fluid dynamics, and automated mechanisms.' },
          order: { type: 'integer', example: 1 },
        },
      },
      User: {
        type: 'object',
        required: ['id', 'name'],
        properties: {
          id: { type: 'string', example: 'user-1' },
          name: { type: 'string', example: 'MINH NGOC' },
          email: { type: 'string', nullable: true, example: 'admin@mechgirl.com' },
          role: { type: 'string', example: 'admin' },
          tagline: { type: 'string', nullable: true, example: 'Mechanical Engineering Student & STEM Advocate' },
          bio: { type: 'string', nullable: true, example: 'A passionate mechanical engineering student.' },
          image: {
            type: 'string',
            nullable: true,
            description: 'Base64 encoded image or URL',
            example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
          },
          timeline: {
            type: 'array',
            items: { $ref: '#/components/schemas/TimelineItem' },
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      CreateUserInput: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', example: 'MINH NGOC' },
          email: { type: 'string', example: 'admin@mechgirl.com' },
          role: { type: 'string', enum: ['admin', 'author', 'user'], default: 'user' },
          tagline: { type: 'string', example: 'Mechanical Engineering Student & STEM Advocate' },
          bio: { type: 'string', example: 'A passionate mechanical engineering student.' },
          image: { type: 'string', description: 'Base64 encoded image string or URL' },
          timeline: {
            type: 'array',
            items: { $ref: '#/components/schemas/TimelineItem' },
          },
        },
      },
      UpdateUserInput: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          email: { type: 'string' },
          role: { type: 'string', enum: ['admin', 'author', 'user'] },
          tagline: { type: 'string' },
          bio: { type: 'string' },
          image: { type: 'string', description: 'Base64 encoded image string or URL' },
          timeline: {
            type: 'array',
            items: { $ref: '#/components/schemas/TimelineItem' },
          },
        },
      },
      AboutProfile: {
        type: 'object',
        required: ['name', 'tagline', 'bio'],
        properties: {
          id: { type: 'string', example: 'prof-1' },
          name: { type: 'string', example: 'MINH NGOC' },
          tagline: { type: 'string', example: 'Mechanical Engineering Student & STEM Advocate' },
          bio: {
            type: 'string',
            example: 'A passionate mechanical engineering student exploring robotics and advanced materials.',
          },
          image: {
            type: 'string',
            nullable: true,
            description: 'Base64 encoded image string (e.g. data:image/png;base64,...) or image URL',
            example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
          },
          photoUrl: {
            type: 'string',
            nullable: true,
            description: 'Legacy image URL / alias to image',
            example: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2',
          },
          timeline: {
            type: 'array',
            description: 'Array of timeline objects stored directly in the about table',
            items: { $ref: '#/components/schemas/TimelineItem' },
          },
        },
      },
      Activity: {
        type: 'object',
        required: ['id', 'title', 'slug', 'type', 'date', 'seats', 'registered', 'status'],
        properties: {
          id: { type: 'string', example: 'act-1' },
          title: { type: 'string', example: 'Intro to CAD & 3D Printing' },
          slug: { type: 'string', example: 'intro-to-cad-3d-printing' },
          type: { type: 'string', example: 'Workshop' },
          date: { type: 'string', example: '2026-10-15' },
          time: { type: 'string', nullable: true, example: '14:00 - 17:00' },
          location: { type: 'string', nullable: true, example: 'Makerspace Lab & Online' },
          description: { type: 'string', example: 'Hands-on workshop teaching Fusion 360 basics.' },
          content: { type: 'string', nullable: true, example: 'Detailed syllabus and prerequisites.' },
          image: { type: 'string', nullable: true, example: '/asset/activities/cad-workshop.jpg' },
          seats: { type: 'integer', example: 30 },
          registered: { type: 'integer', example: 12 },
          status: { type: 'string', enum: ['open', 'full', 'past'], example: 'open' },
          featured: { type: 'boolean', example: true },
        },
      },
      CreateActivityInput: {
        type: 'object',
        required: ['title'],
        properties: {
          title: { type: 'string', example: 'Robotics Bootcamp 2026' },
          slug: { type: 'string', example: 'robotics-bootcamp-2026' },
          type: { type: 'string', example: 'Bootcamp' },
          date: { type: 'string', example: '2026-11-01' },
          time: { type: 'string', example: '09:00 - 16:00' },
          location: { type: 'string', example: 'Main Auditorium' },
          description: { type: 'string', example: 'Comprehensive 2-day robotics building challenge.' },
          content: { type: 'string', example: 'Full event schedule...' },
          image: { type: 'string', example: '/asset/activities/robotics.jpg' },
          seats: { type: 'integer', example: 40 },
          featured: { type: 'boolean', example: true },
        },
      },
      UpdateActivityInput: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          slug: { type: 'string' },
          type: { type: 'string' },
          date: { type: 'string' },
          time: { type: 'string' },
          location: { type: 'string' },
          description: { type: 'string' },
          content: { type: 'string' },
          image: { type: 'string' },
          seats: { type: 'integer' },
          status: { type: 'string', enum: ['open', 'full', 'past'] },
          featured: { type: 'boolean' },
        },
      },
      ActivityRegistrationInput: {
        type: 'object',
        required: ['name', 'email', 'phone'],
        properties: {
          name: { type: 'string', example: 'Jane Doe' },
          email: { type: 'string', format: 'email', example: 'jane.doe@example.com' },
          phone: { type: 'string', example: '+1 (555) 987-6543' },
          address: { type: 'string', example: 'Engineering Hall, Rm 204' },
        },
      },
      CarouselSlide: {
        type: 'object',
        required: ['id', 'src', 'order'],
        properties: {
          id: { type: 'string', example: 'carousel-1' },
          src: { type: 'string', example: '/asset/carousel/hero-banner.jpg' },
          alt: { type: 'string', nullable: true, example: 'Robotics Workshop in Session' },
          title: { type: 'string', nullable: true, example: 'Empowering Women in Mechanics' },
          subtitle: { type: 'string', nullable: true, example: 'Hands-on innovation, community, and growth' },
          order: { type: 'integer', example: 1 },
        },
      },
      CreateCarouselSlideInput: {
        type: 'object',
        required: ['src'],
        properties: {
          src: { type: 'string', example: '/asset/carousel/new-slide.jpg' },
          alt: { type: 'string', example: 'New Slide Image' },
          title: { type: 'string', example: 'Featured STEM Project' },
          subtitle: { type: 'string', example: 'Showcasing student robotics achievements' },
          order: { type: 'integer', example: 5 },
        },
      },
      ContactInfo: {
        type: 'object',
        required: ['name', 'email'],
        properties: {
          id: { type: 'string', example: 'contact-1' },
          name: { type: 'string', example: 'MechGirl' },
          tagline: { type: 'string', example: 'Dream it, Scheme it, STEM it!' },
          email: { type: 'string', format: 'email', example: 'contact@mechgirl.com' },
          phone: { type: 'string', nullable: true, example: '+1 (555) 123-4567' },
          address: { type: 'string', nullable: true, example: '123 Engineering Way, Innovation District, CA 94043' },
          about: { type: 'string', nullable: true, example: 'A collaborative STEM community.' },
          socials: {
            type: 'object',
            properties: {
              facebook: { type: 'string', example: 'https://facebook.com/mechgirl' },
              youtube: { type: 'string', example: 'https://youtube.com/@mechgirl' },
              github: { type: 'string', example: 'https://github.com/mechgirl' },
              instagram: { type: 'string', example: 'https://instagram.com/mechgirl_official' },
              linkedin: { type: 'string', example: 'https://linkedin.com/company/mechgirl' },
            },
          },
        },
      },
      ContactMessage: {
        type: 'object',
        required: ['id', 'name', 'email', 'message', 'createdAt'],
        properties: {
          id: { type: 'string', example: 'msg-1' },
          name: { type: 'string', example: 'Alex Smith' },
          email: { type: 'string', format: 'email', example: 'alex@example.com' },
          subject: { type: 'string', nullable: true, example: 'Partnership Inquiry' },
          message: { type: 'string', example: 'Hello! I would love to collaborate on a workshop.' },
          createdAt: { type: 'string', format: 'date-time', example: '2026-09-01T12:00:00Z' },
        },
      },
      SubmitContactMessageInput: {
        type: 'object',
        required: ['name', 'email', 'message'],
        properties: {
          name: { type: 'string', example: 'Alex Smith' },
          email: { type: 'string', format: 'email', example: 'alex@example.com' },
          subject: { type: 'string', example: 'Question regarding events' },
          message: { type: 'string', example: 'Can high school students also join the robotics workshop?' },
        },
      },
      Product: {
        type: 'object',
        required: ['id', 'title', 'slug', 'category', 'description', 'tags', 'featured'],
        properties: {
          id: { type: 'string', example: 'prod-1' },
          title: { type: 'string', example: 'Automated 4-DOF Robotic Arm' },
          slug: { type: 'string', example: 'automated-4-dof-robotic-arm' },
          category: { type: 'string', example: 'Robotics' },
          description: { type: 'string', example: 'Custom designed 3D printed robotic arm with Inverse Kinematics.' },
          content: { type: 'string', nullable: true, example: 'Detailed documentation and schematics.' },
          image: { type: 'string', nullable: true, example: '/asset/products/robotic-arm.jpg' },
          github: { type: 'string', nullable: true, example: 'https://github.com/mechgirl/robotic-arm' },
          demo: { type: 'string', nullable: true, example: 'https://demo.mechgirl.com/robotic-arm' },
          tags: {
            type: 'array',
            items: { type: 'string' },
            example: ['Robotics', 'Arduino', '3D Printing', 'Inverse Kinematics'],
          },
          featured: { type: 'boolean', example: true },
        },
      },
      CreateProductInput: {
        type: 'object',
        required: ['title'],
        properties: {
          title: { type: 'string', example: 'IoT Environmental Sensor Pod' },
          slug: { type: 'string', example: 'iot-environmental-sensor-pod' },
          category: { type: 'string', example: 'IoT' },
          description: { type: 'string', example: 'Solar-powered ambient temperature & humidity monitor.' },
          content: { type: 'string', example: 'Circuit layout and ESP32 firmware.' },
          image: { type: 'string', example: '/asset/products/sensor-pod.jpg' },
          github: { type: 'string', example: 'https://github.com/mechgirl/sensor-pod' },
          demo: { type: 'string', example: 'https://sensors.mechgirl.com' },
          tags: {
            type: 'array',
            items: { type: 'string' },
            example: ['ESP32', 'IoT', 'Solar', 'C++'],
          },
          featured: { type: 'boolean', example: false },
        },
      },
      UpdateProductInput: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          slug: { type: 'string' },
          category: { type: 'string' },
          description: { type: 'string' },
          content: { type: 'string' },
          image: { type: 'string' },
          github: { type: 'string' },
          demo: { type: 'string' },
          tags: { type: 'array', items: { type: 'string' } },
          featured: { type: 'boolean' },
        },
      },
      Registration: {
        type: 'object',
        required: ['id', 'name', 'email', 'phone', 'activityId'],
        properties: {
          id: { type: 'string', example: 'reg-1725345000000' },
          name: { type: 'string', example: 'Sarah Connor' },
          email: { type: 'string', format: 'email', example: 'sarah@example.com' },
          phone: { type: 'string', example: '+1 (555) 432-1098' },
          address: { type: 'string', nullable: true, example: '456 Tech Avenue' },
          activityId: { type: 'string', example: 'act-1' },
          activityTitle: { type: 'string', nullable: true, example: 'Intro to CAD & 3D Printing' },
          createdAt: { type: 'string', format: 'date-time', example: '2026-09-02T10:30:00Z' },
        },
      },
      Post: {
        type: 'object',
        required: ['id', 'title', 'published'],
        properties: {
          id: { type: 'string', example: 'post-1' },
          title: { type: 'string', example: 'My Journey into Robotics' },
          content: { type: 'string', nullable: true, example: 'Reflecting on my first robotic arm build...' },
          published: { type: 'boolean', example: true },
          authorId: { type: 'string', nullable: true, example: 'user-1' },
        },
      },
      CreatePostInput: {
        type: 'object',
        required: ['title'],
        properties: {
          title: { type: 'string', example: 'Designing Precision Gears' },
          content: { type: 'string', example: 'Key lessons learned while 3D printing involute gears.' },
        },
      },
      SuccessResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Operation completed successfully' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'An error occurred while processing the request' },
          message: { type: 'string', example: 'Unauthorized' },
        },
      },
    },
  },
};
