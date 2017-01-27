FROM ubuntu:16.04
RUN apt-get -y update && \
    apt-get -y install nodejs \
                       npm \
                       nginx
RUN apt-get -y install nmap \
                       curl
WORKDIR /var/www/html
COPY app app
COPY e2e e2e
COPY favicon.ico \
     index.html \
     karma.conf.js \
     karma-test-shim.js \
     package.json \
     protractor.config.js \
     styles.css \
     systemjs.config.extras.js \
     systemjs.config.js \
     tsconfig.json \
     tslint.json ./
CMD ["hostname", "whoami", "pwd"]
