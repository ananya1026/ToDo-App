FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf
# Copy static files
COPY . /usr/share/nginx/html

EXPOSE 80