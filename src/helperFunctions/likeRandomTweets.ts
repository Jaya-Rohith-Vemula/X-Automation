import { Page } from "puppeteer";
import { humanDelay } from "..";

export async function likeRandomTweets(
  page: Page,
  minLikes: number,
  maxLikes: number
): Promise<void> {
  const likeButtons = await page.$$('[data-testid="like"]');
  const numLikes = Math.min(
    likeButtons.length,
    Math.floor(Math.random() * (maxLikes - minLikes + 1)) + minLikes
  );
  const selectedIndexes = new Set<number>();
  while (selectedIndexes.size < numLikes) {
    selectedIndexes.add(Math.floor(Math.random() * likeButtons.length));
  }
  for (const index of selectedIndexes) {
    try {
      await likeButtons[index].evaluate((el) =>
        el.scrollIntoView({ behavior: "smooth", block: "center" })
      );
      await humanDelay(1000, 2000);
      await likeButtons[index].click();
      await humanDelay(1000, 2000);
    } catch (err) {
      console.warn("⚠️ Failed to like tweet:", err);
    }
  }
  console.log(`❤️ Liked ${selectedIndexes.size} tweet(s).`);
}
