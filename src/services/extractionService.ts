import { db } from '../lib/firebase';
import { ref, push, set } from 'firebase/database';

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
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ query, source, context })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.details || "Failed to reach extraction core");
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

    // Sync to Firebase Realtime Database
    try {
      const sanitizedQuery = query.replace(/[^a-zA-Z0-9]/g, '_');
      const leadsRef = ref(db, 'leads/' + sanitizedQuery);
      
      for (const lead of filteredLeads) {
        const newLeadRef = push(leadsRef);
        await set(newLeadRef, {
          ...lead,
          syncedAt: new Date().toISOString(),
          searchQuery: query,
          searchSource: source,
          verified: true
        });
      }
      console.log(`[FIREBASE] Synced ${filteredLeads.length} verified leads to Realtime Database.`);
    } catch (firebaseErr) {
      console.warn("[FIREBASE_SYNC_WARNING] Could not sync to cloud:", firebaseErr);
    }

    return filteredLeads;
  } catch (error) {
    console.error("Grounded Extraction Failure:", error);
    throw new Error(`Real-Time Extraction Failed: ${error instanceof Error ? error.message : "Internal AI Error"}`);
  }
}
