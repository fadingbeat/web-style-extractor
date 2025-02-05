import puppeteer from 'puppeteer';

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
    browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      executablePath:
        process.env.PUPPETEER_EXECUTABLE_PATH || puppeteer.executablePath(),
      headless: 'new',
    });

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
