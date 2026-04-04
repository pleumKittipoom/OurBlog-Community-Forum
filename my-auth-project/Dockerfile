# 1. Base Image
FROM node:18-slim

# 2. Set working directory
WORKDIR /usr/src/app

# 3. Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# 4. Copy all app source code
COPY . .

# 5. (Optional but good) Build the app for production
# RUN npm run build

# 6. Command to run the app (in dev mode for hot-reload)
CMD ["npm", "run", "start:dev"]