# Use official Node.js 18 image as base
FROM node:18

# Set working directory inside container
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all app files
COPY . .

# Install ffmpeg for audio/video processing
RUN apt-get update && apt-get install -y ffmpeg

# Expose port your app listens on (usually 3000)
EXPOSE 3000

# Start the app
CMD ["node", "index.js"]
