# Use Nginx image
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy test HTML file
COPY test.html /usr/share/nginx/html/index.html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose the port the app runs on
EXPOSE 80

# Command to run the application
CMD ["nginx", "-g", "daemon off;"]
