# Database Schema Documentation

This document describes the MongoDB database schema used in the Portfolio Website Backend.

## Database Overview

The application uses MongoDB as its primary database, accessed through Mongoose ODM. The database contains four main collections:

- `users` - Admin user accounts
- `projects` - Portfolio projects
- `blogs` - Blog posts
- `contacts` - Contact form submissions

## Collections

### Users Collection

**Collection Name:** `users`

**Schema:**
```javascript
{
  _id: ObjectId,           // MongoDB auto-generated ID
  username: String,        // Unique username (required)
  password: String,        // Hashed password (required)
  __v: Number             // Mongoose version key
}
```

**Indexes:**
- `username`: Unique index for fast lookups and constraint enforcement

**Pre-save Hooks:**
- Password hashing using bcrypt with salt rounds of 10

**Example Document:**
```json
{
  "_id": "63c78f4a754b3d0016274a9d",
  "username": "admin",
  "password": "$2a$10$N9qo8uLOickgx2ZMRZoMye.fDdZI5GF3UZ2xP1rnNW5CUvs/W5RFm",
  "__v": 0
}
```

---

### Projects Collection

**Collection Name:** `projects`

**Schema:**
```javascript
{
  _id: ObjectId,           // MongoDB auto-generated ID
  title: String,           // Project title (required)
  category: String,        // Project category (required)
  image: String,           // Image URL (required)
  __v: Number             // Mongoose version key
}
```

**Validation Rules:**
- `title`: Required, string
- `category`: Required, string
- `image`: Required, string (should be a valid URL)

**Example Document:**
```json
{
  "_id": "63c78f4a754b3d0016274a9e",
  "title": "Portfolio Website",
  "category": "Web Development",
  "image": "https://example.com/portfolio-screenshot.jpg",
  "__v": 0
}
```

**Common Categories:**
- Web Development
- Mobile Development
- Desktop Application
- Data Analysis
- Machine Learning
- UI/UX Design

---

### Blogs Collection

**Collection Name:** `blogs`

**Schema:**
```javascript
{
  _id: ObjectId,           // MongoDB auto-generated ID
  title: String,           // Blog post title (required)
  content: String,         // Blog post content (required)
  createdAt: Date,         // Creation timestamp (auto-generated)
  __v: Number             // Mongoose version key
}
```

**Validation Rules:**
- `title`: Required, string
- `content`: Required, string
- `createdAt`: Automatically set to current date/time

**Default Values:**
- `createdAt`: `Date.now()`

**Example Document:**
```json
{
  "_id": "63c78f4a754b3d0016274a9f",
  "title": "Getting Started with Node.js",
  "content": "Node.js is a powerful runtime environment that allows developers to run JavaScript on the server side...",
  "createdAt": "2023-01-17T10:30:00.000Z",
  "__v": 0
}
```

---

### Contacts Collection

**Collection Name:** `contacts`

**Schema:**
```javascript
{
  _id: ObjectId,           // MongoDB auto-generated ID
  name: String,            // Contact name (required)
  email: String,           // Contact email (required)
  message: String,         // Contact message (required)
  createdAt: Date,         // Creation timestamp (auto-generated)
  __v: Number             // Mongoose version key
}
```

**Validation Rules:**
- `name`: Required, string
- `email`: Required, string (should be valid email format)
- `message`: Required, string
- `createdAt`: Automatically set to current date/time

**Default Values:**
- `createdAt`: `Date.now()`

**Example Document:**
```json
{
  "_id": "63c78f4a754b3d0016274aa0",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "message": "Hello, I'm interested in your web development services. Could you please contact me to discuss a potential project?",
  "createdAt": "2023-01-17T15:45:00.000Z",
  "__v": 0
}
```

## Database Connection

The database connection is configured in `src/config/db.js` and uses the following settings:

```javascript
{
  useNewUrlParser: true,
  useUnifiedTopology: true
}
```

**Connection String Format:**
```
mongodb://localhost:27017/portfolio_db
```

For MongoDB Atlas:
```
mongodb+srv://username:password@cluster.mongodb.net/portfolio_db
```

## Performance Considerations

### Indexes
Currently, only the default `_id` index and unique `username` index are implemented. Consider adding indexes for:

- `blogs.createdAt` - For sorting blog posts by date
- `contacts.createdAt` - For sorting contact messages by date
- `projects.category` - For filtering projects by category

### Aggregation Pipeline Opportunities

Future enhancements could include:
- Blog post statistics (count by month/year)
- Project categorization analytics
- Contact form submission trends

## Data Migration

### Initial Admin User Setup
To create the first admin user, you can use MongoDB shell or a migration script:

```javascript
// Create admin user
db.users.insertOne({
  username: "admin",
  password: "$2a$10$N9qo8uLOickgx2ZMRZoMye.fDdZI5GF3UZ2xP1rnNW5CUvs/W5RFm" // bcrypt hash of "admin123"
});
```

### Backup Strategy
Recommended backup approach:
1. Use `mongodump` for full database backups
2. Implement automated daily backups
3. Store backups in cloud storage (AWS S3, Google Cloud Storage)

### Data Validation

The application relies on Mongoose schema validation. Additional validation should be implemented at the application level for:
- Email format validation for contacts
- URL validation for project images
- Content length limits for blog posts

## Security Considerations

1. **Password Security**: User passwords are hashed using bcrypt with 10 salt rounds
2. **Input Sanitization**: Consider implementing input sanitization for user-generated content
3. **Database Access**: Use MongoDB connection string with authentication in production
4. **Backup Security**: Encrypt database backups and use secure transfer protocols
