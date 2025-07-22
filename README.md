# 🧠 X-Automation: Groq-Powered Twitter Engagement

An intelligent Puppeteer + TypeScript Automation that:

- ✅ Tweets AI-generated thoughts from Groq
- 💬 Auto-replies to tweets in your timeline
- ❤️ Randomly likes tweets for engagement
- 🧠 Logs every post and interaction (with deduplication)
- ⚡ Uses stealth techniques to avoid detection

---

## 📦 Features

- Tweets subtle, witty content from [Groq's LLM API](https://console.groq.com)
- Avoids posting duplicate content by checking `tweet-log.json`
- Auto-replies to timeline tweets with Groq-generated comments
- Likes a random number of tweets (between 5–10) per run
- Modular structure using TypeScript
- Fully headful or headless Puppeteer sessions
- Cookie-based login persistence

---

## 🚀 Getting Started

### 1. Clone and install

```bash
git clone https://github.com/Jaya-Rohith-Vemula/X-Automation.git
cd X-Automation
npm install
```

### 2. Set up your `.env`

Create a `.env` file in the root:

```env
GROQ_API_KEY=your_groq_api_key_here
```

### 3. First time login

```bash
npm run start
```

- The automation will launch Twitter in a visible browser
- Manually log in
- Cookies are saved locally for future headless runs

---

## 🔧 Project Structure

```
├── logs/                      # Log files for automation activity and errors
├── src/                       # Source code folder
│   ├── helperFunctions/       # Reusable helper functions
│   │   ├── autoReplyToTimeline.ts     # Automatically replies to tweets in timeline
│   │   ├── getTweetFromGroq.ts        # Fetches tweet content using Groq API
│   │   ├── handleCookies.ts           # Handles session cookie storage/load
│   │   ├── likeRandomTweets.ts        # Likes random tweets from timeline
│   │   ├── prompts.ts                 # Predefined prompts or persona messages
│   │   ├── puppeteerFunctions.ts      # Puppeteer utility functions (e.g. browser handling)
│   │   └── tweetLogger.ts             # Handles logging of tweets and deduplication
│   └── index.ts                # Entry point for the automation script
├── .env                        # Environment variables (e.g. API keys)
├── cookies.json                # Stores authenticated session cookies
└── package.json                # Project metadata and scripts

```

---

## 🧠 What It Does on Each Run

1. Logs into Twitter (using cookies)
2. Posts a unique AI-generated tweet
3. Replies to \~3 tweets on timeline with Groq-generated responses
4. Likes 5–10 random tweets
5. Logs all actions to `logs/tweet-log.json`

---

## 🧪 Development

### Compile:

```bash
npm run build
```

### Start automation:

```bash
npm start
```

---

## 📁 Logs

All tweets (posted + replies + duplicates) are logged in:

```
logs/tweet-log.json
```

Sample entry:

```json
{
  "tweet": "Bold opinions make startups. Not consensus.",
  "prompt": "Share a spicy opinion about startups.",
  "persona": "You are a bold founder...",
  "timestamp": "2025-07-20T15:42:12Z",
  "status": "posted"
}
```

---

## ✅ Tech Stack

- [Puppeteer](https://github.com/puppeteer/puppeteer)
- [Groq API](https://console.groq.com/)
- TypeScript
- node-fetch
- dotenv + cookie-based session handling

---

## ⚠️ Disclaimer

This system mimics human interaction, but Twitter's policies are strict on automation. Use this for educational or sandbox accounts. You are responsible for any account risks.
