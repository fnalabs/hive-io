FROM fnalabs/hive-producer-js:latest
RUN npm install --production --no-optional hive-io-domain-example
