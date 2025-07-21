import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import type { Browser, Page } from "puppeteer";

puppeteer.use(StealthPlugin());

export async function stealthify(page: Page): Promise<void> {
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => false });
    // @ts-ignore
    window.navigator.chrome = { runtime: {} };
    Object.defineProperty(navigator, "languages", {
      get: () => ["en-US", "en"],
    });
    Object.defineProperty(navigator, "plugins", {
      get: () => [1, 2, 3, 4, 5],
    });
  });

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
      "AppleWebKit/537.36 (KHTML, like Gecko) " +
      "Chrome/115.0.0.0 Safari/537.36"
  );
}

export async function launchBrowser(
  headless: boolean = true
): Promise<Browser> {
  return await puppeteer.launch({
    headless: headless ? true : false,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
}
