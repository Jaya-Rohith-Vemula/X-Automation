import { Page } from "puppeteer";
import fs from "fs/promises";
import path from "path";

export const COOKIE_PATH = path.resolve(process.cwd(), "cookies.json");

export async function fileExists(path: string): Promise<boolean> {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

export async function loadCookies(page: Page): Promise<void> {
  if (await fileExists(COOKIE_PATH)) {
    const content = await fs.readFile(COOKIE_PATH, "utf8");
    const cookies = JSON.parse(content);
    await page.setCookie(...cookies);
    console.log("✅ Loaded cookies from", COOKIE_PATH);
  }
}

export async function saveCookies(page: Page): Promise<void> {
  const cookies = await page.cookies();
  await fs.writeFile(COOKIE_PATH, JSON.stringify(cookies, null, 2));
  console.log("💾 Cookies saved to", COOKIE_PATH);
}
