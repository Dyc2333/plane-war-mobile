#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
简单部署脚本 - 使用 Vercel API
"""

import sys
import os
import requests
import json
import zipfile
import time

# 设置输出编码
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except:
        pass

PROJECT_PATH = r"C:\Users\Administrator\IdeaProjects\claude-workspace\飞机大战手机端"
ZIP_PATH = r"C:\Users\Administrator\IdeaProjects\claude-workspace\飞机大战手机端.zip"

def create_zip():
    """创建项目 ZIP 文件"""
    print("打包项目...")
    
    if os.path.exists(ZIP_PATH):
        os.remove(ZIP_PATH)
    
    import shutil
    shutil.make_archive(os.path.dirname(ZIP_PATH) + os.sep + "飞机大战手机端", 'zip', PROJECT_PATH)
    
    print(f"ZIP 文件已创建：{ZIP_PATH}")
    return ZIP_PATH

def try_netlify_api():
    """尝试 Netlify API"""
    print("\n尝试 Netlify API...")
    
    zip_path = create_zip()
    
    # 尝试不同的 Netlify 端点
    endpoints = [
        "https://api.netlify.com/api/v1/sites",
        "https://app.netlify.com/api/drop",
        "https://drop.netlify.com/api/upload",
    ]
    
    with open(zip_path, 'rb') as f:
        for endpoint in endpoints:
            print(f"尝试端点：{endpoint}")
            try:
                files = {'file': ('project.zip', f, 'application/zip')}
                response = requests.post(endpoint, files=files, timeout=30)
                print(f"状态码：{response.status_code}")
                
                if response.status_code == 200:
                    print("成功！")
                    result = response.json()
                    print(json.dumps(result, indent=2, ensure_ascii=False))
                    return result
                else:
                    print(f"失败：{response.text[:200]}")
            except Exception as e:
                print(f"错误：{e}")
            finally:
                f.seek(0)
    
    return None

def main():
    print("=" * 50)
    print("Netlify 部署工具")
    print("=" * 50)
    
    result = try_netlify_api()
    
    if result:
        print("\n部署成功！")
    else:
        print("\n所有 API 尝试失败")
        print("\n建议：")
        print("1. 手动访问 https://app.netlify.com/drop")
        print("2. 拖拽 ZIP 文件：", ZIP_PATH)
        print("3. 或者使用 Vercel CLI: npm install -g vercel")

if __name__ == "__main__":
    main()
