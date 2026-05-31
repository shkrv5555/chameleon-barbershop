#!/usr/bin/env bash
set -e
echo "==> Installing backend dependencies..."
cd chamilion-backend && npm install && cd ..
echo "==> Installing frontend dependencies..."
cd chamilion-frontend && npm install
echo "==> Building frontend..."
npm run build
cd ..
echo "==> Build complete!"
