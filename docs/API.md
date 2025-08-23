# API Documentation

This document provides detailed information about all API endpoints, request/response formats, and authentication requirements.

## Base URL
```
http://localhost:5000/api
```

## Authentication

### Admin Login
Authenticates an admin user and returns a JWT token.

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "adminpassword"
}
```

**Success Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYzYzc4ZjRhNzU0YjNkMDAxNjI3NGE5ZCIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTY3Mzk3NjI2MiwiZXhwIjoxNjczOTc5ODYyfQ.example"
}
```

**Error Response (401):**
```json
{
  "message": "Invalid credentials"
}
```

---

## Projects

### Get All Projects
Retrieves all projects from the database.

**Endpoint:** `GET /projects`

**Authentication:** Not required

**Success Response (200):**
```json
[
  {
    "_id": "63c78f4a754b3d0016274a9d",
    "title": "Portfolio Website",
    "category": "Web Development",
    "image": "https://example.com/portfolio.jpg",
    "__v": 0
  },
  {
    "_id": "63c78f4a754b3d0016274a9e",
    "title": "E-commerce App",
    "category": "Mobile Development",
    "image": "https://example.com/ecommerce.jpg",
    "__v": 0
  }
]
```

### Add New Project
Creates a new project entry.

**Endpoint:** `POST /projects`

**Authentication:** Required (Bearer token)

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "My New Project",
  "category": "Web Development",
  "image": "https://example.com/project-image.jpg"
}
```

**Success Response (200):**
```json
{
  "message": "Project added successfully"
}
```

**Error Response (403):**
```json
{
  "message": "Access denied"
}
```

### Delete Project
Deletes a project by ID.

**Endpoint:** `DELETE /projects/:id`

**Authentication:** Required (Bearer token)

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**URL Parameters:**
- `id` (string): MongoDB ObjectId of the project

**Success Response (200):**
```json
{
  "message": "Project deleted successfully"
}
```

---

## Blogs

### Get All Blogs
Retrieves all blog posts from the database.

**Endpoint:** `GET /blogs`

**Authentication:** Not required

**Success Response (200):**
```json
[
  {
    "_id": "63c78f4a754b3d0016274a9f",
    "title": "Getting Started with Node.js",
    "content": "Node.js is a powerful runtime environment...",
    "createdAt": "2023-01-17T10:30:00.000Z",
    "__v": 0
  },
  {
    "_id": "63c78f4a754b3d0016274aa0",
    "title": "MongoDB Best Practices",
    "content": "When working with MongoDB, there are several...",
    "createdAt": "2023-01-16T14:20:00.000Z",
    "__v": 0
  }
]
```

### Add New Blog Post
Creates a new blog post.

**Endpoint:** `POST /blogs`

**Authentication:** Required (Bearer token)

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "My New Blog Post",
  "content": "This is the content of my blog post. It can be very long and contain HTML markup if needed."
}
```

**Success Response (200):**
```json
{
  "message": "Blog added successfully"
}
```

### Delete Blog Post
Deletes a blog post by ID.

**Endpoint:** `DELETE /blogs/:id`

**Authentication:** Required (Bearer token)

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**URL Parameters:**
- `id` (string): MongoDB ObjectId of the blog post

**Success Response (200):**
```json
{
  "message": "Blog deleted successfully"
}
```

---

## Contact

### Submit Contact Message
Saves a contact form submission to the database.

**Endpoint:** `POST /contact`

**Authentication:** Not required

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "message": "Hello, I'm interested in your services. Please contact me for more information."
}
```

**Success Response (200):**
```json
{
  "message": "Message received. We will contact you soon."
}
```

**Error Response (500):**
```json
{
  "message": "Error submitting message",
  "error": "Detailed error object"
}
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 401 | Unauthorized - Invalid credentials |
| 403 | Forbidden - No token or invalid token |
| 404 | Not Found - Route not found |
| 500 | Internal Server Error |

## Authentication Headers

For protected routes, include the JWT token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYzYzc4ZjRhNzU0YjNkMDAxNjI3NGE5ZCIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTY3Mzk3NjI2MiwiZXhwIjoxNjczOTc5ODYyfQ.example
```

## Rate Limiting

Currently, there are no rate limiting measures implemented. Consider adding rate limiting for production use.

## CORS

The API is configured to accept requests from all origins. For production, configure CORS to only allow requests from your frontend domain.

## Data Validation

All models include basic validation:
- Required fields are enforced
- Unique constraints where applicable
- Automatic timestamps for creation dates
