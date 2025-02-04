import puppeteer from 'puppeteer';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');

  if (!url) {
    return new Response(JSON.stringify({ error: 'URL is required' }), {
      status: 400,
    });
  }

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2' });

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

  await browser.close();

  return new Response(JSON.stringify({ colors }), { status: 200 });
}
