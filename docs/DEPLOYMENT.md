# Deployment Guide

This guide covers various deployment strategies for the Portfolio Website Backend.

## Prerequisites

Before deploying, ensure you have:
- MongoDB database (local or cloud-based like MongoDB Atlas)
- Environment variables configured
- Node.js runtime environment
- Domain name (optional but recommended)

## Environment Setup

### Production Environment Variables

Create a `.env` file with production values:

```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/portfolio_db
JWT_SECRET=your_very_secure_and_long_jwt_secret_key_for_production
```

### Security Considerations

1. **JWT Secret**: Use a strong, random secret key (at least 32 characters)
2. **MongoDB Connection**: Use MongoDB Atlas or a secured MongoDB instance
3. **CORS Configuration**: Restrict CORS to your frontend domain in production
4. **Environment Variables**: Never commit `.env` files to version control

## Deployment Options

### 1. Heroku Deployment

#### Step 1: Install Heroku CLI
```bash
# Install Heroku CLI
npm install -g heroku
```

#### Step 2: Login and Create App
```bash
# Login to Heroku
heroku login

# Create new Heroku app
heroku create your-portfolio-backend

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGO_URI=your_mongodb_connection_string
heroku config:set JWT_SECRET=your_jwt_secret
```

#### Step 3: Deploy
```bash
# Add Heroku remote
git remote add heroku https://git.heroku.com/your-portfolio-backend.git

# Deploy to Heroku
git push heroku main
```

#### Step 4: Verify Deployment
```bash
heroku logs --tail
heroku open
```

### 2. Vercel Deployment

#### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

#### Step 2: Create vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/index.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

#### Step 3: Deploy
```bash
# Login to Vercel
vercel login

# Deploy
vercel

# Set environment variables in Vercel dashboard
# or use CLI:
vercel env add MONGO_URI
vercel env add JWT_SECRET
```

### 3. DigitalOcean App Platform

#### Step 1: Create App Spec File
Create `.do/app.yaml`:
```yaml
name: portfolio-backend
services:
- name: api
  source_dir: /
  github:
    repo: your-username/Portfolio-Website-Backend
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: NODE_ENV
    value: production
  - key: PORT
    value: "8080"
  - key: MONGO_URI
    value: YOUR_MONGODB_CONNECTION_STRING
    type: SECRET
  - key: JWT_SECRET
    value: YOUR_JWT_SECRET
    type: SECRET
```

#### Step 2: Deploy via DigitalOcean Dashboard
1. Go to DigitalOcean App Platform
2. Create new app from GitHub repository
3. Configure environment variables
4. Deploy

### 4. AWS EC2 Deployment

#### Step 1: Launch EC2 Instance
```bash
# Connect to EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip
```

#### Step 2: Install Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2
```

#### Step 3: Deploy Application
```bash
# Clone repository
git clone https://github.com/your-username/Portfolio-Website-Backend.git
cd Portfolio-Website-Backend

# Install dependencies
npm install

# Create .env file
nano .env
# Add your environment variables

# Start with PM2
pm2 start src/index.js --name "portfolio-backend"
pm2 startup
pm2 save
```

#### Step 4: Configure Nginx (Optional)
```bash
# Install Nginx
sudo apt install nginx

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/portfolio-backend
```

Nginx configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 5. Docker Deployment

#### Step 1: Create Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY src/ ./src/

EXPOSE 5000

USER node

CMD ["npm", "start"]
```

#### Step 2: Create .dockerignore
```
node_modules
npm-debug.log
.env
.git
README.md
.gitignore
```

#### Step 3: Build and Run
```bash
# Build Docker image
docker build -t portfolio-backend .

# Run container
docker run -d \
  --name portfolio-backend \
  -p 5000:5000 \
  -e NODE_ENV=production \
  -e MONGO_URI=your_mongodb_uri \
  -e JWT_SECRET=your_jwt_secret \
  portfolio-backend
```

## Database Setup

### MongoDB Atlas Setup

1. Create MongoDB Atlas account
2. Create new cluster
3. Configure network access (whitelist IP addresses)
4. Create database user
5. Get connection string
6. Update MONGO_URI in environment variables

### Local MongoDB (Development)

```bash
# Install MongoDB
# For Ubuntu:
sudo apt install mongodb

# Start MongoDB service
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Create database and user
mongo
use portfolio_db
db.createUser({
  user: "portfolio_user",
  pwd: "secure_password",
  roles: [{ role: "readWrite", db: "portfolio_db" }]
})
```

## Post-Deployment Checklist

- [ ] Verify all environment variables are set correctly
- [ ] Test all API endpoints
- [ ] Check database connectivity
- [ ] Verify JWT token generation and validation
- [ ] Test CORS settings with frontend
- [ ] Monitor application logs
- [ ] Set up health checks
- [ ] Configure SSL/HTTPS (for production)
- [ ] Set up monitoring and alerting
- [ ] Configure backup strategy

## Monitoring and Maintenance

### Health Check Endpoint
Add a health check endpoint to your application:

```javascript
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

### Logging
Implement structured logging for production:

```bash
npm install winston
```

### Performance Monitoring
Consider using tools like:
- New Relic
- Datadog
- Application Insights (Azure)
- CloudWatch (AWS)

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Find process using port
   lsof -i :5000
   # Kill process
   kill -9 <PID>
   ```

2. **MongoDB Connection Issues**
   - Check connection string format
   - Verify network access in MongoDB Atlas
   - Ensure database user has correct permissions

3. **Environment Variables Not Loading**
   - Verify .env file location
   - Check if dotenv is properly configured
   - Ensure variables are set in deployment platform

4. **CORS Issues**
   - Update CORS configuration for production domain
   - Check preflight request handling

### Logs and Debugging

```bash
# Heroku logs
heroku logs --tail

# PM2 logs
pm2 logs portfolio-backend

# Docker logs
docker logs portfolio-backend
```
