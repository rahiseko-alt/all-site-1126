import { chromium } from 'playwright';

(async () => {
  // Specify browser executable path if needed, or launch directly
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', msg => {
    console.log(`[BROWSER CONSOLE] ${msg.type()}: ${msg.text()}`);
  });

  page.on('pageerror', err => {
    console.log(`[BROWSER ERROR] ${err.message}\nStack:\n${err.stack}`);
  });

  console.log('Navigating to http://localhost:5180/...');
  try {
    const response = await page.goto('http://localhost:5180/', { timeout: 10000 });
    console.log('Response Status:', response.status());
    await page.waitForTimeout(3000);

    const bodyText = await page.evaluate(() => document.body.innerHTML);
    console.log('Page body length:', bodyText.length);
    console.log('Page Title:', await page.title());

    // Check if webgl canvas is rendering or errors exist
    const canvasExists = await page.evaluate(() => !!document.querySelector('canvas.webgl'));
    console.log('WebGL Canvas exists:', canvasExists);

    // Simulate scroll to trigger GSAP / Lenis
    console.log('Simulating scroll...');
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(1000);
    
    // Check if camera position or any animation triggered changes (we can check active UI opacity)
    const activeSection = await page.evaluate(() => {
      const active = document.querySelector('.scene-ui.active');
      return active ? active.id : 'none';
    });
    console.log('Active section at scroll 500:', activeSection);

  } catch (e) {
    console.error('Error during browser execution:', e);
  } finally {
    await browser.close();
  }
})();
