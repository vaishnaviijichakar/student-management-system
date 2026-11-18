# ==========================================
# Student Management System - Dockerfile
# Optimized for Cloud Deployment on Render
# ==========================================
FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

# Copy dependency files first for optimal layer caching
COPY backend/package*.json ./backend/

# Install dependencies in backend directory
WORKDIR /app/backend
RUN npm ci --only=production || npm install --only=production

# Copy backend source code
COPY backend /app/backend

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Expose backend port
EXPOSE 5000

# Health check probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

# Start the Express server
CMD ["node", "server.js"]
