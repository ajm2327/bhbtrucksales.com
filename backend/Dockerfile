FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create necessary directories
RUN mkdir -p /app/data /app/uploads/trucks /app/uploads/general /app/data/backups

RUN if [ -d "uploads" ]; then cp -r uploads/* /app/uploads/ 2>/dev/null || true; fi
RUN if [ -d "data" ]; then cp -r data/* /app/data/ 2>/dev/null || true; fi



# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["npm", "start"]