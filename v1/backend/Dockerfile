FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3001

# Use ts-node for development/simplicity without build step
CMD ["npx", "ts-node", "src/server.ts"]
