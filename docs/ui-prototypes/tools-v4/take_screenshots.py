from playwright.sync_api import sync_playwright
import time
import os

def take_screenshots():
    with sync_playwright() as p:
        browser = p.chromium.launch()

        # Create screenshots directory if it doesn't exist
        screenshots_dir = "./screenshots"
        os.makedirs(screenshots_dir, exist_ok=True)

        # Take mobile-first screenshot
        page = browser.new_page(viewport={"width": 390, "height": 844})
        page.goto("http://localhost:8765")
        page.wait_for_timeout(1000)  # Wait for page to load
        page.screenshot(path="./screenshots/mobile-first-viewport-v4.png", full_page=True)

        # Take mobile with category open screenshot
        # Click on the "外贸单据" category header to expand it
        page.click('.category-section[data-category="foreign-trade"] .category-header')
        page.wait_for_timeout(500)  # Wait for animation
        page.screenshot(path="./screenshots/mobile-category-open-v4.png", full_page=True)

        # Take full page mobile screenshot
        page.screenshot(path="./screenshots/mobile-full-page-v4.png", full_page=True)

        # Take desktop screenshot
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        page.goto("http://localhost:8765")
        page.wait_for_timeout(1000)  # Wait for page to load
        page.screenshot(path="./screenshots/desktop-tools-v4.png", full_page=True)

        browser.close()

if __name__ == "__main__":
    take_screenshots()