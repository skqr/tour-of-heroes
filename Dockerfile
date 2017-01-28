FROM ubuntu:16.04
RUN apt-get -y update && \
    apt-get -y install curl \
                       nmap \
                       build-essential
# RUN apt-get -y update && \
#     apt-get -y install nodejs \
#                        npm \
#                        nginx
# RUN ln -s /usr/bin/nodejs /usr/bin/node
RUN apt-get -y install nginx && \
    # curl -sL https://deb.nodesource.com/setup_6.x | bash - && \
    curl -sL https://deb.nodesource.com/setup_7.x | bash - && \
    apt-get -y install nodejs
WORKDIR /var/www/html
COPY app app
COPY e2e e2e
COPY favicon.ico \
     index.html \
     karma.conf.js \
     karma-test-shim.js \
     package.json \
     protractor.config.js \
     systemjs.config.js \
     systemjs.config.extras.js \
     styles.css \
     tsconfig.json \
     tslint.json ./
RUN npm install
RUN npm install -g concurrently \
                   lite-server \
                   typescript
EXPOSE 3000 3001 80 443
CMD ["nginx", "-g", "daemon off;"]
