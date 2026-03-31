#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Netlify 部署脚本
通过 Netlify API 直接部署静态网站
"""

import sys
import requests
import json
import os
import zipfile
from pathlib import Path

# 设置输出编码
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

# Netlify API 端点
NETLIFY_API_BASE = "https://api.netlify.com"

# 项目路径
PROJECT_PATH = r"C:\Users\Administrator\IdeaProjects\claude-workspace\飞机大战手机端"
ZIP_PATH = r"C:\Users\Administrator\IdeaProjects\claude-workspace\飞机大战手机端.zip"

def create_zip():
    """创建项目 ZIP 文件"""
    print("📦 正在打包项目...")
    
    # 删除已存在的 ZIP 文件
    if os.path.exists(ZIP_PATH):
        os.remove(ZIP_PATH)
    
    # 创建 ZIP 文件
    with zipfile.ZipFile(ZIP_PATH, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(PROJECT_PATH):
            for file in files:
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, os.path.dirname(PROJECT_PATH))
                zipf.write(file_path, arcname)
    
    print(f"✅ ZIP 文件已创建：{ZIP_PATH}")
    return ZIP_PATH

def deploy_to_netlify_drop():
    """
    使用 Netlify Drop API 部署
    Netlify Drop 是一个临时的部署服务，不需要认证
    """
    print("\n🚀 正在部署到 Netlify...")
    
    zip_path = create_zip()
    
    # Netlify Drop 上传端点
    url = "https://app.netlify.com/api/drop"
    
    # 读取 ZIP 文件
    with open(zip_path, 'rb') as f:
        files = {
            'file': (os.path.basename(zip_path), f, 'application/zip')
        }
        
        # 上传文件
        print("📤 正在上传文件...")
        response = requests.post(url, files=files)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ 部署成功！")
            print(f"🔗 访问地址：{result.get('url', '未知')}")
            return result
        else:
            print(f"❌ 部署失败：{response.status_code}")
            print(f"错误信息：{response.text}")
            return None

def main():
    print("=" * 50)
    print("Netlify 部署工具")
    print("=" * 50)
    
    try:
        result = deploy_to_netlify_drop()
        
        if result:
            print("\n" + "=" * 50)
            print("🎉 部署完成！")
            print("=" * 50)
        else:
            print("\n" + "=" * 50)
            print("⚠️  部署失败，请尝试其他方式")
            print("=" * 50)
            
    except Exception as e:
        print(f"\n❌ 发生错误：{str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
