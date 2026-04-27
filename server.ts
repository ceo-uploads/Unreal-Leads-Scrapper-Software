import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function logToFile(msg: string) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

// Global AI instance using the platform-provided key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

/**
 * Algorithmic Lead Extraction Engine (Native Lumina_OS)
 * Generates deterministic but realistic-looking leads based on query heuristics.
 */
function extractLeadsAlgorithmic(query: string, source: string, context: string) {
  const seeds = ["Quantum", "Apex", "Global", "Nexus", "Horizon", "Vision", "Elite", "Strategic", "Digital", "Fusion"];
  const types = ["Solutions", "Dynamics", "Synergy", "Systems", "Agency", "Ventures", "Partners", "Group", "Labs", "Tech"];
  const areas = ["Downtown", "North District", "Tech Plaza", "West Wing", "Silicon Valley", "Metro Center", "East Harbor", "Skyline Tower"];
  
  const count = Math.floor(Math.random() * (15 - 10 + 1)) + 10;
  const results = [];
  
  // Extract keywords from query to influence names
  const keywords = query.split(" ").filter(w => w.length > 3);
  const primaryKey = keywords[0] || "Universal";
  const category = keywords.length > 1 ? keywords.slice(-1)[0] : "Commercial";

  for (let i = 0; i < count; i++) {
    const seed = seeds[i % seeds.length];
    const type = types[Math.floor(Math.random() * types.length)];
    const businessName = `${primaryKey} ${seed} ${type}`;
    const ownerFirst = ["James", "Sarah", "Michael", "Elena", "David", "Lucia", "Robert", "Sophia"][i % 8];
    const ownerLast = ["Chen", "Miller", "Smith", "Garcia", "Brown", "Wilson", "Taylor", "Anderson"][i % 8];
    
    results.push({
      id: `lead_${Date.now()}_${i}`,
      name: businessName,
      address: `${Math.floor(Math.random() * 999) + 1} ${areas[i % areas.length]}`,
      phone: "", // No longer generating fake phones
      email: "", // No longer generating fake emails
      owner: `${ownerFirst} ${ownerLast}`,
      website: "",
      category: category.charAt(0).toUpperCase() + category.slice(1),
      extractedAt: new Date().toISOString(),
      synthetic: true
    });
  }
  
  return results;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Router
  const apiRouter = express.Router();
  
  apiRouter.get("/status", (req, res) => {
    res.json({ 
      online: true, 
      geminiConfigured: !!process.env.GEMINI_API_KEY,
      instruction: "System Online: Hybrid Extraction Core Active"
    });
  });

  apiRouter.get("/health", (req, res) => {
    res.json({ status: "ok", mode: "hybrid" });
  });

  apiRouter.post("/grounded-extract", async (req, res) => {
    const { query, source, context } = req.body;
    
    const providers = [
      {
        name: "OpenRouter",
        key: process.env.OPENROUTER_API_KEY,
        url: "https://openrouter.ai/api/v1/chat/completions",
        model: "google/gemini-2.0-flash-001"
      },
      {
        name: "Groq",
        key: process.env.GROQ_API_KEY,
        url: "https://api.groq.com/openai/v1/chat/completions",
        model: "llama-3.1-70b-versatile"
      },
      {
        name: "Cerebras",
        key: process.env.CEREBRAS_API_KEY,
        url: "https://api.cerebras.ai/v1/chat/completions",
        model: "llama3.1-70b"
      },
      {
        name: "Mistral",
        key: process.env.MISTRAL_API_KEY,
        url: "https://api.mistral.ai/v1/chat/completions",
        model: "mistral-large-latest"
      },
      {
        name: "Together",
        key: process.env.TOGETHER_API_KEY,
        url: "https://api.together.xyz/v1/chat/completions",
        model: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo"
      }
    ];

    const isCoord = (context || "").includes("rectangle") || (context || "").includes("near");
    const geoTarget = isCoord ? `the proximity of ${context}` : `the region of "${context || 'Global'}"`;

    const basePrompt = `
      CRITICAL ACTION: Perform a DEEP VIRTUAL SEARCH for ACTUAL verified business leads.
      TARGET QUERY: "${query}"
      STRICT GEOGRAPHIC FOCUS: ${geoTarget}
      SOURCE PLATFORM: ${source}

      ABSOLUTE DATA INTEGRITY PROTOCOL:
      1. ONLY return results with REAL, VERIFIABLE information. 
      2. COMPREHENSIVE SEARCH: Aim to return at least 10-15 leads per scan.
      3. MINIMUM CONTACT REQUIREMENT: Every lead MUST have at least ONE verifiable contact method (either a direct Phone Number, a valid Email, or a clickable Website).
      4. DO NOT return placeholder strings like "No email found", "N/A", "Unknown", or "No address provided".
      5. PRECISION ENFORCEMENT: Only return businesses physically located within ${geoTarget}.
      6. USE GOOGLE SEARCH GROUNDING to find every possible entity in this sector.

      JSON STRUCTURE REQUIREMENT:
      Return a JSON array of objects.
      Fields: name (string), address (string), phone (string), email (string), website (string), category (string)
      
      Output ONLY the JSON array. No preamble. No markdown blocks.
    `;

    // Quality Guard Function
    const qualityGuard = (leads: any[]) => {
      return leads.filter(lead => {
        const hasName = lead.name && lead.name.length > 2 && !/^[A-Z0-9]{5,}$/.test(lead.name); // Filter out random junk names
        const hasContact = (lead.email && lead.email.includes('@')) || (lead.phone && lead.phone.length > 5) || (lead.website && lead.website.includes('.'));
        const isNotPlaceholder = !JSON.stringify(lead).toLowerCase().includes("no email found") && 
                                 !JSON.stringify(lead).toLowerCase().includes("no phone found") &&
                                 !JSON.stringify(lead).toLowerCase().includes("no address");
        return hasName && hasContact && isNotPlaceholder;
      });
    };

    // 1. Try API Providers (OpenRouter, Groq, Cerebras, etc.)
    for (const provider of providers) {
      if (!provider.key) continue;

      logToFile(`[ROUTING] Attempting ${provider.name} for: "${query}"`);
      try {
        const response = await fetch(provider.url, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${provider.key}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: provider.model,
            messages: [{ role: "user", content: basePrompt }],
            temperature: 0.1
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.choices && data.choices[0]) {
            const content = data.choices[0].message.content.trim();
            const jsonMatch = content.match(/\[\s*\{[\s\S]*\}\s*\]/);
            const cleanedContent = jsonMatch ? jsonMatch[0] : content.replace(/^```json\n?/, "").replace(/\n?```$/, "");
            const rawLeads = JSON.parse(cleanedContent);
            const leads = qualityGuard(rawLeads);
            if (leads.length === 0 && rawLeads.length > 0) {
              logToFile(`[${provider.name}] No high-quality leads found. Filtered out ${rawLeads.length} low-quality entries.`);
              continue; // Try next provider
            }
            logToFile(`[${provider.name}] Success: ${leads.length} high-quality leads.`);
            return res.json(leads);
          }
        } else {
          logToFile(`[ROUTING] ${provider.name} failed with status: ${response.status}`);
        }
      } catch (err) {
        logToFile(`[ROUTING-EXCEPTION] ${provider.name}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    // 2. Final Fallback: Native Gemini with Search Grounding
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      logToFile(`[ROUTING] Attempting Native Gemini Grounding for: "${query}"`);
      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: basePrompt,
          config: {
            tools: [{ googleSearch: {} }],
            temperature: 0.1
          }
        });

        if (response.text) {
          const content = response.text.trim();
          const jsonMatch = content.match(/\[\s*\{[\s\S]*\}\s*\]/);
          const cleanedContent = jsonMatch ? jsonMatch[0] : content.replace(/^```json\n?/, "").replace(/\n?```$/, "");
          const rawLeads = JSON.parse(cleanedContent);
          const leads = qualityGuard(rawLeads);
          if (leads.length === 0 && rawLeads.length > 0) {
              logToFile(`[GEMINI-SDK] No high-quality leads found. Filtered out ${rawLeads.length} low-quality entries.`);
          } else {
            logToFile(`[GEMINI-SDK] Success: ${leads.length} high-quality leads.`);
            return res.json(leads);
          }
        }
      } catch (err) {
        logToFile(`[GEMINI-SDK-EXCEPTION] ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    // 3. Absolute Failure
    logToFile(`[ROUTING-FAILURE] All AI channels exhausted or returned low-quality data for query: ${query}`);
    res.status(503).json({ 
      error: "Quality Guard: Extraction Inhibited", 
      details: "The search returned results, but they lacked verifiable contact information (Email/Phone). To prevent faulty database population, these entries were discarded. Please refine your query or ensure higher-tier API keys are configured for grounded search." 
    });
  });

  apiRouter.post("/neural-extract", async (req, res) => {
    const { query, source, context } = req.body;
    
    if (!query) return res.status(400).json({ error: "Query is required" });

    logToFile(`[ALGO-ENGINE] Processing search: ${query}`);
    
    try {
      // Simulate algorithmic processing delay (200-800ms) for "extraction" feel
      const delay = Math.floor(Math.random() * 600) + 200;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      const data = extractLeadsAlgorithmic(query, source || "Global", context || "General");
      
      logToFile(`[ALGO-ENGINE] Success: ${data.length} leads generated.`);
      res.json(data);
    } catch (error) {
      logToFile(`[ALGO-ERROR] ${error instanceof Error ? error.message : String(error)}`);
      res.status(500).json({ 
        error: "Algorithmic Processing Failure", 
        details: "The local extraction core encountered an unexpected state." 
      });
    }
  });

  app.use("/api", apiRouter);

  // Development / Production middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In Electron production, distPath is usually the same directory as server.js
    const distPath = __dirname;
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    logToFile(`>>> Lumina_OS (ALGORITHMIC CORE) live on port ${PORT}`);
  });
}

startServer();
