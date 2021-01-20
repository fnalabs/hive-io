FROM fnalabs/hive-stream-processor-js:latest
RUN npm install --production --no-optional hive-io-domain-example
