from playwright.sync_api import sync_playwright
import time

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()
    page.goto("http://localhost:8080/#/2024/list")

    # Wait for the button to be visible
    page.wait_for_selector(".tags-toggle-button")
    time.sleep(1) # Add a small delay

    # Click the "Show tags" button
    page.click(".tags-toggle-button")

    page.screenshot(path="jules-scratch/verification/verification.png")
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
