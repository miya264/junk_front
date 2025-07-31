#!/bin/bash
set -e

echo "=== Starting application ==="
echo "Current directory: $(pwd)"
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "PORT: ${PORT:-3000}"
echo "NODE_ENV: ${NODE_ENV:-development}"

# 依存関係のインストール
echo "=== Installing dependencies ==="
npm install --production=false

# アプリケーションのビルド
echo "=== Building application ==="
npm run build

# アプリケーションの起動
echo "=== Starting application ==="
echo "Command: npm start"
npm start 