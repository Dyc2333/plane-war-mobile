#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Vercel 部署脚本
通过 Vercel API 直接部署静态网站
"""

import sys
import os
import subprocess
import json

# 设置输出编码
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

PROJECT_PATH = r"C:\Users\Administrator\IdeaProjects\claude-workspace\飞机大战手机端"

def install_vercel_cli():
    """安装 Vercel CLI"""
    print("📦 正在安装 Vercel CLI...")
    result = subprocess.run(['npm', 'install', '-g', 'vercel'], capture_output=True, text=True)
    if result.returncode == 0:
        print("✅ Vercel CLI 安装成功")
        return True
    else:
        print("❌ Vercel CLI 安装失败")
        print(result.stderr)
        return False

def deploy_to_vercel():
    """使用 Vercel CLI 部署"""
    print("\n🚀 正在部署到 Vercel...")
    
    # 进入项目目录
    os.chdir(PROJECT_PATH)
    
    # 运行 vercel 命令（需要登录）
    print("\n💡 提示：如果尚未登录 Vercel，请先执行 'vercel login'")
    print("然后按提示操作...\n")
    
    result = subprocess.run(['vercel', '--prod'], capture_output=True, text=True)
    
    if result.returncode == 0:
        print("✅ 部署成功！")
        print(result.stdout)
        return True
    else:
        print("❌ 部署失败")
        print(result.stderr)
        return False

def main():
    print("=" * 50)
    print("Vercel 部署工具")
    print("=" * 50)
    
    # 检查是否已安装 Vercel CLI
    result = subprocess.run(['vercel', '--version'], capture_output=True, text=True)
    
    if result.returncode != 0:
        print("\n⚠️  Vercel CLI 未安装")
        print("是否安装？(y/n): ", end='')
        choice = input()
        if choice.lower() == 'y':
            if not install_vercel_cli():
                return
        else:
            print("请手动安装：npm install -g vercel")
            return
    
    deploy_to_vercel()

if __name__ == "__main__":
    main()
