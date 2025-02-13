#!/bin/sh
# Write all current environment variables to a .env file
printenv > /app/.env
# Execute the main command passed to the container
exec "$@"
