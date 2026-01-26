import asyncio
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None
    
    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()
        
        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",         # Set the browser window size
                "--disable-dev-shm-usage",        # Avoid using /dev/shm which can cause issues in containers
                "--ipc=host",                     # Use host-level IPC for better stability
                "--single-process"                # Run the browser in a single process mode
            ],
        )
        
        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        context.set_default_timeout(5000)
        
        # Open a new page in the browser context
        page = await context.new_page()
        
        # Navigate to your target URL and wait until the network request is committed
        await page.goto("http://localhost:8080", wait_until="commit", timeout=10000)
        
        # Wait for the main page to reach DOMContentLoaded state (optional for stability)
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=3000)
        except async_api.Error:
            pass
        
        # Iterate through all iframes and wait for them to load as well
        for frame in page.frames:
            try:
                await frame.wait_for_load_state("domcontentloaded", timeout=3000)
            except async_api.Error:
                pass
        
        # Interact with the page elements to simulate user flow
        # -> Input email and password, then click login button
        frame = context.pages[-1]
        # Input email
        elem = frame.locator('xpath=html/body/div/div[2]/div/div/div[2]/div/form/div/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('lgmaceddo@hotmail.com')
        

        frame = context.pages[-1]
        # Input password
        elem = frame.locator('xpath=html/body/div/div[2]/div/div/div[2]/div/form/div[2]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('Maceddo2014*')
        

        frame = context.pages[-1]
        # Click login button
        elem = frame.locator('xpath=html/body/div/div[2]/div/div/div[2]/div/form/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click on a script category with multiple scripts to open it
        frame = context.pages[-1]
        # Click on 'Scripts' category to open it
        elem = frame.locator('xpath=html/body/div/div[2]/div/aside/nav/ul/li/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Try clicking on the 'Exames' category button as an alternative to open a category with multiple scripts
        frame = context.pages[-1]
        # Click on 'Exames' category button as alternative
        elem = frame.locator('xpath=html/body/div/div[2]/div/aside/nav/ul/li[2]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Perform drag-and-drop to reorder one script category from its current position to a new position
        frame = context.pages[-1]
        # Select the 'CARDIO' category to drag
        elem = frame.locator('xpath=html/body/div/div[2]/div/main/div/div/div/div[2]/div/div/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Try clicking on a different script category button (index 29) to initiate drag-and-drop
        frame = context.pages[-1]
        # Click on 'QUESTIONÁRIOS' category button as alternative for drag-and-drop
        elem = frame.locator('xpath=html/body/div/div[2]/div/main/div/div/div/div[2]/div/div[2]/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Perform drag-and-drop to reorder scripts within the 'QUESTIONÁRIOS' category and verify immediate visual update
        frame = context.pages[-1]
        # Click and hold 'RESSONÂNCIA' script to start drag
        elem = frame.locator('xpath=html/body/div/div[2]/div/main/div/div[2]/div/div').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        # Drop 'RESSONÂNCIA' script onto 'TOMOGRAFIA' script to reorder
        elem = frame.locator('xpath=html/body/div/div[2]/div/main/div/div[2]/div/div[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Perform drag-and-drop reorder of scripts by moving the script at index 65 ('Teste de Script em Tempo Real') to the position of the script at index 69 ('CONFIRMAÇÃO DE DADOS 1')
        frame = context.pages[-1]
        # Click and hold 'Teste de Script em Tempo Real' script to start drag
        elem = frame.locator('xpath=html/body/div/div[2]/div/main/div/div[2]/div/div[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        # Drop 'Teste de Script em Tempo Real' script onto 'CONFIRMAÇÃO DE DADOS 1' script to reorder
        elem = frame.locator('xpath=html/body/div/div[2]/div/main/div/div[2]/div/div[3]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Reload the page to attempt to restore the application state or report the issue if the page remains empty
        await page.goto('http://localhost:8080/', timeout=10000)
        await asyncio.sleep(3)
        

        # --> Assertions to verify final state
        frame = context.pages[-1]
        try:
            await expect(frame.locator('text=Scripts reordered successfully').first).to_be_visible(timeout=1000)
        except AssertionError:
            raise AssertionError("Test plan failed: The scripts within the category could not be reordered or the order was not saved and restored after refresh.")
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    