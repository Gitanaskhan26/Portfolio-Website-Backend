# Portfolio Website Backend

A RESTful API backend service for a portfolio website built with Node.js, Express.js, and MongoDB. This backend provides endpoints for managing projects, blog posts, contact messages, and admin authentication.

## 🚀 Features

- **Authentication System**: JWT-based admin login
- **Project Management**: CRUD operations for portfolio projects
- **Blog Management**: Create, read, and delete blog posts
- **Contact System**: Store and manage contact form submissions
- **Database Integration**: MongoDB with Mongoose ODM
- **CORS Enabled**: Cross-origin resource sharing support
- **Environment Variables**: Secure configuration management

## 📋 Table of Contents

- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Database Models](#database-models)
- [Authentication](#authentication)
- [Usage](#usage)
- [Contributing](#contributing)

## 🛠 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Gitanaskhan26/Portfolio-Website-Backend.git
   cd Portfolio-Website-Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables** (see [Environment Variables](#environment-variables))

4. **Start the server**
   ```bash
   npm start
   ```

The server will start on port 5000 by default or the port specified in your environment variables.

## 🔧 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
MONGO_URI=mongodb://localhost:27017/portfolio_db
# or for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/portfolio_db

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here

# Server Port (optional)
PORT=5000
```

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/login` | Admin login | No |

### Projects
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/projects` | Get all projects | No |
| POST | `/api/projects` | Add new project | Yes |
| DELETE | `/api/projects/:id` | Delete project | Yes |

### Blogs
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/blogs` | Get all blog posts | No |
| POST | `/api/blogs` | Add new blog post | Yes |
| DELETE | `/api/blogs/:id` | Delete blog post | Yes |

### Contact
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/contact` | Submit contact message | No |

### Base Route
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API status check |

## 📁 Project Structure

```
Portfolio-Website-Backend/
├── package.json                 # Project dependencies and scripts
├── README.md                   # Project documentation
└── src/
    ├── index.js                # Main application entry point
    ├── config/
    │   └── db.js              # Database connection configuration
    ├── controllers/
    │   ├── authController.js   # Authentication logic
    │   ├── blogController.js   # Blog operations
    │   ├── contactController.js # Contact form handling
    │   └── projectController.js # Project management
    ├── middleware/
    │   └── authMiddleware.js   # JWT authentication middleware
    ├── models/
    │   ├── Blog.js            # Blog post schema
    │   ├── Contact.js         # Contact message schema
    │   ├── Project.js         # Project schema
    │   └── User.js            # User/Admin schema
    └── routes/
        ├── authRoutes.js      # Authentication routes
        ├── blogRoutes.js      # Blog routes
        ├── contactRoutes.js   # Contact routes
        └── projectRoutes.js   # Project routes
```

## 🗄 Database Models

### User Model
```javascript
{
  username: String (required, unique)
  password: String (required, hashed)
}
```

### Project Model
```javascript
{
  title: String (required)
  category: String (required)
  image: String (required)
}
```

### Blog Model
```javascript
{
  title: String (required)
  content: String (required)
  createdAt: Date (default: Date.now)
}
```

### Contact Model
```javascript
{
  name: String (required)
  email: String (required)
  message: String (required)
  createdAt: Date (default: Date.now)
}
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Protected routes require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Login Process
1. Send POST request to `/api/auth/login` with email and password
2. Receive JWT token in response
3. Include token in Authorization header for protected routes

## 📝 Usage Examples

### Admin Login
```javascript
// POST /api/auth/login
{
  "email": "admin@example.com",
  "password": "your_password"
}

// Response
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Add Project
```javascript
// POST /api/projects (with Authorization header)
{
  "title": "My Portfolio Website",
  "category": "Web Development",
  "image": "https://example.com/image.jpg"
}

// Response
{
  "message": "Project added successfully"
}
```

### Submit Contact Form
```javascript
// POST /api/contact
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Hello, I'm interested in your services."
}

// Response
{
  "message": "Message received. We will contact you soon."
}
```

### Add Blog Post
```javascript
// POST /api/blogs (with Authorization header)
{
  "title": "My First Blog Post",
  "content": "This is the content of my blog post..."
}

// Response
{
  "message": "Blog added successfully"
}
```

## 🔧 Development

### Dependencies
- **express**: Web framework for Node.js
- **mongoose**: MongoDB ODM
- **dotenv**: Environment variable management
- **cors**: Cross-Origin Resource Sharing
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT implementation

### Key Features
- **Password Security**: Passwords are hashed using bcrypt before storage
- **Token Expiration**: JWT tokens expire after 1 hour
- **Error Handling**: Comprehensive error handling with appropriate HTTP status codes
- **Input Validation**: Request validation through Mongoose schemas
- **CORS Support**: Configured for cross-origin requests

## 🚨 Error Handling

The API returns appropriate HTTP status codes:
- `200`: Success
- `401`: Unauthorized (invalid credentials)
- `403`: Forbidden (no token or invalid token)
- `404`: Not Found
- `500`: Internal Server Error

Error responses follow this format:
```javascript
{
  "message": "Error description",
  "error": "Detailed error object (in development)"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**gitanaskhan26**
- GitHub: [@Gitanaskhan26](https://github.com/Gitanaskhan26)

## 🆘 Support

If you have any questions or need help with setup, please open an issue on GitHub.

---

**Happy Coding! 🚀**
