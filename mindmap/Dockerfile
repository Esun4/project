FROM node:20-alpine

WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm ci

# Copy the rest of the code
COPY . .

# Vite dev server
EXPOSE 8729

CMD ["npm", "run", "dev", "--", "--host"]
