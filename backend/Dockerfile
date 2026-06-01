FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --production

# Copy source
COPY . .

ENV PORT=3000
EXPOSE 3000

CMD ["node", "src/app.js"]
