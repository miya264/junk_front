#!/bin/bash
echo "Starting application..."
echo "Current directory: $(pwd)"
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "PORT: $PORT"

# 依存関係のインストール
echo "Installing dependencies..."
npm install

# アプリケーションのビルド
echo "Building application..."
npm run build

# アプリケーションの起動
echo "Starting application..."
npm start 