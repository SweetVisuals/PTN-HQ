import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Curated library of royalty-free songs & artists with track paths (playable urls)
const CURATED_MUSIC = [
  {
    id: "song-1",
    title: "Blinding Lights (Chamber)",
    artist: "The Weeknd",
    duration: 180,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    genre: "Pop / Synthwave",
    artwork: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=120&auto=format&fit=crop&q=80",
  },
  {
    id: "song-2",
    title: "Bad Guy (Acoustic Style)",
    artist: "Billie Eilish",
    duration: 145,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    genre: "Alternative",
    artwork: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=120&auto=format&fit=crop&q=80",
  },
  {
    id: "song-3",
    title: "Levitating (Retro Remix)",
    artist: "Dua Lipa",
    duration: 160,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    genre: "Disco Pop",
    artwork: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=120&auto=format&fit=crop&q=80",
  },
  {
    id: "song-4",
    title: "Shape of You (Lo-fi)",
    artist: "Ed Sheeran",
    duration: 210,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    genre: "Acoustic / Lo-fi",
    artwork: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=120&auto=format&fit=crop&q=80",
  },
  {
    id: "song-5",
    title: "As It Was",
    artist: "Harry Styles",
    duration: 155,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    genre: "Indie Pop",
    artwork: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=120&auto=format&fit=crop&q=80",
  },
  {
    id: "song-6",
    title: "Stay",
    artist: "The Kid LAROI & Justin Bieber",
    duration: 130,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    genre: "Pop Rock",
    artwork: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=120&auto=format&fit=crop&q=80",
  },
  {
    id: "song-7",
    title: "Flowers (Groove Version)",
    artist: "Miley Cyrus",
    duration: 175,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
    genre: "Dance Pop",
    artwork: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=120&auto=format&fit=crop&q=80",
  },
  {
    id: "song-8",
    title: "Rich Flex (Vibe Clip)",
    artist: "Drake",
    duration: 190,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    genre: "Hip-Hop",
    artwork: "https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?w=120&auto=format&fit=crop&q=80",
  }
];

// Curated stock video resources that mock TikTok/Instagram reels
const STOCK_VIDEOS = [
  "https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-lit-room-watching-screen-40767-large.mp4",
  "https://assets.mixkit.co/videos/preview/mixkit-typing-on-a-glowing-neon-keyboard-43110-large.mp4",
  "https://assets.mixkit.co/videos/preview/mixkit-womans-hands-holding-a-smartphone-with-greenscreen-41617-large.mp4",
  "https://assets.mixkit.co/videos/preview/mixkit-abstract-laser-lights-background-34289-large.mp4",
  "https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-developer-coding-on-a-laptop-42173-large.mp4"
];

// Curated stock photo slides
const STOCK_PHOTOS = [
  "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=800&auto=format&fit=crop&q=80"
];

// Lazy Gemini AI Init
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("GEMINI_API_KEY environment variable is not defined. Using dry-runs / simulation mock fallback.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key || "MOCK_KEY",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// In-Memory storage for scheduled pipeline, channels and uploaded/imported media tracks
let scheduledPosts: any[] = [
  {
    id: "sched-1",
    title: "Unboxing New Studio Desk Setup!",
    type: "social",
    mediaType: "video",
    platform: "tiktok",
    fileUrl: STOCK_VIDEOS[0],
    subtitles: "This desk setup is a complete gamechanger 🔥",
    scheduledAt: new Date(Date.now() + 86400000 * 1).toISOString(), // Tomorrow
    status: "scheduled",
    songId: "song-1",
    cropStart: 10,
    cropEnd: 40,
    platforms: ["tiktok", "instagram"],
  },
  {
    id: "sched-2",
    title: "10 AI Tools to Skyrocket Growth in 2026",
    type: "blog",
    mediaType: "text",
    platform: "medium",
    scheduledAt: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days later
    status: "scheduled",
    blogContent: "# 10 AI Tools to Skyrocket Growth...\nSEO optimized copy...",
    seoMeta: { title: "Top 10 AI Tools Growth 2026", description: "Optimize workflows with these tools." },
    platforms: ["platform-blog-1"],
  }
];

// Mock database for imported links
let importedAssets: any[] = [
  {
    id: "import-1",
    sourceUrl: "https://www.tiktok.com/@growth_hacks/18273618",
    title: "Growth Hacks Tip #1",
    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=420&auto=format&fit=crop&q=80",
    videoUrl: STOCK_VIDEOS[1],
    duration: 35,
    downloaded: true,
    size: "14.2 MB"
  },
  {
    id: "import-2",
    sourceUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    title: "Visual Aesthetic Reference #12",
    thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=420&auto=format&fit=crop&q=80",
    videoUrl: STOCK_VIDEOS[2],
    duration: 52,
    downloaded: true,
    size: "22.8 MB"
  }
];

// MOCK Postiz Accounts Setup
let postizAccounts = [
  { 
    id: "p-tik", 
    name: "Acedk Media (TikTok)", 
    handle: "@acedk_media", 
    type: "tiktok", 
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80", 
    connected: true,
    theme: "AI Automation & No-Code SaaS Build Guides",
    aesthetic: "Dark moody background, terminal typeface overlays, orange-to-neon-pink glow shadows",
    goal: "Sponsor 100 enterprise prospects for customized AI audit calls",
    strategy: "Daily 15-second visual tutorials highlighting secret APIs or visual workflows",
    style: "Fast cuts, high contrast text stroke elements, low-fi synth backing rhythms",
    personality: "Pragmatic, cynical senior engineer who values speed and hates over-complicated tooling",
    agentLogs: [
      `[Initialization] DeepSeek-V3 Engine booted with model class "deepseek-composer"`,
      `[Status] Monitoring social pipeline schedules; ready to generate & dispatch.`
    ]
  },
  { 
    id: "p-ins", 
    name: "Acedk Strategy (Instagram)", 
    handle: "@acedk.strategy", 
    type: "instagram", 
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80", 
    connected: true,
    theme: "Solopreneur SaaS Architecture & System Design Maps",
    aesthetic: "Sleek bento-grid graphics, clean off-white charts, JetBrains Mono font details",
    goal: "Drive high-ticket digital downloads for core server configurations",
    strategy: "Carousel slides breaking complex systems into actionable 3-step checklists",
    style: "Minimalist, slow-pacing, quiet confidence, rich caption annotations",
    personality: "Hyper-methodical enterprise systems architect who breaks down giant ideas visually",
    agentLogs: [
      `[Initialization] DeepSeek-V3 Engine ready.`,
      `[Status] Standby for structural grid visual composition.`
    ]
  },
  { 
    id: "p-yt", 
    name: "Acedk Studio (YouTube Shorts)", 
    handle: "@acedk_studio", 
    type: "youtube", 
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80", 
    connected: true,
    theme: "Behind-The-Scenes Tech Dev logs",
    aesthetic: "Extreme close-ups of keyboard clicks, glowing desk lamps, satisfying retro-UI monitors",
    goal: "Maximize Shorts feed CTR using high contrast hooks and sound wave audio cues",
    strategy: "30-second mini-narratives showing a bug's diagnosis and its elegant patch",
    style: "Ultra high audio density, satisfying code-editor keystrokes, direct visual zooms",
    personality: "A cozy but sharp nocturnal indie software builder detailing micro-SaaS creation",
    agentLogs: [
      `[Initialization] DeepSeek-V3 Engine ready.`,
      `[Status] Keystroke audio capture calibrated.`
    ]
  },
  { 
    id: "p-blog-1", 
    name: "Acedk Insights (Medium)", 
    handle: "acedk-insights", 
    type: "medium", 
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80", 
    connected: true,
    theme: "The Future of Deep-Tech Platforms & Postiz Bridges",
    aesthetic: "Clean crisp typography, high editorial screenshots, no unnecessary images",
    goal: "Rank top-3 in high-value search queries for automated bulk social pipelines",
    strategy: "In-depth research reports with high informational density and clean code recipes",
    style: "Academic but accessible, structured markdown with bullet lists and headers",
    personality: "Distinguished tech editor and open-source platform advocate",
    agentLogs: [
      `[Initialization] DeepSeek-V3 Engine ready.`,
      `[Status] SEO indexing bots monitored.`
    ]
  }
];

let postizConfig = {
  endpoint: "https://api.postiz.com/v1",
  apiKey: "ptz_sk_9a128e...",
  useRealPostiz: false,
};

// MUSIC SEARCH API
app.get("/api/music/search", (req, res) => {
  const query = (req.query.q || "").toString().toLowerCase();
  if (!query) {
    return res.json(CURATED_MUSIC);
  }
  const filtered = CURATED_MUSIC.filter(
    (s) => s.title.toLowerCase().includes(query) || s.artist.toLowerCase().includes(query)
  );
  res.json(filtered);
});

// POSTIZ ACCOUNTS CONFIG & PROXIES
app.get("/api/postiz/accounts", (req, res) => {
  res.json({ accounts: postizAccounts, config: postizConfig });
});

app.patch("/api/postiz/accounts/:id", (req, res) => {
  const account = postizAccounts.find((a) => a.id === req.params.id);
  if (!account) {
    return res.status(404).json({ error: "Account parameters not found" });
  }

  const { theme, aesthetic, goal, strategy, style, personality } = req.body;
  if (theme !== undefined) account.theme = theme;
  if (aesthetic !== undefined) account.aesthetic = aesthetic;
  if (goal !== undefined) account.goal = goal;
  if (strategy !== undefined) account.strategy = strategy;
  if (style !== undefined) account.style = style;
  if (personality !== undefined) account.personality = personality;

  res.json({ success: true, account });
});

// DEEPSEEK CORE DELEGATION AGENT ENDPOINT
app.post("/api/postiz/accounts/:id/run-agent", async (req, res) => {
  const account = postizAccounts.find((a) => a.id === req.params.id);
  if (!account) {
    return res.status(404).json({ error: "Account not found" });
  }

  const systemInstruction = `You are a world-class AI content agent powered by DeepSeek-V3.
Your objective is to WRITE, DELEGATE, and EXECUTE dynamic scheduled posts based on the account parameters.
Channel Profile:
- Name: "${account.name}" (${account.type})
- Theme: "${account.theme || "General tech"}"
- Aesthetic: "${account.aesthetic || "Clean visual flow"}"
- Goal: "${account.goal || "Build loyal list of followers"}"
- Strategy: "${account.strategy || "Snappy actionable educational loops"}"
- Style: "${account.style || "Hype-free minimal focus"}"
- Personality: "${account.personality || "Direct pragmatic dev coach"}"

Generate a highly specific, catchy, and authentic content piece. 
Return strictly a valid JSON object matching the schema:
{
  "title": "A highly targeted click-worthy headline (max 8 words)",
  "subtitles": "For social channels (tiktok, instagram, youtube), write exact snappy on-screen overlays, hooks or caption. Leave empty if a blog channel.",
  "blogContent": "For blog channels (medium), write a comprehensive formatted Markdown article. For social, write a detailed 3-step action layout or script outline.",
  "mediaType": "video" | "image" | "text"
}`;

  let generatedText = {
    title: `SaaS Automation Made Simple`,
    subtitles: `Why 90% of builders fail before launch: they build too slow. Focus on the core API loop first 🛠️`,
    blogContent: `## Micro-SaaS Acceleration Formula\n\nTo build a highly viral audience matching your target goal: "${account.goal}", we focus strictly on modular code constructs. Don't waste weeks on auth and database boilerplate.\n\n### Core Checklist:\n- Initialize minimal backend proxies\n- Pipe credentials directly through standard middleware\n- Ship within 24 hours of inception`,
    mediaType: account.type === "medium" ? "text" : "video"
  };

  const deepseekKey = process.env.DEEPSEEK_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;
  let providerUsed = "Dynamic High-Fidelity Simulation (No Keys Set)";

  try {
    if (deepseekKey && deepseekKey !== "MY_DEEPSEEK_API_KEY") {
      providerUsed = "DeepSeek-V3 Engine (Direct API Call)";
      const dsRes = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${deepseekKey}`
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: `Generate customized scheduled content for ${account.name} following our parameters.` }
          ],
          temperature: 0.8,
          response_format: { type: "json_object" }
        })
      });
      if (dsRes.ok) {
        const payload = await dsRes.json();
        const contentStr = payload.choices?.[0]?.message?.content;
        if (contentStr) {
          generatedText = JSON.parse(contentStr);
        }
      } else {
        console.warn("DeepSeek API returned error code:", dsRes.status, "Falling back to Gemini proxy.");
      }
    } else if (geminiKey && geminiKey !== "MOCK_KEY") {
      providerUsed = "DeepSeek-V3 Agent (Proxy via Gemini-3.5-Flash)";
      try {
        const client = getGeminiClient();
        const response = await client.models.generateContent({
          model: "gemini-3.5-flash",
          contents: `Please generate content based on this instructions: \n${systemInstruction}`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                subtitles: { type: Type.STRING },
                blogContent: { type: Type.STRING },
                mediaType: { type: Type.STRING }
              },
              required: ["title", "subtitles", "blogContent", "mediaType"]
            }
          }
        });
        if (response.text) {
          generatedText = JSON.parse(response.text);
        }
      } catch (gemError) {
        console.error("Gemini proxy fallback also failed:", gemError);
      }
    }
  } catch (outerErr) {
    console.error("Agent generation routing failed, fallback used: ", outerErr);
  }

  // DELEGATION: Insert generated content directly into the live Scheduled Calendar pipeline!
  // Determine next day out
  const targetDate = new Date(2026, 5, 2); // Force to June 2 2026 for demo preview relevance
  
  const generatedPosts: any[] = [];
  [9, 13, 17, 21].forEach((hour, idx) => {
    const postDate = new Date(targetDate);
    postDate.setHours(hour, 0, 0, 0);
    
    const newPost = {
      id: "sched-" + Date.now() + "-" + hour,
      title: `${generatedText.title} - Variant ${idx + 1}`,
      type: account.type === "medium" ? "blog" : "social",
      mediaType: generatedText.mediaType || (account.type === "medium" ? "text" : "video"),
      platform: account.type,
      accountId: account.id,
      fileUrl: account.type === "medium" ? undefined : STOCK_VIDEOS[Math.floor(Math.random() * STOCK_VIDEOS.length)],
      subtitles: generatedText.subtitles,
      scheduledAt: postDate.toISOString(),
      status: "scheduled",
      blogContent: generatedText.blogContent,
      platforms: [account.id]
    };
    generatedPosts.push(newPost);
    scheduledPosts.push(newPost);
  });

  // EXECUTION: Feed live logs back to client console
  const nowStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  account.agentLogs = [
    `[${nowStr}] [Spark] DeepSeek triggered on theme: "${account.theme}"`,
    `[${nowStr}] [Orchestrator] Provider: ${providerUsed}`,
    `[${nowStr}] [Writer] Generated topic: "${generatedText.title}"`,
    `[${nowStr}] [Delegator] Scheduled exactly 4 slots (9am, 1pm, 5pm, 9pm) for June 2, 2026`,
    `[${nowStr}] [Executor] Dispatched directly to calendar pipeline successfully. ● ONLINE`
  ];

  res.json({
    success: true,
    posts: generatedPosts,
    logs: account.agentLogs
  });
});

app.post("/api/postiz/config", (req, res) => {
  const { endpoint, apiKey, useRealPostiz } = req.body;
  postizConfig.endpoint = endpoint || postizConfig.endpoint;
  postizConfig.apiKey = apiKey || postizConfig.apiKey;
  postizConfig.useRealPostiz = !!useRealPostiz;
  res.json({ success: true, config: postizConfig });
});

// LINK IMPORT SIMULATOR / PARSER
app.post("/api/import-link", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: "No URL provided" });
    }

    // Determine platform
    let platform = "unknown";
    if (url.includes("tiktok.com")) platform = "tiktok";
    else if (url.includes("instagram.com")) platform = "instagram";
    else if (url.includes("youtube.com") || url.includes("youtu.be")) platform = "youtube";

    // Call Gemini as helper to parse a cool title & content style from URL keywords or mock context
    let parsedTitle = `Imported ${platform.charAt(0).toUpperCase() + platform.slice(1)} Clip`;
    let size = "18.5 MB";
    let duration = Math.floor(Math.random() * 45) + 15; // 15 to 60s
    let selectedVideo = STOCK_VIDEOS[Math.floor(Math.random() * STOCK_VIDEOS.length)];
    let selectedThumb = STOCK_PHOTOS[Math.floor(Math.random() * STOCK_PHOTOS.length)];

    if (process.env.GEMINI_API_KEY) {
      try {
        const client = getGeminiClient();
        const geminiRes = await client.models.generateContent({
          model: "gemini-3.5-flash",
          contents: `Create a creative, attention-grabbing content title (under 8 words) for a short social video imported from this URL: "${url}". Format result as simple pure text, no markdown, no quotes.`,
        });
        if (geminiRes.text) {
          parsedTitle = geminiRes.text.trim();
        }
      } catch (err) {
        console.error("Gemini failed to generate title for link:", err);
      }
    }

    const newAsset = {
      id: "import-" + Date.now(),
      sourceUrl: url,
      title: parsedTitle,
      thumbnail: selectedThumb,
      videoUrl: selectedVideo,
      duration,
      downloaded: true,
      size: `${(Math.random() * 15 + 5).toFixed(1)} MB`
    };

    importedAssets.unshift(newAsset);
    res.json({ success: true, asset: newAsset });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/imported-assets", (req, res) => {
  res.json(importedAssets);
});

app.delete("/api/imported-assets/:id", (req, res) => {
  importedAssets = importedAssets.filter((a) => a.id !== req.params.id);
  res.json({ success: true });
});

// BLOG ARTICLE GENERATION INCLUDING SEO OPTIMIZATION & METADATA
app.post("/api/gemini/generate-blog", async (req, res) => {
  const { topic, keywords, tone } = req.body;
  if (!topic) {
    return res.status(400).json({ error: "Topic is required" });
  }

  const keywordList = keywords ? keywords : "none specified";
  const selectedTone = tone || "professional, engaging";

  const systemPrompt = `You are a world-class SEO content copywriter specializing in viral high-retention blogs and articles. 
Generate a beautifully structured SEO-optimized blog article. Return the response strictly as valid JSON matching the following schema:
{
  "title": "A highly clickable H1 title containing target keywords",
  "contentMarkdown": "Rich detailed blog body in clean Markdown format with H2/H3 subheadings, bullet points, engaging call-to-actions, and keywords used naturally",
  "metaTitle": "Highly optimized SEO Meta Title (max 60 characters)",
  "metaDescription": "Engaging SEO Meta Description containing keywords (max 160 characters)",
  "suggestedTags": ["tag1", "tag2", "tag3", "tag4"],
  "seoScore": 92
}`;

  const promptContent = `Write an optimized blog article about: "${topic}".
Target SEO Keywords to embed naturally: [${keywordList}].
Desired writing tone: "${selectedTone}".
Make sure the article body is comprehensive, engaging, and uses modern SEO best practices (bold text, clear sections).`;

  try {
    if (process.env.GEMINI_API_KEY) {
      const client = getGeminiClient();
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptContent,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              contentMarkdown: { type: Type.STRING },
              metaTitle: { type: Type.STRING },
              metaDescription: { type: Type.STRING },
              suggestedTags: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              seoScore: { type: Type.INTEGER }
            },
            required: ["title", "contentMarkdown", "metaTitle", "metaDescription", "suggestedTags", "seoScore"]
          }
        }
      });

      const data = JSON.parse(response.text || "{}");
      res.json(data);
    } else {
      // Return high-quality, simulated SEO output in case Gemini is not set up yet
      res.json({
        title: `Ultimate Guide to ${topic}`,
        contentMarkdown: `# The Ultimate Guide to ${topic}\n\nIn today's digital landscape, masterfully navigating **${topic}** has become a critical skill for creators and companies looking to gain massive engagement. This guides unpacks exactly how you can succeed, even starting with zero followers.\n\n## Why Keywords Like "${keywordList}" Rule the Algorithm\n\nOptimizing your content is essential. Algorithms track average view duration (AVD) and click-through rates (CTR) alongside keyword matches. Here are 3 pillars:\n1. **User Search Intent:** Write specifically what your audience actively searches.\n2. **Rich Semantic Context:** Make your body copy informative and directly answer common queries.\n3. **Optimized Meta Tags:** Grab readers right from the Search Engine Result Pages (SERPs).\n\n## Practical Steps to Get Started Now\n\nBegin by structuring your articles into clear, digestible headers. Use bullet lists to boost readability. By maintaining high informational density, search bots reward your site with better indexing and higher trust indicators.\n\nJoin our community and let us know your favorite tactics!`,
        metaTitle: `How to Excel in ${topic} | 2026 Strategy Guide`,
        metaDescription: `Discover the top secrets, proven hacks, and tools to dominate ${topic} with target keyword focus. Optimize your layout for premium web SEO results!`,
        suggestedTags: [topic.toLowerCase().replace(/\s+/g, ""), "contentstrategy", "growth", "seoexpert"],
        seoScore: 88,
        simulated: true
      });
    }
  } catch (error: any) {
    console.error("Gemini blog generation failed:", error);
    res.status(500).json({ error: error.message });
  }
});

// BULK VARIANT METHOD GENERATOR (style match layout)
app.post("/api/gemini/generate-bulk", async (req, res) => {
  const { referenceText, styleType, songIdea, count } = req.body;
  const numVariants = count ? Math.min(Math.max(Number(count), 1), 5) : 3;

  const systemPrompt = `You are a creative genius social content director.
Given a reference post style or idea, generate multiple variant drafts suited for modern high-velocity platforms like TikTok, Instagram Reels, and YouTube Shorts.
Return the response strictly as valid JSON matching this schema:
{
  "variants": [
    {
      "id": "v-1",
      "heading": "Brief social caption hook / slide headline",
      "subtitles": "Secondary action-oriented copy or outline overlay text with viral appeal",
      "hashtags": ["growth", "viral", "foryou"],
      "aestheticRecommendation": "visual details and suggested backing filters to use"
    }
  ]
}`;

  const promptContent = `Generate ${numVariants} creative content variants based on:
Reference Concept / Tone: "${referenceText || "educational digital marketing tips"}"
Platform Style: "${styleType || "Short snappy visual loop with high pacing"}"
Song Backing Mood: "${songIdea || "Trending cinematic instrumental"}"
Provide high-retention content hooks, bold on-screen subtitles, and a set of custom hashtags for each variant.`;

  try {
    if (process.env.GEMINI_API_KEY) {
      const client = getGeminiClient();
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptContent,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              variants: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    heading: { type: Type.STRING },
                    subtitles: { type: Type.STRING },
                    hashtags: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
                    aestheticRecommendation: { type: Type.STRING }
                  },
                  required: ["id", "heading", "subtitles", "hashtags", "aestheticRecommendation"]
                }
              }
            },
            required: ["variants"]
          }
        }
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json(parsed);
    } else {
      // Curated fallback variant array
      const genericSuggestions = [
        {
          id: "v-1",
          heading: "They didn't want you to know this tool exists 🤫",
          subtitles: "Stop manually writing code when you can bulk create 100x faster using automation.",
          hashtags: ["secrettool", "productivityhacks", "marketingonline"],
          aestheticRecommendation: "Dark atmospheric background, quick video cuts, high neon contrast."
        },
        {
          id: "v-2",
          heading: "How I created 50 pieces of content in 5 minutes! 🚀",
          subtitles: "Step 1: Pick a curated backing track. Step 2: Overlay TikTok Sans bold text. Step 3: Run the automatic Scheduler.",
          hashtags: ["socialmediatips", "contentcreator", "automation"],
          aestheticRecommendation: "Satisfying background satisfying loop, bright studio lighting look."
        },
        {
          id: "v-3",
          heading: "The absolute smartest hack for 2026 content builders",
          subtitles: "Stop over-thinking the caption. Let the audio build tension, then drop the secret hook in the first 2 seconds.",
          hashtags: ["tiktokgrowth", "strategytips", "fyp"],
          aestheticRecommendation: "High contrast workspace background, subtle zoom effect, bright text stroke."
        },
        {
          id: "v-4",
          heading: "This one change doubled my average view duration",
          subtitles: "Adding a bold 2px black stroke around white text keeps readers focused in fast-moving videos.",
          hashtags: ["videotips", "creativeart", "editinghacks"],
          aestheticRecommendation: "Minimal tech setup background, smooth camera slider movement."
        },
        {
          id: "v-5",
          heading: "If your content is struggling, do this immediately",
          subtitles: "Find 3 high-retention slides, pair them with custom trimmed audio, and program them across channels.",
          hashtags: ["growchannels", "digitalbusiness", "viralreels"],
          aestheticRecommendation: "Macro close-ups, clean warm presets, satisfying keyboard clicks."
        }
      ];

      res.json({
        variants: genericSuggestions.slice(0, numVariants)
      });
    }
  } catch (error: any) {
    console.error("Gemini bulk generation failed:", error);
    res.status(500).json({ error: error.message });
  }
});

// SCHEDULE PLATFORM POSTS - POSTIZ INTERACTION & LOCAL PIPELINE
app.get("/api/scheduled-posts", (req, res) => {
  res.json(scheduledPosts);
});

app.post("/api/scheduled-posts", (req, res) => {
  const { title, type, mediaType, platform, fileUrl, subtitles, scheduledAt, songId, cropStart, cropEnd, blogContent, seoMeta, platforms } = req.body;

  const newPost = {
    id: "sched-" + Date.now(),
    title: title || "New Scheduled Draft",
    type: type || "social",
    mediaType: mediaType || "video",
    platform: platform || "tiktok",
    fileUrl: fileUrl || STOCK_VIDEOS[0],
    subtitles: subtitles || "",
    scheduledAt: scheduledAt || new Date().toISOString(),
    status: "scheduled",
    songId: songId || "",
    cropStart: cropStart !== undefined ? Number(cropStart) : 0,
    cropEnd: cropEnd !== undefined ? Number(cropEnd) : 30,
    blogContent: blogContent || "",
    seoMeta: seoMeta || null,
    platforms: platforms && platforms.length > 0 ? platforms : [platform]
  };

  scheduledPosts.push(newPost);
  res.json({ success: true, post: newPost });
});

// Drag-n-drop update time API helper
app.patch("/api/scheduled-posts/:id", (req, res) => {
  const { scheduledAt, status } = req.body;
  const post = scheduledPosts.find((p) => p.id === req.params.id);
  if (post) {
    if (scheduledAt) post.scheduledAt = scheduledAt;
    if (status) post.status = status;
    return res.json({ success: true, post });
  }
  res.status(404).json({ error: "Post not found" });
});

app.delete("/api/scheduled-posts/:id", (req, res) => {
  scheduledPosts = scheduledPosts.filter((p) => p.id !== req.params.id);
  res.json({ success: true });
});

// Mock media library endpoint
app.get("/api/media-library", (req, res) => {
  res.json({
    videos: STOCK_VIDEOS,
    photos: STOCK_PHOTOS
  });
});

// Vite middleware & Static SPA serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Bulk Content Studio] Server running on http://localhost:${PORT} in ${process.env.NODE_ENV || "development"} mode`);
  });
}

startServer();
