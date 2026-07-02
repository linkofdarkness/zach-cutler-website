#!/usr/bin/env python3
"""Generate PNG screenshot using Selenium or Playwright if available."""

import os
import sys

output_dir = '/home/node/.openclaw/workspace/static/screenshot-reviews'
os.makedirs(output_dir, exist_ok=True)

def try_selenium():
    """Try to use Selenium with Chrome."""
    from selenium import webdriver
    from selenium.webdriver.chrome.options import Options
    
    options = Options()
    options.add_argument('--headless=new')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    
    driver = webdriver.Chrome(options=options)
    driver.get('https://zachcutler.me/blog/')
    
    output_path = os.path.join(output_dir, 'selenium-blog.png')
    driver.save_screenshot(output_path)
    
    print(f'✅ Screenshot saved to {output_path}')
    driver.quit()

def try_playwright():
    """Try to use Playwright."""
    from playwright.sync_api import sync_playwright
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=['--no-sandbox'])
        page = browser.new_page(viewport={'width': 1280, 'height': 720})
        page.goto('https://zachcutler.me/blog/')
        
        output_path = os.path.join(output_dir, 'playwright-blog.png')
        page.screenshot(path=output_path)
        
        print(f'✅ Screenshot saved to {output_path}')
        browser.close()

def try_selenium_firefox():
    """Try Selenium with Firefox."""
    from selenium import webdriver
    
    options = webdriver.FirefoxOptions()
    options.headless = True
    
    driver = webdriver.Firefox(options=options)
    driver.get('https://zachcutler.me/blog/')
    
    output_path = os.path.join(output_dir, 'selenium-firefox-blog.png')
    driver.save_screenshot(output_path)
    
    print(f'✅ Screenshot saved to {output_path}')
    driver.quit()

if __name__ == '__main__':
    try:
        from selenium import webdriver
        print('🚀 Trying Selenium...')
        try_selenium()
    except ImportError as e:
        print(f'❌ Selenium not available: {e}')
        
    try:
        from playwright.sync_api import sync_playwright
        print('🚀 Trying Playwright...')
        try_playwright()
    except ImportError as e:
        print(f'❌ Playwright not available: {e}')
        
    try:
        print('🚀 Trying Selenium Firefox...')
        try_selenium_firefox()
    except Exception as e:
        print(f'❌ Firefox attempt failed: {e}')
