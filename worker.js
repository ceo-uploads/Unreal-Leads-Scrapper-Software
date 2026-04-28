export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Handle API routing
    if (url.pathname === "/api/grounded-extract" || url.pathname === "/api/grounded-extract/") {
      // Handle CORS preflight
      if (request.method === "OPTIONS") {
        return new Response(null, {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        });
      }

      if (request.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
      }

      try {
        const body = await request.json();
        const { query, context, source } = body;
        
        const apiKey = env.GEMINI_API_KEY;
        if (!apiKey) {
          return new Response(JSON.stringify({ error: "Cloudflare: GEMINI_API_KEY environment variable is missing." }), { 
            status: 500,
            headers: { "Content-Type": "application/json" }
          });
        }

        const isCoord = context && context.includes(',');
        const geoTarget = isCoord ? `the proximity of ${context}` : `the region of "${context || 'Global'}"`;

        const prompt = `
          Perform a DEEP VIRTUAL SEARCH for business leads.
          QUERY: "${query}"
          REGION: ${geoTarget}
          PLATFORM: ${source}
          
          Return a JSON array of objects with fields: name, address, phone, email, website, category.
          Return ONLY the JSON. Minimum 15 leads.
        `;

        const googleUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const response = await fetch(googleUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.1 }
          })
        });

        const data = await response.json();
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
        const jsonMatch = content.match(/\[\s*\{[\s\S]*\}\s*\]/);
        const cleanedContent = jsonMatch ? jsonMatch[0] : content.trim();
        
        return new Response(cleanedContent, {
          headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*" 
          }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { 
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
    }

    // Default: Fallback to Cloudflare Pages assets (standard behavior for _worker.js)
    return env.ASSETS.fetch(request);
  }
}
