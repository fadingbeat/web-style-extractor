import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');

  if (!url) {
    return new Response(JSON.stringify({ error: 'URL is required' }), {
      status: 400,
    });
  }

  let browser;
  try {
    let executablePath;
    // 🔥 Ensure `VERCEL` is disabled locally
    if (process.env.VERCEL === '1' && process.env.NODE_ENV !== 'production') {
      // console.log('🚨 Overriding process.env.VERCEL for local development.');
      process.env.VERCEL = undefined;
    }

    console.log('💡 process.env.VERCEL:', process.env.VERCEL);

    if (process.env.VERCEL === '1') {
      // console.log('🔴 THIS CODE SHOULD NOT RUN LOCALLY!');
      // ✅ Vercel: Use @sparticuz/chromium's bundled Chromium
      executablePath = await chromium.executablePath();
      browser = await puppeteer.launch({
        args: chromium.args,
        executablePath,
        headless: 'new',
      });
      // console.log('Using Chromium Path:', executablePath);
    } else {
      const puppeteerLocal = await import('puppeteer');
      browser = await puppeteerLocal.default.launch();
      // console.log('local browser', browser);
    }

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    const colors = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const colorSet = new Set();
      elements.forEach((el) => {
        const style = window.getComputedStyle(el);
        if (style.backgroundColor) colorSet.add(style.backgroundColor);
        if (style.color) colorSet.add(style.color);
      });
      return Array.from(colorSet);
    });

    return new Response(JSON.stringify({ colors }), { status: 200 });
  } catch (error) {
    console.error('Error extracting styles:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to extract styles.',
        details: error.message,
        stack: error.stack,
      }),
      { status: 500 }
    );
  } finally {
    if (browser) await browser.close();
  }
}
