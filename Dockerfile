FROM node:4.4.1-slim
MAINTAINER Rob Humphris

# Copy the source to the Docker's usr directory
COPY . /usr/src/app

# Set the working directory accordingly 
WORKDIR /usr/src/app

#Run npm install
RUN npm install

#Expose node port
EXPOSE 3000

#Start mongo and node
CMD node appAcra.js