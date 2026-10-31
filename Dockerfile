From nginx:1.31.3-alpine3.24-slim
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY . /usr/share/nginx/html
# The build files are copied with the site; they don't need to be served.
RUN rm -rf /usr/share/nginx/html/docker /usr/share/nginx/html/Dockerfile
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD wget --quiet --tries=1 --spider http://localhost || exit 1
CMD [ "nginx", "-g", "daemon off;" ]
