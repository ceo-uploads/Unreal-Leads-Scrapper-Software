export interface ScrapedLead {
  name: string;
  address: string;
  phone?: string;
  email?: string;
  owner?: string;
  website?: string;
  category: string;
}

/**
 * Real-Time Grounded Lead Extraction Service
 * Uses backend API proxy to OpenRouter for high-speed grounded extraction.
 */
export async function extractLeads(query: string, source: string = "Global", context?: string): Promise<ScrapedLead[]> {
  try {
    const response = await fetch("/api/grounded-extract", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({ query, source, context })
    });

    if (!response.ok) {
      const status = response.status;
      const errText = await response.text().catch(() => "Unknown error");
      console.error(`[API-ERROR] Status: ${status}, Body: ${errText.substring(0, 200)}`);
      
      if (status === 405) {
        throw new Error("Cloudflare Configuration Error (405): The API endpoint exists but rejects the request method. Ensure your Functions are correctly deployed.");
      }
      if (status === 404) {
         throw new Error("Cloudflare Configuration Error (404): The API endpoint path /api/grounded-extract was not found. Ensure the /functions folder was included in your upload.");
      }
      
      try {
        const errData = JSON.parse(errText);
        throw new Error(errData.details || errData.error || "Failed to reach extraction core");
      } catch (e) {
        throw new Error(`Server returned ${status}: ${errText.substring(0, 100)}`);
      }
    }

    const leads: ScrapedLead[] = await response.json();

    if (!leads || leads.length === 0) {
      return [];
    }

    // Client-side Sanity Check: Ensure leads actually belong to the target context
    const cleanContext = (context || "").toLowerCase();
    const isCoordinateContext = cleanContext.includes("rectangle");
    const isNearbyContext = cleanContext.includes("near");
    
    // We skip strict city-name filtering if we are using raw coordinates without a clear location name
    // Also skip if context is too generic
    const shouldSkipFiltering = !context || context === "Global" || (isCoordinateContext && !isNearbyContext);
    
    const filteredLeads = !shouldSkipFiltering
      ? leads.filter(lead => {
          const cleanAddress = (lead.address || "").toLowerCase();
          const cleanName = (lead.name || "").toLowerCase();
          
          // Get keywords from the context (e.g. "Noakhali" from "Noakhali area (near ...)")
          const contextParts = cleanContext.split("(")[0].replace("area", "").trim();
          const keywords = contextParts.split(/[,\s]+/).filter(k => k.length > 2);
          
          if (keywords.length === 0) return true;
          
          // Allow if ANY keyword matches anywhere in the address or name
          const matches = keywords.some(k => cleanAddress.includes(k) || cleanName.includes(k));
          
          // LOGGING for debugging if filtered
          if (!matches) {
            console.log(`[FILTER-REJECT] "${lead.name}" at "${lead.address}" did not match keywords: ${keywords.join(', ')}`);
          }
          return matches;
        })
      : leads;

    if (filteredLeads.length === 0 && leads.length > 0) {
      console.warn(`[SANITY-CHECK] Filtered out all ${leads.length} leads. Returning original results as fallback to prevent zero-result error.`);
      // If we filtered EVERYTHING out, it might be a naming convention mismatch. 
      // Return original leads but log a warning.
      return leads; 
    }

    return filteredLeads;
  } catch (error) {
    console.error("Grounded Extraction Failure:", error);
    throw new Error(`Real-Time Extraction Failed: ${error instanceof Error ? error.message : "Internal AI Error"}`);
  }
}
