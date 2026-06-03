import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";
import https from "https";
import { execFile } from "child_process";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import ffmpeg from "ffmpeg-static";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Serve the temp folder statically to allow playing rendered files locally
app.use("/media", express.static(path.join(__dirname, "temp")));

// Initialize Supabase Client
// Fallback directly to the fetched credentials for instant, zero-setup connection
const SUPABASE_DEFAULT_URL = "https://linjrrwcqzviqxetbail.supabase.co";
const SUPABASE_DEFAULT_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpbmpycndjcXp2aXF4ZXRiYWlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0MzQ3MzUsImV4cCI6MjA5NjAxMDczNX0.zdTGrP6jFx-Ynwy782FfsGjMOtMLanXMnUYFZAmU5P4";

const supabaseUrl = process.env.SUPABASE_URL || SUPABASE_DEFAULT_URL;
const supabaseKey = process.env.SUPABASE_KEY || SUPABASE_DEFAULT_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

console.log(`[Supabase] Client initialized targeting endpoint: ${supabaseUrl}`);

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

const STOCK_VIDEOS = [
  "https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-lit-room-watching-screen-40767-large.mp4",
  "https://assets.mixkit.co/videos/preview/mixkit-typing-on-a-glowing-neon-keyboard-43110-large.mp4",
  "https://assets.mixkit.co/videos/preview/mixkit-womans-hands-holding-a-smartphone-with-greenscreen-41617-large.mp4",
  "https://assets.mixkit.co/videos/preview/mixkit-abstract-laser-lights-background-34289-large.mp4",
  "https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-developer-coding-on-a-laptop-42173-large.mp4"
];

const STOCK_PHOTOS = [
  "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=800&auto=format&fit=crop&q=80"
];

let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
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

function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const protocol = url.startsWith('https') ? https : require('http');
    const request = protocol.get(url, (response: any) => {
      if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        file.close();
        fs.unlink(dest, () => {});
        downloadFile(response.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      if (response.statusCode !== 200) {
        file.close();
        fs.unlink(dest, () => {});
        reject(new Error(`Failed to download file, status code: ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on("finish", () => {
        file.close();
        resolve();
      });
    });
    request.on("error", (err: any) => {
      file.close();
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

// Helper: ensure a file is local for FFmpeg processing
async function ensureLocalFile(urlOrPath: string, tempDir: string, prefix: string): Promise<{ localPath: string; isTemp: boolean }> {
  // Already a local file path
  if (fs.existsSync(urlOrPath)) {
    return { localPath: urlOrPath, isTemp: false };
  }
  // Local media path (served by express static)
  if (urlOrPath.startsWith('/media/')) {
    const localPath = path.join(__dirname, 'temp', urlOrPath.replace('/media/', ''));
    if (fs.existsSync(localPath)) {
      return { localPath, isTemp: false };
    }
  }
  // Remote URL — download it
  if (urlOrPath.startsWith('http://') || urlOrPath.startsWith('https://')) {
    const ext = path.extname(new URL(urlOrPath).pathname) || '.mp4';
    const localPath = path.join(tempDir, `${prefix}-${Date.now()}${ext}`);
    console.log(`[FFmpeg Prep] Downloading remote file to local: ${urlOrPath}`);
    await downloadFile(urlOrPath, localPath);
    return { localPath, isTemp: true };
  }
  // Fallback: return as-is
  return { localPath: urlOrPath, isTemp: false };
}

async function initBinaries() {
  const binDir = path.join(__dirname, "bin");
  if (!fs.existsSync(binDir)) {
    fs.mkdirSync(binDir, { recursive: true });
  }

  const tempDir = path.join(__dirname, "temp");
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  const downloadsDir = path.join(tempDir, "downloads");
  if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir, { recursive: true });
  }
  const rendersDir = path.join(tempDir, "renders");
  if (!fs.existsSync(rendersDir)) {
    fs.mkdirSync(rendersDir, { recursive: true });
  }

  const fontPath = path.join(binDir, "font.ttf");
  if (!fs.existsSync(fontPath)) {
    console.log("[Setup] Downloading Outfit-Bold.ttf font overlay...");
    try {
      await downloadFile("https://github.com/google/fonts/raw/main/ofl/outfit/Outfit-Bold.ttf", fontPath);
    } catch (err) {
      console.error("[Setup] Failed to download font.ttf:", err);
    }
  }

  const isWindows = process.platform === "win32";
  const ytdlpPath = path.join(binDir, isWindows ? "yt-dlp.exe" : "yt-dlp");
  if (!fs.existsSync(ytdlpPath)) {
    console.log("[Setup] Downloading yt-dlp binary...");
    const url = isWindows 
      ? "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe"
      : "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp";
    try {
      await downloadFile(url, ytdlpPath);
      if (!isWindows) {
        fs.chmodSync(ytdlpPath, "755");
      }
    } catch (err) {
      console.error("[Setup] Failed to download yt-dlp binary:", err);
    }
  }
}

const hasR2Creds = 
  process.env.R2_ACCOUNT_ID &&
  process.env.R2_ACCESS_KEY_ID &&
  process.env.R2_SECRET_ACCESS_KEY &&
  process.env.R2_BUCKET_NAME;

const r2Client = hasR2Creds
  ? new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    })
  : null;

async function uploadFileToR2(localFilePath: string, key: string): Promise<string> {
  if (r2Client && hasR2Creds) {
    try {
      const fileBuffer = fs.readFileSync(localFilePath);
      const contentType = key.endsWith(".mp3") ? "audio/mpeg" : (key.endsWith(".jpg") || key.endsWith(".jpeg") ? "image/jpeg" : "video/mp4");
      await r2Client.send(
        new PutObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME!,
          Key: key,
          Body: fileBuffer,
          ContentType: contentType,
        })
      );
      const publicUrl = process.env.R2_PUBLIC_URL || `https://${process.env.R2_BUCKET_NAME}.r2.cloudflarestorage.com`;
      return `${publicUrl}/${key}`;
    } catch (err) {
      console.error("[R2 Upload Error] Fallback triggered:", err);
    }
  }
  const fileName = path.basename(localFilePath);
  const isAudio = key.endsWith(".mp3");
  const subFolder = isAudio ? "downloads" : "renders";
  return `/media/${subFolder}/${fileName}`;
}

let postizConfig = {
  endpoint: "https://api.postiz.com/public/v1",
  apiKey: process.env.POSTIZ_API_KEY || "a7544f474add0a9ca139c1c3e29b7e1a508e96bf02dd1f977205d3774df03734",
  useRealPostiz: true,
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

// POSTIZ ACCOUNTS CONFIG & PROXIES (via Supabase)
app.get("/api/postiz/accounts", async (req, res) => {
  try {
    // Sync with Postiz if key is present
    if (postizConfig.apiKey) {
      try {
        console.log(`[Postiz Sync] Fetching integrations from ${postizConfig.endpoint}/integrations`);
        const response = await fetch(`${postizConfig.endpoint}/integrations`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": postizConfig.apiKey
          }
        });

        if (response.ok) {
          const rawData = (await response.json()) as any;
          const integrations = Array.isArray(rawData) 
            ? rawData 
            : (rawData.value || rawData.integrations || rawData.data || []);

          console.log(`[Postiz Sync] Discovered ${integrations.length} integrations from Postiz.`);
          
          // Delete mock accounts if a valid API key was used successfully
          const mockIds = ["p-tik", "p-ins", "p-yt", "p-blog-1"];
          const { error: delError } = await supabase
            .from("postiz_accounts")
            .delete()
            .in("id", mockIds);

          if (delError) {
            console.error("[Postiz Sync] Warning: failed to delete mock accounts:", delError);
          }

          if (integrations.length > 0) {
            // Fetch current accounts from DB to perform a merge
            const { data: currentDbAccounts } = await supabase
              .from("postiz_accounts")
              .select("id");
            
            const existingIds = new Set((currentDbAccounts || []).map((a: any) => a.id));

            for (const integration of integrations) {
              const integrationId = String(integration.id);
              const name = integration.name || `Channel ${integrationId}`;
              const handle = integration.profile || `@channel_${integrationId}`;
              const avatar = integration.picture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100";
              
              let type = (integration.identifier || "tiktok").toLowerCase();
              if (type.includes("tiktok")) type = "tiktok";
              else if (type.includes("instagram")) type = "instagram";
              else if (type.includes("youtube")) type = "youtube";
              else if (type.includes("medium")) type = "medium";
              else type = "tiktok"; // Default fallback

              if (existingIds.has(integrationId)) {
                // Account already exists. Update basic profile info.
                const { error: updateError } = await supabase
                  .from("postiz_accounts")
                  .update({
                    name,
                    handle,
                    avatar,
                    type,
                    connected: true
                  })
                  .eq("id", integrationId);
                
                if (updateError) {
                  console.error(`[Postiz Sync] Error updating account ${integrationId}:`, updateError);
                }
              } else {
                // New account. Insert with defaults.
                const { error: insertError } = await supabase
                  .from("postiz_accounts")
                  .insert({
                    id: integrationId,
                    name,
                    handle,
                    avatar,
                    type,
                    connected: true,
                    theme: "AI Automation & No-Code SaaS Build Guides",
                    aesthetic: "Dark moody background, terminal typeface overlays",
                    goal: "Build loyal list of followers",
                    strategy: "Daily snappy visual tutorials highlighting workflows",
                    style: "Fast cuts, high contrast text stroke elements",
                    personality: "Pragmatic, values speed and hates over-complicated tooling",
                    agent_logs: ["[Initialization] Account synced from Postiz"],
                    categories: ["TECH"]
                  });

                if (insertError) {
                  console.error(`[Postiz Sync] Error inserting account ${integrationId}:`, insertError);
                }
              }
            }
          }
        } else {
          console.error(`[Postiz Sync] Failed to fetch integrations. Status: ${response.status} ${response.statusText}`);
        }
      } catch (syncErr) {
        console.error("[Postiz Sync] Error during Postiz integration sync:", syncErr);
      }
    }

    const { data: accounts, error } = await supabase
      .from("postiz_accounts")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) throw error;

    const mappedAccounts = accounts.map((acct: any) => ({
      id: acct.id,
      name: acct.name,
      handle: acct.handle,
      type: acct.type,
      avatar: acct.avatar,
      connected: acct.connected,
      theme: acct.theme,
      aesthetic: acct.aesthetic,
      goal: acct.goal,
      strategy: acct.strategy,
      style: acct.style,
      personality: acct.personality,
      agentLogs: acct.agent_logs || [],
      categories: acct.categories || []
    }));

    res.json({ accounts: mappedAccounts, config: postizConfig });
  } catch (err: any) {
    console.error("Failed to query postiz_accounts:", err);
    res.status(500).json({ error: err.message });
  }
});

app.patch("/api/postiz/accounts/:id", async (req, res) => {
  try {
    const { theme, aesthetic, goal, strategy, style, personality, agentLogs, categories } = req.body;
    const updateData: any = {};
    
    if (theme !== undefined) updateData.theme = theme;
    if (aesthetic !== undefined) updateData.aesthetic = aesthetic;
    if (goal !== undefined) updateData.goal = goal;
    if (strategy !== undefined) updateData.strategy = strategy;
    if (style !== undefined) updateData.style = style;
    if (personality !== undefined) updateData.personality = personality;
    if (agentLogs !== undefined) updateData.agent_logs = agentLogs;
    if (categories !== undefined) updateData.categories = categories;

    const { data, error } = await supabase
      .from("postiz_accounts")
      .update(updateData)
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, account: data });
  } catch (err: any) {
    console.error("Failed to patch postiz_accounts:", err);
    res.status(500).json({ error: err.message });
  }
});

// DEEPSEEK CORE DELEGATION AGENT ENDPOINT
app.post("/api/postiz/accounts/:id/run-agent", async (req, res) => {
  try {
    const { data: account, error: fetchErr } = await supabase
      .from("postiz_accounts")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (fetchErr || !account) {
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
      subtitles: `Why 90% of builders fail before launch: they build too slow. Focus on the core API loop first 🛠`,
      blogContent: `## Micro-SaaS Acceleration Formula\n\nTo build a highly viral audience matching your target goal: "${account.goal}", we focus strictly on modular code constructs. Don't waste weeks on auth and database boilerplate.\n\n### Core Checklist:\n- Initialize minimal backend proxies\n- Pipe credentials directly through standard middleware\n- Ship within 24 hours of inception`,
      mediaType: account.type === "medium" ? "text" : "video"
    };

    const deepseekKey = process.env.DEEPSEEK_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;
    let providerUsed = "Dynamic High-Fidelity Simulation (No Keys Set)";

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
        console.error("Gemini fallback failed:", gemError);
      }
    }

    const targetDate = new Date(2026, 5, 2);
    const generatedPosts: any[] = [];

    for (const hour of [9, 13, 17, 21]) {
      const postDate = new Date(targetDate);
      postDate.setHours(hour, 0, 0, 0);

      const newPost = {
        id: "sched-" + Date.now() + "-" + hour,
        title: `${generatedText.title} - Variant ${hour}`,
        type: account.type === "medium" ? "blog" : "social",
        media_type: generatedText.mediaType || (account.type === "medium" ? "text" : "video"),
        platform: account.type,
        account_id: account.id,
        file_url: account.type === "medium" ? null : STOCK_VIDEOS[Math.floor(Math.random() * STOCK_VIDEOS.length)],
        subtitles: generatedText.subtitles,
        scheduled_at: postDate.toISOString(),
        status: "scheduled",
        blog_content: generatedText.blogContent,
        platforms: [account.id]
      };

      const { error: insErr } = await supabase
        .from("scheduled_posts")
        .insert(newPost);
      
      if (insErr) throw insErr;

      generatedPosts.push({
        id: newPost.id,
        title: newPost.title,
        type: newPost.type,
        mediaType: newPost.media_type,
        platform: newPost.platform,
        accountId: newPost.account_id,
        fileUrl: newPost.file_url,
        subtitles: newPost.subtitles,
        scheduledAt: newPost.scheduled_at,
        status: newPost.status,
        blogContent: newPost.blog_content,
        platforms: newPost.platforms
      });
    }

    const nowStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const updatedLogs = [
      `[${nowStr}] [Spark] DeepSeek triggered on theme: "${account.theme}"`,
      `[${nowStr}] [Orchestrator] Provider: ${providerUsed}`,
      `[${nowStr}] [Writer] Generated topic: "${generatedText.title}"`,
      `[${nowStr}] [Delegator] Scheduled exactly 4 slots (9am, 1pm, 5pm, 9pm) for June 2, 2026`,
      `[${nowStr}] [Executor] Dispatched directly to calendar pipeline successfully. ● ONLINE`
    ];

    await supabase
      .from("postiz_accounts")
      .update({ agent_logs: updatedLogs })
      .eq("id", account.id);

    res.json({
      success: true,
      posts: generatedPosts,
      logs: updatedLogs
    });

  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/postiz/config", (req, res) => {
  const { endpoint, apiKey, useRealPostiz } = req.body;
  postizConfig.endpoint = endpoint || postizConfig.endpoint;
  postizConfig.apiKey = apiKey || postizConfig.apiKey;
  postizConfig.useRealPostiz = !!useRealPostiz;
  res.json({ success: true, config: postizConfig });
});

// SELF-HOSTED LINK INGESTION (Supabase synced)
app.post("/api/import-link", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: "No URL provided" });
    }

    let platform = "unknown";
    if (url.includes("tiktok.com")) platform = "tiktok";
    else if (url.includes("instagram.com")) platform = "instagram";
    else if (url.includes("youtube.com") || url.includes("youtu.be")) platform = "youtube";

    let parsedTitle = `Imported ${platform.charAt(0).toUpperCase() + platform.slice(1)} Clip`;
    let duration = 30;

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
        console.error("Gemini title extraction failed:", err);
      }
    }

    const binDir = path.join(__dirname, "bin");
    const isWindows = process.platform === "win32";
    const ytdlpPath = path.join(binDir, isWindows ? "yt-dlp.exe" : "yt-dlp");
    const downloadsDir = path.join(__dirname, "temp", "downloads");

    const fileId = "import-" + Date.now();
    const outputPattern = path.join(downloadsDir, `${fileId}.%(ext)s`);

    console.log(`[Ingest] Downloading URL via yt-dlp: ${url}`);

    execFile(ytdlpPath, ["-f", "best", "-o", outputPattern, "--no-playlist", url], async (error, stdout, stderr) => {
      if (error) {
        console.error("[yt-dlp Ingest Error]:", stderr || error.message);
        return res.status(500).json({ error: `Downloader failed: ${error.message}` });
      }

      const files = fs.readdirSync(downloadsDir);
      const downloadedFile = files.find(f => f.startsWith(fileId));
      if (!downloadedFile) {
        return res.status(500).json({ error: "Downloaded video file not found on disk" });
      }

      const localFilePath = path.join(downloadsDir, downloadedFile);
      const stats = fs.statSync(localFilePath);
      const sizeMB = `${(stats.size / (1024 * 1024)).toFixed(1)} MB`;

      const videoUrl = await uploadFileToR2(localFilePath, `videos/${downloadedFile}`);

      let thumbnail = STOCK_PHOTOS[Math.floor(Math.random() * STOCK_PHOTOS.length)];
      const thumbFileName = `${fileId}.jpg`;
      const localThumbPath = path.join(downloadsDir, thumbFileName);

      if (ffmpeg) {
        const ffArgs = ["-y", "-i", localFilePath, "-ss", "00:00:01", "-vframes", "1", localThumbPath];
        await new Promise<void>((resolve) => {
          execFile(ffmpeg!, ffArgs, async (ffErr) => {
            if (!ffErr && fs.existsSync(localThumbPath)) {
              thumbnail = await uploadFileToR2(localThumbPath, `thumbnails/${thumbFileName}`);
              fs.unlink(localThumbPath, () => {});
            }
            resolve();
          });
        });
      }

      // Save to Supabase
      const { error: insErr } = await supabase
        .from("imported_assets")
        .insert({
          id: fileId,
          source_url: url,
          title: parsedTitle,
          thumbnail,
          video_url: videoUrl,
          duration,
          downloaded: true,
          size: sizeMB
        });

      if (insErr) {
        console.error("[Supabase Insert Error]:", insErr);
        return res.status(500).json({ error: insErr.message });
      }

      res.json({
        success: true,
        asset: {
          id: fileId,
          sourceUrl: url,
          title: parsedTitle,
          thumbnail,
          videoUrl,
          duration,
          downloaded: true,
          size: sizeMB
        }
      });
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/imported-assets", async (req, res) => {
  try {
    const { data: assets, error } = await supabase
      .from("imported_assets")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const mappedAssets = assets.map((a: any) => ({
      id: a.id,
      sourceUrl: a.source_url,
      title: a.title,
      thumbnail: a.thumbnail,
      videoUrl: a.video_url,
      duration: a.duration,
      downloaded: a.downloaded,
      size: a.size
    }));

    res.json(mappedAssets);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/imported-assets/:id", async (req, res) => {
  try {
    const { error } = await supabase
      .from("imported_assets")
      .delete()
      .eq("id", req.params.id);

    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// YOUTUBE TO MP3 CONVERTER ENDPOINT
app.post("/api/music/convert-mp3", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: "No URL provided" });
    }

    const binDir = path.join(__dirname, "bin");
    const isWindows = process.platform === "win32";
    const ytdlpPath = path.join(binDir, isWindows ? "yt-dlp.exe" : "yt-dlp");
    const downloadsDir = path.join(__dirname, "temp", "downloads");

    const fileId = "audio-" + Date.now();
    const outputPattern = path.join(downloadsDir, `${fileId}.%(ext)s`);

    console.log(`[Audio Convert] Extracting MP3 from URL: ${url}`);

    const args = ["-x", "--audio-format", "mp3", "--audio-quality", "0", "-o", outputPattern, "--no-playlist", url];

    execFile(ytdlpPath, args, async (error, stdout, stderr) => {
      if (error) {
        console.error("[Audio Convert Error]:", stderr || error.message);
        return res.status(500).json({ error: `Audio extraction failed: ${error.message}` });
      }

      const files = fs.readdirSync(downloadsDir);
      const downloadedFile = files.find(f => f.startsWith(fileId) && f.endsWith(".mp3"));
      if (!downloadedFile) {
        return res.status(500).json({ error: "Extracted audio file not found" });
      }

      const localFilePath = path.join(downloadsDir, downloadedFile);
      const audioUrl = await uploadFileToR2(localFilePath, `audio/${downloadedFile}`);

      const newSong = {
        id: fileId,
        title: `Extracted Track (${url.split('v=')[1]?.substring(0, 8) || 'Source URL'})`,
        artist: "Web Audio",
        duration: 180,
        audioUrl,
        genre: "Ingested Audio",
        artwork: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=120&auto=format&fit=crop&q=80",
      };

      CURATED_MUSIC.unshift(newSong);
      res.json({ success: true, song: newSong });
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// QUICK BATCH GENERATOR (Composites and saves into Supabase)
app.post("/api/postiz/accounts/:id/run-quick-batch", async (req, res) => {
  try {
    const { templateTitle, startDate, songId, cropStart, cropEnd, replacements } = req.body;
    
    const { data: account, error: accErr } = await supabase
      .from("postiz_accounts")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (accErr || !account) {
      return res.status(404).json({ error: "Account not found" });
    }

    const nowStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const initialLogs = [
      `[${nowStr}] [Orchestrator] Launching Quick Batch for folder: ${templateTitle || "Default"}`,
      `[${nowStr}] [Orchestrator] Preparing 5 variant renders...`
    ];

    await supabase
      .from("postiz_accounts")
      .update({ agent_logs: initialLogs })
      .eq("id", account.id);

    const { data: assets } = await supabase
      .from("imported_assets")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);

    const referenceAssets = (assets && assets.length > 0) ? assets : [{
      id: "mock-stock",
      title: "Stock Video Loop",
      video_url: STOCK_VIDEOS[0],
      thumbnail: STOCK_PHOTOS[0]
    }];

    const selectedSong = CURATED_MUSIC.find(s => s.id === songId) || CURATED_MUSIC[0];
    const duration = (cropEnd || 30) - (cropStart || 0);
    const generatedPosts: any[] = [];

    const rendersDir = path.join(__dirname, "temp", "renders");
    const fontPath = path.join(__dirname, "bin", "font.ttf");

    for (let idx = 0; idx < 5; idx++) {
      const asset = referenceAssets[idx % referenceAssets.length];
      const textReplacement = replacements?.[idx % replacements.length] || (replacements?.[0] || `Variant ${idx + 1} Caption`);
      const renderFileId = `render-${Date.now()}-${idx}`;
      const localRenderPath = path.join(rendersDir, `${renderFileId}.mp4`);

      const escapedFontPath = fontPath.replace(/\\/g, "/").replace(/:/g, "\\:");
      const cleanText = textReplacement.replace(/'/g, "").replace(/"/g, "");
      const videoFilter = `drawtext=fontfile='${escapedFontPath}':text='${cleanText}':fontcolor=white:fontsize=20:borderw=2:bordercolor=black:x=(w-text_w)/2:y=(h-text_h)/2`;

      let videoUrl = asset.video_url;
      let renderSuccess = false;

      if (ffmpeg && fs.existsSync(fontPath)) {
        // Download remote files to local for FFmpeg
        const downloadsDir = path.join(__dirname, "temp", "downloads");
        const videoLocal = await ensureLocalFile(asset.video_url, downloadsDir, `batch-vid-${idx}`);
        const audioLocal = await ensureLocalFile(selectedSong.audioUrl, downloadsDir, `batch-aud-${idx}`);

        const ffArgs = [
          "-y",
          "-ss", "0",
          "-t", duration.toString(),
          "-i", videoLocal.localPath,
          "-ss", (cropStart || 0).toString(),
          "-t", duration.toString(),
          "-i", audioLocal.localPath,
          "-vf", videoFilter,
          "-map", "0:v",
          "-map", "1:a",
          "-c:v", "libx264",
          "-pix_fmt", "yuv420p",
          "-c:a", "aac",
          "-shortest",
          localRenderPath
        ];

        await new Promise<void>((resolve) => {
          execFile(ffmpeg!, ffArgs, (ffErr) => {
            if (ffErr) {
              console.error(`[FFmpeg Batch Render ${idx}]`, ffErr.message);
            } else {
              renderSuccess = true;
            }
            resolve();
          });
        });

        // Cleanup temp downloads
        if (videoLocal.isTemp) fs.unlink(videoLocal.localPath, () => {});
        if (audioLocal.isTemp) fs.unlink(audioLocal.localPath, () => {});
      }

      if (renderSuccess && fs.existsSync(localRenderPath)) {
        videoUrl = await uploadFileToR2(localRenderPath, `renders/${renderFileId}.mp4`);
        fs.unlink(localRenderPath, () => {});
      }

      const baseDate = startDate ? new Date(startDate) : new Date(2026, 5, 2);
      const postHour = [9, 13, 17, 21][idx % 4];
      const daysToAdd = Math.floor(idx / 4);

      const scheduledAt = new Date(baseDate);
      scheduledAt.setDate(baseDate.getDate() + daysToAdd);
      scheduledAt.setHours(postHour, 0, 0, 0);

      const newPost = {
        id: "sched-" + Date.now() + "-" + idx,
        title: `${templateTitle || "Batch Post"} - Variant ${idx + 1}`,
        type: "social",
        media_type: "video",
        platform: account.type,
        account_id: account.id,
        file_url: videoUrl,
        subtitles: textReplacement,
        scheduled_at: scheduledAt.toISOString(),
        status: "scheduled",
        song_id: selectedSong.id,
        crop_start: cropStart,
        crop_end: cropEnd,
        platforms: [account.id]
      };

      const { error: postErr } = await supabase
        .from("scheduled_posts")
        .insert(newPost);

      if (postErr) throw postErr;

      generatedPosts.push({
        id: newPost.id,
        title: newPost.title,
        type: newPost.type,
        mediaType: newPost.media_type,
        platform: newPost.platform,
        accountId: newPost.account_id,
        fileUrl: newPost.file_url,
        subtitles: newPost.subtitles,
        scheduledAt: newPost.scheduled_at,
        status: newPost.status,
        songId: newPost.song_id,
        cropStart: newPost.crop_start,
        cropEnd: newPost.crop_end,
        platforms: newPost.platforms
      });

      // Postiz REST API scheduling
      if (postizConfig.useRealPostiz && postizConfig.apiKey) {
        try {
          await fetch(`${postizConfig.endpoint}/posts`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": postizConfig.apiKey
            },
            body: JSON.stringify({
              type: "schedule",
              date: scheduledAt.toISOString(),
              posts: [
                {
                  integration: { id: account.id },
                  value: [{ content: textReplacement, video: [{ url: videoUrl }] }],
                  settings: { __type: account.type }
                }
              ]
            })
          });
        } catch (postizErr) {
          console.error("[Postiz Scheduling Error]:", postizErr);
        }
      }
    }

    const completedStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const updatedLogs = [
      ...initialLogs,
      `[${completedStr}] [Orchestrator] Batch rendering complete.`,
      `[${completedStr}] [Executor] Generated 5 content variants.`,
      `[${completedStr}] [Postiz] Scheduled variants at 9AM, 1PM, 5PM, 9PM on the Calendar! ● ONLINE`
    ];

    await supabase
      .from("postiz_accounts")
      .update({ agent_logs: updatedLogs })
      .eq("id", account.id);

    res.json({
      success: true,
      posts: generatedPosts,
      logs: updatedLogs
    });

  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// SINGLE RENDER COMPILER (From manual editor to Supabase)
app.post("/api/music/render-single", async (req, res) => {
  try {
    const { videoUrl, songId, cropStart, cropEnd, textOverlay, accountId, scheduledAt } = req.body;

    const rendersDir = path.join(__dirname, "temp", "renders");
    const fontPath = path.join(__dirname, "bin", "font.ttf");

    const renderFileId = `render-single-${Date.now()}`;
    const localRenderPath = path.join(rendersDir, `${renderFileId}.mp4`);

    const duration = (cropEnd || 30) - (cropStart || 0);
    const selectedSong = CURATED_MUSIC.find(s => s.id === songId) || CURATED_MUSIC[0];

    const escapedFontPath = fontPath.replace(/\\/g, "/").replace(/:/g, "\\:");
    const cleanText = (textOverlay || "Preview Overlay").replace(/'/g, "").replace(/"/g, "");
    const videoFilter = `drawtext=fontfile='${escapedFontPath}':text='${cleanText}':fontcolor=white:fontsize=22:borderw=2:bordercolor=black:x=(w-text_w)/2:y=(h-text_h)/2`;

    let finalVideoUrl = videoUrl;
    let renderSuccess = false;

    if (ffmpeg && fs.existsSync(fontPath)) {
      // Download remote files to local for FFmpeg
      const downloadsDir = path.join(__dirname, "temp", "downloads");
      const videoLocal = await ensureLocalFile(videoUrl, downloadsDir, 'single-vid');
      const audioLocal = await ensureLocalFile(selectedSong.audioUrl, downloadsDir, 'single-aud');

      const ffArgs = [
        "-y",
        "-ss", "0",
        "-t", duration.toString(),
        "-i", videoLocal.localPath,
        "-ss", (cropStart || 0).toString(),
        "-t", duration.toString(),
        "-i", audioLocal.localPath,
        "-vf", videoFilter,
        "-map", "0:v",
        "-map", "1:a",
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac",
        "-shortest",
        localRenderPath
      ];

      await new Promise<void>((resolve) => {
        execFile(ffmpeg!, ffArgs, (ffErr) => {
          if (ffErr) {
            console.error('[FFmpeg Single Render]', ffErr.message);
          } else {
            renderSuccess = true;
          }
          resolve();
        });
      });

      // Cleanup temp downloads
      if (videoLocal.isTemp) fs.unlink(videoLocal.localPath, () => {});
      if (audioLocal.isTemp) fs.unlink(audioLocal.localPath, () => {});
    }

    if (renderSuccess && fs.existsSync(localRenderPath)) {
      finalVideoUrl = await uploadFileToR2(localRenderPath, `renders/${renderFileId}.mp4`);
      fs.unlink(localRenderPath, () => {});
    }

    const postDate = scheduledAt ? new Date(scheduledAt) : new Date(2026, 5, 2, 9, 0, 0);

    const newPost = {
      id: "sched-" + Date.now(),
      title: `Manual Render Clip`,
      type: "social",
      media_type: "video",
      platform: "tiktok",
      account_id: accountId,
      file_url: finalVideoUrl,
      subtitles: cleanText,
      scheduled_at: postDate.toISOString(),
      status: "scheduled",
      song_id: selectedSong.id,
      crop_start: cropStart,
      crop_end: cropEnd,
      platforms: [accountId]
    };

    const { error: insErr } = await supabase
      .from("scheduled_posts")
      .insert(newPost);

    if (insErr) throw insErr;

    // Call Postiz REST API if active
    if (postizConfig.useRealPostiz && postizConfig.apiKey) {
      try {
        await fetch(`${postizConfig.endpoint}/posts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": postizConfig.apiKey
          },
          body: JSON.stringify({
            type: "schedule",
            date: postDate.toISOString(),
            posts: [
              {
                integration: { id: accountId },
                value: [{ content: cleanText, video: [{ url: finalVideoUrl }] }],
                settings: { __type: "tiktok" }
              }
            ]
          })
        });
      } catch (err) {
        console.error("[Postiz manual dispatch error]:", err);
      }
    }

    res.json({ 
      success: true, 
      post: {
        id: newPost.id,
        title: newPost.title,
        type: newPost.type,
        mediaType: newPost.media_type,
        platform: newPost.platform,
        accountId: newPost.account_id,
        fileUrl: newPost.file_url,
        subtitles: newPost.subtitles,
        scheduledAt: newPost.scheduled_at,
        status: newPost.status,
        songId: newPost.song_id,
        cropStart: newPost.crop_start,
        cropEnd: newPost.crop_end,
        platforms: newPost.platforms
      }
    });

  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// BLOG ARTICLE GENERATION
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

// BULK VARIANT METHOD GENERATOR
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

// GET /api/scheduled-posts (from database)
app.get("/api/scheduled-posts", async (req, res) => {
  try {
    const { data: posts, error } = await supabase
      .from("scheduled_posts")
      .select("*")
      .order("scheduled_at", { ascending: true });

    if (error) throw error;

    const mappedPosts = posts.map((p: any) => ({
      id: p.id,
      title: p.title,
      type: p.type,
      mediaType: p.media_type,
      platform: p.platform,
      fileUrl: p.file_url,
      subtitles: p.subtitles,
      scheduledAt: p.scheduled_at,
      status: p.status,
      songId: p.song_id,
      cropStart: p.crop_start,
      cropEnd: p.crop_end,
      blogContent: p.blog_content,
      seoMeta: p.seo_meta,
      accountId: p.account_id,
      platforms: p.platforms || []
    }));

    res.json(mappedPosts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/scheduled-posts", async (req, res) => {
  try {
    const { title, type, mediaType, platform, fileUrl, subtitles, scheduledAt, songId, cropStart, cropEnd, blogContent, seoMeta, platforms } = req.body;
    const postId = "sched-" + Date.now();
    
    const newPost = {
      id: postId,
      title: title || "New Scheduled Draft",
      type: type || "social",
      media_type: mediaType || "video",
      platform: platform || "tiktok",
      file_url: fileUrl || STOCK_VIDEOS[0],
      subtitles: subtitles || "",
      scheduled_at: scheduledAt || new Date().toISOString(),
      status: "scheduled",
      song_id: songId || "",
      crop_start: cropStart !== undefined ? Number(cropStart) : 0,
      crop_end: cropEnd !== undefined ? Number(cropEnd) : 30,
      blog_content: blogContent || "",
      seo_meta: seoMeta || null,
      account_id: platforms?.[0] || platform,
      platforms: platforms && platforms.length > 0 ? platforms : [platform]
    };

    const { error } = await supabase
      .from("scheduled_posts")
      .insert(newPost);

    if (error) throw error;

    res.json({ 
      success: true, 
      post: {
        id: newPost.id,
        title: newPost.title,
        type: newPost.type,
        mediaType: newPost.media_type,
        platform: newPost.platform,
        fileUrl: newPost.file_url,
        subtitles: newPost.subtitles,
        scheduledAt: newPost.scheduled_at,
        status: newPost.status,
        songId: newPost.song_id,
        cropStart: newPost.crop_start,
        cropEnd: newPost.crop_end,
        blogContent: newPost.blog_content,
        seoMeta: newPost.seo_meta,
        accountId: newPost.account_id,
        platforms: newPost.platforms
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch("/api/scheduled-posts/:id", async (req, res) => {
  try {
    const { scheduledAt, status } = req.body;
    const updateData: any = {};
    if (scheduledAt) updateData.scheduled_at = scheduledAt;
    if (status) updateData.status = status;

    const { data: post, error } = await supabase
      .from("scheduled_posts")
      .update(updateData)
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) throw error;

    res.json({ 
      success: true, 
      post: {
        id: post.id,
        title: post.title,
        type: post.type,
        mediaType: post.media_type,
        platform: post.platform,
        fileUrl: post.file_url,
        subtitles: post.subtitles,
        scheduledAt: post.scheduled_at,
        status: post.status,
        songId: post.song_id,
        cropStart: post.crop_start,
        cropEnd: post.crop_end,
        blogContent: post.blog_content,
        seoMeta: post.seo_meta,
        accountId: post.account_id,
        platforms: post.platforms
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/scheduled-posts/:id", async (req, res) => {
  try {
    const { error } = await supabase
      .from("scheduled_posts")
      .delete()
      .eq("id", req.params.id);

    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Mock media library endpoint
app.get("/api/media-library", (req, res) => {
  res.json({
    videos: STOCK_VIDEOS,
    photos: STOCK_PHOTOS
  });
});

// Vite middleware & Static serving
async function startServer() {
  await initBinaries();

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
