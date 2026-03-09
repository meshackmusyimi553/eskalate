# lightweight Node base image
FROM node:20-alpine

# create app directory
WORKDIR /app

# copy package manifests before other files for better caching
COPY package.json tsconfig.json ./

# install dependencies
RUN npm install

# copy source and tests
COPY src/ ./src/
COPY tests/ ./tests/

# the default command will run the test suite
CMD ["npm", "test"]
