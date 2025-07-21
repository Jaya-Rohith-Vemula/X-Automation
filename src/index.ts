import { getTweetFromGroq } from "./helperFunctions/getTweetFromGroq";
import { tweetModes } from "./helperFunctions/prompts";
import {
  COOKIE_PATH,
  fileExists,
  loadCookies,
  saveCookies,
} from "./helperFunctions/handleCookies";
import {
  launchBrowser,
  stealthify,
} from "./helperFunctions/puppeeteerFunctions";
import {
  isDuplicateTweet,
  logTweet,
  ensureLogDir,
  logAttempt,
} from "./helperFunctions/tweetLogger";
import { autoReplyToTimeline } from "./helperFunctions/autoReplyToTimeline";
import { likeRandomTweets } from "./helperFunctions/likeRandomTweets";

export function humanDelay(min = 500, max = 1500): Promise<void> {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateUniqueTweet(
  prompt: string,
  systemPersona: string,
  maxAttempts: number = 5
): Promise<string | null> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`🎰 Generation attempt ${attempt}...`);
    const tweet = await getTweetFromGroq(prompt, systemPersona);

    if (!tweet) {
      console.warn("⚠️ No tweet generated, skipping this attempt.");
      continue;
    }

    const isDuplicate = await isDuplicateTweet(tweet);
    if (!isDuplicate) {
      console.log("✅ Found unique tweet.");
      return tweet;
    }

    await logAttempt(tweet, prompt, systemPersona, "duplicate");
    console.warn("🔁 Duplicate tweet detected. Retrying...");
  }

  console.error("❌ Failed to generate a unique tweet after retries.");

  await logAttempt(
    "[FAILED: no unique tweet]",
    prompt,
    systemPersona,
    "failed"
  );
  return null;
}

async function run(): Promise<void> {
  const cookiesExist = await fileExists(COOKIE_PATH);

  await ensureLogDir();

  const browser = await launchBrowser(cookiesExist);
  const page = await browser.newPage();
  await stealthify(page);

  if (cookiesExist) {
    await loadCookies(page);
  }

  await page.goto("https://twitter.com/home", { waitUntil: "networkidle2" });

  if (page.url().includes("/login")) {
    console.warn("🔐 Session expired. Prompting for manual login...");
    await browser.close();

    const headfulBrowser = await launchBrowser(false);
    const headfulPage = await headfulBrowser.newPage();
    await stealthify(headfulPage);

    await headfulPage.goto("https://twitter.com/login", {
      waitUntil: "networkidle2",
    });

    console.log("Please log in manually...");
    await headfulPage.waitForNavigation({
      waitUntil: "networkidle2",
      timeout: 0,
    });

    await saveCookies(headfulPage);
    await headfulBrowser.close();

    return run();
  }

  await page.waitForSelector('div[aria-label="Jaya Rohith"]', {
    timeout: 10000,
  });
  await humanDelay();

  await autoReplyToTimeline(page, Math.floor(Math.random() * 3) + 1);

  const { prompt, systemPersona } =
    tweetModes[Math.floor(Math.random() * tweetModes.length)];

  console.log("🧠 Selected prompt:", prompt);

  const generatedText = await generateUniqueTweet(
    prompt,
    systemPersona + "Do not add any hashtags."
  );
  if (!generatedText) {
    console.log("🚫 No unique tweet could be generated. Exiting...");
    return;
  }

  if (await isDuplicateTweet(generatedText)) {
    console.warn("⚠️ Duplicate tweet detected. Skipping.");
    return;
  }

  await page.waitForSelector('div[aria-label="Post text"]');
  await page.click('div[aria-label="Post text"]');

  await page.keyboard.type(generatedText, { delay: 100 });
  await humanDelay();

  await page.waitForSelector(
    'button[data-testid="tweetButtonInline"]:not([aria-disabled="true"])',
    { timeout: 10000 }
  );
  await humanDelay(1000, 2000);

  await page.evaluate(() => {
    const btn = document.querySelector(
      'button[data-testid="tweetButtonInline"]:not([aria-disabled="true"])'
    ) as HTMLElement | null;
    if (btn) btn.click();
  });

  console.log("✅ Tweet posted:", generatedText);

  await humanDelay(10000, 15000);
  await logTweet(generatedText, prompt, systemPersona);

  await likeRandomTweets(page, 5, 10);
  await browser.close();
}

run().catch((err) => {
  console.error("❌ Bot error:", err);
  process.exit(1);
});
