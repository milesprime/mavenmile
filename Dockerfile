# Step 1: Use Node.js as the base image
FROM node:20

# Step 2: Set the working directory inside the container
WORKDIR /usr/src/app

# Step 3: Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install

# Step 5: Copy the rest of the application code
COPY . .

# Step 6: Expose the application's port (change 3000 if your app uses a different port)
EXPOSE 3000

# Step 7: Define the command to run the application
CMD ["npm", "start"]
