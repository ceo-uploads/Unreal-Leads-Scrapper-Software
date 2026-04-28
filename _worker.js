export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Handle API routing
    if (url.pathname === "/api/grounded-extract" || url.pathname === "/api/grounded-extract/") {
      if (request.method === "OPTIONS") {
        return new Response(null, {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        });
      }

      if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

      try {
        const body = await request.json();
        const { query, context, source } = body;
        
        const isCoord = (context || "").includes("rectangle") || (context || "").includes("near") || (context || "").includes(",");
        const geoTarget = isCoord ? `the proximity of ${context}` : `the region of "${context || 'Global'}"`;

        const basePrompt = `
          CRITICAL ACTION: Perform a DEEP VIRTUAL SEARCH for ACTUAL verified business leads.
          TARGET QUERY: "${query}"
          STRICT GEOGRAPHIC FOCUS: ${geoTarget}
          SOURCE PLATFORM: ${source}

          ABSOLUTE DATA INTEGRITY PROTOCOL:
          1. ONLY return results with REAL, VERIFIABLE information. 
          2. COMPREHENSIVE SEARCH: Aim to return at least 15-20 leads per scan.
          3. MINIMUM CONTACT REQUIREMENT: Every lead MUST have at least ONE verifiable contact method (Phone, Email, or clickable Website).
          4. DO NOT return placeholder strings like "No email found", "N/A", "Unknown", or "No address provided".
          5. PRECISION ENFORCEMENT: Only return businesses physically located within ${geoTarget}.
          6. USE GOOGLE SEARCH GROUNDING to find every possible entity in this sector.

          JSON STRUCTURE REQUIREMENT:
          Return a JSON array of objects.
          Fields: name (string), address (string), phone (string), email (string), website (string), category (string)
          
          Output ONLY the JSON array. No preamble. No markdown blocks.
        `;

        const qualityGuard = (leads) => {
          return (Array.isArray(leads) ? leads : []).filter(lead => {
            const hasName = lead.name && lead.name.length > 2 && !/^[A-Z0-9]{5,}$/.test(lead.name); 
            const hasContact = (lead.email && lead.email.includes('@')) || (lead.phone && lead.phone.length > 5) || (lead.website && lead.website.includes('.'));
            const isNotPlaceholder = !JSON.stringify(lead).toLowerCase().includes("no email found") && 
                                     !JSON.stringify(lead).toLowerCase().includes("no phone found") &&
                                     !JSON.stringify(lead).toLowerCase().includes("no address");
            return hasName && hasContact && isNotPlaceholder;
          });
        };

        // Providers matching server.ts logic
        const providers = [
          {
            name: "Groq",
            key: env.GROQ_API_KEY,
            url: "https://api.groq.com/openai/v1/chat/completions",
            model: "llama-3.3-70b-versatile"
          },
          {
            name: "Mistral",
            key: env.MISTRAL_API_KEY,
            url: "https://api.mistral.ai/v1/chat/completions",
            model: "mistral-large-latest"
          },
          {
            name: "OpenRouter",
            key: env.OPENROUTER_API_KEY,
            url: "https://openrouter.ai/api/v1/chat/completions",
            model: "google/gemini-2.0-flash-001"
          }
        ];

        // 1. Try API Providers
        for (const p of providers) {
          if (!p.key) continue;

          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);

            const res = await fetch(p.url, {
              method: "POST",
              headers: { "Authorization": `Bearer ${p.key}`, "Content-Type": "application/json" },
              body: JSON.stringify({
                model: p.model,
                messages: [{ role: "user", content: basePrompt }],
                temperature: 0.1
              }),
              signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (res.ok) {
              const data = await res.json();
              const content = data.choices?.[0]?.message?.content || "";
              const jsonMatch = content.match(/\[\s*\{[\s\S]*\}\s*\]/);
              const cleaned = jsonMatch ? jsonMatch[0] : content.trim();
              const leads = qualityGuard(JSON.parse(cleaned));
              if (leads.length > 0) {
                return new Response(JSON.stringify(leads), { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
              }
            }
          } catch (e) { console.warn(`Provider ${p.name} failed:`, e); }
        }

        // 2. Final Fallback: Gemini with Grounding (The "VScode" standard)
        if (env.GEMINI_API_KEY) {
          const gUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${env.GEMINI_API_KEY}`;
          const gRes = await fetch(gUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: basePrompt }] }],
              tools: [{ google_search: {} }],
              generationConfig: { temperature: 0.1 }
            })
          });

          if (gRes.ok) {
            const gData = await gRes.json();
            const gContent = gData.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
            const gJson = gContent.match(/\[\s*\{[\s\S]*\}\s*\]/);
            const gLeads = qualityGuard(JSON.parse(gJson ? gJson[0] : gContent.trim()));
            return new Response(JSON.stringify(gLeads), { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
          }
        }

        return new Response(JSON.stringify([]), { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { "Content-Type": "application/json" } });
      }
    }

    return env.ASSETS.fetch(request);
  }
}
