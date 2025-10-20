#!/bin/bash

# DAW AI 一键部署脚本
# 用途: 打包前端项目并部署到服务器

set -e

echo "🚀 开始部署 DAW AI..."

# 1. 构建项目
echo "📦 正在构建项目..."
npm run build

# 2. 检查构建结果
if [ ! -d "manage" ]; then
  echo "❌ 构建失败: manage 目录不存在"
  exit 1
fi

echo "✅ 构建完成"

# 3. 部署到服务器
echo "📤 正在部署到服务器..."
scp -r ./manage root@156.238.254.249:/usr/share/nginx/html/pages/

echo "✅ 部署完成!"
echo "🎉 访问地址: http://156.238.254.249/pages/manage/"
