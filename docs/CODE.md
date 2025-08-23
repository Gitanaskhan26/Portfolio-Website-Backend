# Code Documentation

This document provides detailed documentation for all modules, functions, and components in the Portfolio Website Backend.

## Table of Contents

1. [Application Entry Point](#application-entry-point)
2. [Configuration](#configuration)
3. [Models](#models)
4. [Controllers](#controllers)
5. [Middleware](#middleware)
6. [Routes](#routes)
7. [Utilities](#utilities)

## Application Entry Point

### src/index.js

**Purpose**: Main application file that initializes the Express server, configures middleware, and sets up routes.

**Key Components**:
- Express application setup
- Database connection initialization
- Middleware configuration (JSON parsing, CORS)
- Route registration
- Static file serving
- Error handling for undefined routes

**Dependencies**:
- `express`: Web framework
- `cors`: Cross-origin resource sharing
- `dotenv`: Environment variable management
- `path`: Node.js path utilities

**Environment Variables Used**:
- `PORT`: Server port (default: 5000)

## Configuration

### src/config/db.js

**Purpose**: Database connection configuration and initialization.

**Functions**:

#### `connectDB()`
- **Type**: Async function
- **Purpose**: Establishes MongoDB connection using Mongoose
- **Parameters**: None
- **Returns**: Promise<void>
- **Error Handling**: Exits process on connection failure
- **Environment Variables**: `MONGO_URI`

**Features**:
- Connection retry logic through Mongoose
- Proper error logging
- Modern connection options (useNewUrlParser, useUnifiedTopology)

## Models

### src/models/User.js

**Purpose**: User/Admin account data model with authentication features.

**Schema Fields**:
- `username`: String, required, unique
- `password`: String, required (automatically hashed)

**Pre-save Hooks**:
- Password hashing using bcrypt (10 salt rounds)
- Only hashes password when modified

**Security Features**:
- Automatic password hashing
- Unique username constraint

### src/models/Project.js

**Purpose**: Portfolio project data model.

**Schema Fields**:
- `title`: String, required - Project name/title
- `category`: String, required - Project category (e.g., "Web Development")
- `image`: String, required - URL to project image/screenshot

**Use Cases**:
- Portfolio project display
- Project categorization
- Project management by admin

### src/models/Blog.js

**Purpose**: Blog post data model with automatic timestamps.

**Schema Fields**:
- `title`: String, required - Blog post title
- `content`: String, required - Blog post content (supports HTML)
- `createdAt`: Date, default: Date.now - Creation timestamp

**Features**:
- Automatic timestamp generation
- Flexible content storage (supports markdown/HTML)

### src/models/Contact.js

**Purpose**: Contact form submission data model.

**Schema Fields**:
- `name`: String, required - Contact person's name
- `email`: String, required - Contact email address
- `message`: String, required - Contact message content
- `createdAt`: Date, default: Date.now - Submission timestamp

**Use Cases**:
- Contact form submissions
- Customer inquiry management
- Communication tracking

## Controllers

### src/controllers/authController.js

**Purpose**: Authentication logic and JWT token management.

#### `adminLogin(req, res)`
- **Type**: Async function
- **Purpose**: Authenticates admin users and generates JWT tokens
- **Parameters**: 
  - `req.body.email`: Admin email
  - `req.body.password`: Admin password
- **Returns**: JWT token on success, error message on failure
- **Security Features**:
  - Password comparison using bcrypt
  - JWT token generation with expiration
  - Detailed logging for debugging

**Authentication Flow**:
1. Extract email and password from request
2. Find user in database by email
3. Compare provided password with hashed password
4. Generate JWT token if authentication successful
5. Return token or error message

### src/controllers/projectController.js

**Purpose**: Project management operations (CRUD).

#### `getProjects(req, res)`
- **Type**: Async function
- **Purpose**: Retrieve all projects from database
- **Authentication**: Not required
- **Returns**: Array of project objects

#### `addProject(req, res)`
- **Type**: Async function
- **Purpose**: Create new project entry
- **Authentication**: Required (JWT token)
- **Parameters**:
  - `req.body.title`: Project title
  - `req.body.category`: Project category
  - `req.body.image`: Project image URL
- **Returns**: Success message or error

#### `deleteProject(req, res)`
- **Type**: Async function
- **Purpose**: Delete project by ID
- **Authentication**: Required (JWT token)
- **Parameters**: `req.params.id` - Project MongoDB ObjectId
- **Returns**: Success message or error

### src/controllers/blogController.js

**Purpose**: Blog post management operations.

#### `getBlogs(req, res)`
- **Type**: Async function
- **Purpose**: Retrieve all blog posts
- **Authentication**: Not required
- **Returns**: Array of blog post objects with timestamps

#### `addBlog(req, res)`
- **Type**: Async function
- **Purpose**: Create new blog post
- **Authentication**: Required (JWT token)
- **Parameters**:
  - `req.body.title`: Blog post title
  - `req.body.content`: Blog post content
- **Returns**: Success message or error

#### `deleteBlog(req, res)`
- **Type**: Async function
- **Purpose**: Delete blog post by ID
- **Authentication**: Required (JWT token)
- **Parameters**: `req.params.id` - Blog MongoDB ObjectId
- **Returns**: Success message or error

### src/controllers/contactController.js

**Purpose**: Contact form submission handling.

#### `saveContact(req, res)`
- **Type**: Async function
- **Purpose**: Save contact form submission to database
- **Authentication**: Not required
- **Parameters**:
  - `req.body.name`: Contact name
  - `req.body.email`: Contact email
  - `req.body.message`: Contact message
- **Returns**: Confirmation message or error

**Features**:
- Automatic timestamp generation
- Input validation through Mongoose schema
- User-friendly response messages

## Middleware

### src/middleware/authMiddleware.js

**Purpose**: JWT authentication middleware for protecting routes.

#### `authMiddleware(req, res, next)`
- **Type**: Middleware function
- **Purpose**: Validate JWT tokens and protect routes
- **Parameters**:
  - `req`: Express request object
  - `res`: Express response object
  - `next`: Next middleware function
- **Behavior**:
  - Extracts token from Authorization header
  - Supports both "Bearer token" and plain token formats
  - Verifies token using JWT secret
  - Attaches user data to request object
  - Calls next() on success, returns 403 on failure

**Token Formats Supported**:
- `Authorization: Bearer <token>`
- `Authorization: <token>`

**Error Responses**:
- 403: "Access denied - No token provided"
- 403: "Invalid token - Authentication failed"

## Routes

### src/routes/authRoutes.js

**Purpose**: Authentication endpoint definitions.

**Routes**:
- `POST /login` - Admin login endpoint
  - Handler: `authController.adminLogin`
  - Authentication: Not required
  - Purpose: Generate JWT token for admin access

### src/routes/projectRoutes.js

**Purpose**: Project management endpoint definitions.

**Routes**:
- `GET /` - Get all projects
  - Handler: `projectController.getProjects`
  - Authentication: Not required
  - Purpose: Public project listing

- `POST /` - Add new project
  - Handler: `projectController.addProject`
  - Authentication: Required (authMiddleware)
  - Purpose: Admin project creation

- `DELETE /:id` - Delete project
  - Handler: `projectController.deleteProject`
  - Authentication: Required (authMiddleware)
  - Purpose: Admin project deletion

### src/routes/blogRoutes.js

**Purpose**: Blog management endpoint definitions.

**Routes**:
- `GET /` - Get all blog posts
  - Handler: `blogController.getBlogs`
  - Authentication: Not required
  - Purpose: Public blog listing

- `POST /` - Add new blog post
  - Handler: `blogController.addBlog`
  - Authentication: Required (authMiddleware)
  - Purpose: Admin blog creation

- `DELETE /:id` - Delete blog post
  - Handler: `blogController.deleteBlog`
  - Authentication: Required (authMiddleware)
  - Purpose: Admin blog deletion

### src/routes/contactRoutes.js

**Purpose**: Contact form endpoint definitions.

**Routes**:
- `POST /` - Submit contact message
  - Handler: `contactController.saveContact`
  - Authentication: Not required
  - Purpose: Public contact form submission

## Security Features

### Password Security
- **Hashing**: bcrypt with 10 salt rounds
- **Pre-save Hook**: Automatic password hashing in User model
- **Comparison**: Secure password comparison using bcrypt.compare()

### JWT Security
- **Secret**: Uses environment variable JWT_SECRET
- **Expiration**: Tokens expire after 1 hour
- **Validation**: Comprehensive token validation in middleware
- **Format Support**: Flexible token format handling

### Input Validation
- **Mongoose Schemas**: Built-in validation for all models
- **Required Fields**: Enforced at database level
- **Unique Constraints**: Username uniqueness enforced

### Error Handling
- **Comprehensive**: Error handling in all controller functions
- **Status Codes**: Appropriate HTTP status codes for different scenarios
- **Logging**: Detailed error logging for debugging
- **User-Friendly**: Clean error messages for API consumers

## Performance Considerations

### Database Operations
- **Mongoose ODM**: Efficient MongoDB operations
- **Connection Pooling**: Built-in connection pooling
- **Indexing**: Automatic indexing on unique fields

### API Design
- **RESTful**: Standard REST API patterns
- **Stateless**: JWT-based stateless authentication
- **CORS**: Configured for cross-origin requests

### Scalability
- **Modular Structure**: Separation of concerns
- **Environment Configuration**: Easy deployment configuration
- **Middleware Pattern**: Reusable middleware components

## Error Codes Reference

| Status Code | Description | Common Causes |
|-------------|-------------|---------------|
| 200 | Success | Successful operations |
| 401 | Unauthorized | Invalid login credentials |
| 403 | Forbidden | Missing or invalid JWT token |
| 404 | Not Found | Invalid API endpoint |
| 500 | Internal Server Error | Database errors, server issues |

## Environment Variables Reference

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | 5000 |
| `MONGO_URI` | MongoDB connection string | Yes | None |
| `JWT_SECRET` | JWT signing secret | Yes | None |
| `NODE_ENV` | Environment mode | No | development |

## Best Practices Implemented

1. **Separation of Concerns**: Clear separation between routes, controllers, models, and middleware
2. **Error Handling**: Comprehensive error handling with appropriate HTTP status codes
3. **Security**: Password hashing, JWT authentication, input validation
4. **Documentation**: Inline comments and comprehensive API documentation
5. **Environment Configuration**: Externalized configuration using environment variables
6. **Modular Structure**: Organized file structure for maintainability
7. **RESTful Design**: Standard REST API conventions
