import fs from "fs/promises";
import path from "path";

const LOG_DIR = path.resolve("logs");
const LOG_FILE = path.join(LOG_DIR, "tweet-log.json");

interface TweetLogEntry {
  timestamp: string;
  tweet: string;
  prompt: string;
  persona: string;
  status?: "posted" | "duplicate" | "failed";
}

async function safeJsonRead<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch (err) {
    return null; // File may not exist yet, or may be malformed
  }
}

async function safeJsonWrite<T>(filePath: string, data: T): Promise<void> {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("❌ Failed to write JSON to log:", err);
  }
}

export async function ensureLogDir(): Promise<void> {
  try {
    await fs.mkdir(LOG_DIR, { recursive: true });
  } catch (err) {
    console.error("❌ Failed to create log directory:", err);
  }
}

export async function isDuplicateTweet(tweet: string): Promise<boolean> {
  const logs = await safeJsonRead<TweetLogEntry[]>(LOG_FILE);
  return logs?.some((entry) => entry.tweet.trim() === tweet.trim()) ?? false;
}

export async function logTweet(
  tweet: string,
  prompt: string,
  persona: string
): Promise<void> {
  await appendToLog({
    tweet,
    prompt,
    persona,
    timestamp: new Date().toISOString(),
    status: "posted",
  });
  console.log("📄 Tweet logged as 'posted'");
}

export async function logAttempt(
  tweet: string,
  prompt: string,
  persona: string,
  status: "duplicate" | "failed"
): Promise<void> {
  await appendToLog({
    tweet,
    prompt,
    persona,
    timestamp: new Date().toISOString(),
    status,
  });
  console.log(`🗒️ Logged attempt as '${status}'`);
}

async function appendToLog(entry: TweetLogEntry): Promise<void> {
  const logs = (await safeJsonRead<TweetLogEntry[]>(LOG_FILE)) ?? [];
  logs.push(entry);
  await safeJsonWrite(LOG_FILE, logs);
}
