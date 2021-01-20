FROM haproxy:2.3.4-alpine

RUN apk --no-cache add \
    ca-certificates

EXPOSE 443
