#!/bin/sh
set -e

# Move Angular files from browser directory to root
if [ -d "/usr/share/nginx/html/browser" ]; then
  echo "Moving Angular files from browser directory to root..."
  cp -r /usr/share/nginx/html/browser/* /usr/share/nginx/html/
  rm -rf /usr/share/nginx/html/browser
  echo "Files moved successfully."
fi

# Display the content of the html directory
echo "Content of /usr/share/nginx/html:"
ls -la /usr/share/nginx/html

# Execute the original Nginx entrypoint with the provided arguments
exec nginx -g "daemon off;"
