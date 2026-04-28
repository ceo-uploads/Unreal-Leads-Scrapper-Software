export async function onRequestPost({ request, env }) {
  try {
    const { query, context, source } = await request.json();
    
    // We use the Gemini API Key from Cloudflare Environment Variables
    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Cloudflare: GEMINI_API_KEY not configured in dashboard." }), { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    const isCoord = context && context.includes(',');
    const geoTarget = isCoord ? `the proximity of ${context}` : `the region of "${context || 'Global'}"`;

    const prompt = `
      CRITICAL ACTION: Perform a DEEP VIRTUAL SEARCH for ACTUAL verified business leads.
      TARGET QUERY: "${query}"
      STRICT GEOGRAPHIC FOCUS: ${geoTarget}
      SOURCE PLATFORM: ${source}

      ABSOLUTE DATA INTEGRITY PROTOCOL:
      1. ONLY return results with REAL, VERIFIABLE information. 
      2. COMPREHENSIVE SEARCH: Aim to return at least 15-20 leads per scan.
      3. MINIMUM CONTACT REQUIREMENT: Every lead MUST have at least ONE verifiable contact method (Phone, Email, or clickable Website).
      4. PRECISION ENFORCEMENT: Only return businesses physically located within ${geoTarget}.
      5. USE GOOGLE SEARCH GROUNDING to find every possible entity in this sector.

      JSON STRUCTURE REQUIREMENT:
      Return a JSON array of objects.
      Fields: name (string), address (string), phone (string), email (string), website (string), category (string)
      
      Output ONLY the JSON array. No preamble.
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
    
    if (!response.ok) {
        return new Response(JSON.stringify({ error: "Gemini API Error", details: data }), { 
            status: response.status,
            headers: { "Content-Type": "application/json" }
        });
    }

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
