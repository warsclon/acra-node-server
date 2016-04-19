FROM node:4.2.0-onbuild
MAINTAINER Rob Humphris

#Run npm install
RUN npm install

#Expose node port
EXPOSE 3000

#Start mongo and node
CMD node appAcra.js