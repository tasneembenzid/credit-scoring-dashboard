#!/usr/bin/env sh
# Wait for Postgres to be available, then start the Node server
set -e

host=${DB_HOST:-db}
port=${DB_PORT:-5432}
echo "Waiting for database $host:$port..."
while ! nc -z $host $port; do
  echo "Waiting for Postgres..."
  sleep 1
done

echo "Database is available, starting server"
node server.js
