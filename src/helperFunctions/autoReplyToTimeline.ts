import { Page } from "puppeteer";
import { getTweetFromGroq } from "./getTweetFromGroq";
import { logTweet } from "./tweetLogger";
import { humanDelay } from "..";

export async function autoReplyToTimeline(
  page: Page,
  maxReplies: number = 3
): Promise<void> {
  console.log("🤖 Scanning timeline for tweets to reply to...");

  humanDelay(3000, 4000);

  const tweetArticles = await page.$$('[data-testid="tweet"]');
  let repliesPosted = 0;

  for (const article of tweetArticles) {
    if (repliesPosted >= maxReplies) break;

    const textHandle = await article.$('[data-testid="tweetText"]');
    if (!textHandle) continue;

    const tweetText = await article.evaluate(
      (el) => (el as HTMLElement).innerText,
      textHandle
    );
    if (!tweetText || tweetText.length < 10) continue;

    console.log({ tweetText });

    const reply = await getTweetFromGroq(
      `Reply politely and subtly to this tweet: \"${tweetText}\"`,
      `You are a helpful, respectful, sarcastic and slightly witty Twitter user. Analyze the tone of the tweet and generate a short and friendly reply to the given tweet. If you feel it is a thread or a promotion, respond with null. Do not add any hashtags or profile name tags. Keep it human.`
    );

    if (!reply) {
      console.warn("⚠️ Failed to generate reply.");
      continue;
    }

    try {
      const replyBtn = await article.$('[data-testid="reply"]');
      if (!replyBtn) continue;

      await replyBtn.evaluate((el) =>
        el.scrollIntoView({ behavior: "smooth", block: "center" })
      );

      await humanDelay(2000, 3000);
      await replyBtn.click();
    } catch (err) {
      console.warn("⚠️ Failed to click reply button:", err);
      continue;
    }
    console.log("Clicked on reply button");

    await humanDelay(1000, 2000);

    await page.waitForSelector('div[aria-label="Post text"]', {
      timeout: 5000,
    });

    console.log("Working on texting reply!");
    await page.type('div[aria-label="Post text"]', reply, { delay: 50 });

    await humanDelay(1000, 2000);

    await page.evaluate(() => {
      const btn = document.querySelector(
        'button[data-testid="tweetButton"]:not([aria-disabled="true"])'
      ) as HTMLElement | null;
      if (btn) btn.click();
    });

    console.log("💬 Replied:", reply);
    await logTweet(reply, `Reply to: ${tweetText}`, "groq-auto-reply");

    repliesPosted++;
    await humanDelay(4000, 5000);
  }

  console.log(`✅ Replied to ${repliesPosted} tweet(s).`);
}
