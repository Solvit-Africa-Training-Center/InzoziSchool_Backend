# Use Node.js 20 Alpine (to support modern packages)
FROM node:20-alpine

# Install tools for health checks
RUN apk add --no-cache ncurses postgresql-client

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S backend -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY .sequelizerc ./

# Install dependencies
RUN npm install

# Install sequelize-cli globally
RUN npm install -g sequelize-cli

# ✅ Copy scripts and make executable AS ROOT
# -------------------------------
COPY scripts/start.sh ./scripts/start.sh

# Make scripts executable
RUN chmod +x scripts/start.sh

# Create logs directory
RUN mkdir -p /app/logs

# Change ownership of app
RUN chown -R backend:nodejs /app

# Switch to non-root user
USER backend

# Expose port
EXPOSE 5000

# Start dev server (assumes `npm run dev` uses ts-node or ts-node-dev)
CMD ["sh", "scripts/start.sh"]