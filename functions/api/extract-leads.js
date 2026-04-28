export async function onRequestPost({ request, env }) {
  try {
    const { query, context, source } = await request.json();
    const apiKey = env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Cloudflare: GEMINI_API_KEY missing." }), { 
        status: 500, headers: { "Content-Type": "application/json" } 
      });
    }

    const isCoord = context && context.includes(',');
    const geoTarget = isCoord ? `the proximity of ${context}` : `the region of "${context || 'Global'}"`;

    const prompt = `
      Perform a DEEP VIRTUAL SEARCH for ACTUAL verified business leads.
      TARGET QUERY: "${query}"
      STRICT GEOGRAPHIC FOCUS: ${geoTarget}
      SOURCE PLATFORM: ${source}
      
      Return a JSON array of objects with fields: name, address, phone, email, website, category.
      Output ONLY the JSON array.
    `;

    // FIX 1: Explicitly add the 'google_search' tool for grounding
    // FIX 2: Ensure you are using the v1beta endpoint for grounding features
    const googleUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const response = await fetch(googleUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        // CRITICAL: This is what "Grounded Extraction" requires to work via API
        tools: [{ google_search: {} }], 
        generationConfig: { 
          temperature: 0, // Lower temperature is better for extraction
          response_mime_type: "application/json" // Force JSON output
        }
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      return new Response(JSON.stringify({ error: "Gemini API Error", details: data }), { 
        status: response.status, headers: { "Content-Type": "application/json" } 
      });
    }

    // Extraction logic for grounded results
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
    
    return new Response(content, {
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" 
      }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500, headers: { "Content-Type": "application/json" } 
    });
  }
}