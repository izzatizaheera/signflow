import { ToolkitPhrase } from "../types";
import { 
  supabase, 
  isSupabaseConfigured, 
  saveToSavedPhrases, 
  getUserSavedPhrases, 
  deleteFromSavedPhrases 
} from "./supabase";

// Local Storage Fallback Key
const LOCAL_STORAGE_KEY = "bim_local_user_phrases";

/**
 * Inserts a newly generated phrase into Supabase (saved_phrases table)
 * and backs it up to local storage so it's globally interactive.
 */
export async function saveUserPhrase(
  phraseTitle: string,
  translatedBimData: {
    gloss: string;
    handshape: string;
    facialExpression: string;
    linguisticTip: string;
    gamifiedFeedback: string;
    imageUrl?: string;
    youtubeUrl?: string;
    embedUrl?: string;
    sourceUrl?: string;
  },
  category: string,
  userId?: string
): Promise<{ success: boolean; data?: ToolkitPhrase; feedback: string }> {
  
  // Create beautiful description guiding gestures
  const customDescription = `BIM GLOSS: ${translatedBimData.gloss}. | Movement Guide: ${translatedBimData.handshape}. | Facial Focus: ${translatedBimData.facialExpression}. | Tip: ${translatedBimData.linguisticTip} (${translatedBimData.gamifiedFeedback})`;

  const localId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const newPhraseItem: ToolkitPhrase = {
    id: localId,
    phrase: phraseTitle,
    description: customDescription,
    image: translatedBimData.imageUrl || "https://images.bimsignbank.org/vocab/A.webp",
    imageUrl: translatedBimData.imageUrl,
    youtubeUrl: translatedBimData.youtubeUrl,
    embedUrl: translatedBimData.embedUrl,
    sourceUrl: translatedBimData.sourceUrl,
    category: category,
    isNew: true
  };

  // 1. Back up to Local Storage regardless of auth status
  try {
    const existing = localStorage.getItem(LOCAL_STORAGE_KEY);
    const array = existing ? JSON.parse(existing) : [];
    array.push(newPhraseItem);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(array));
  } catch (err) {
    console.error("Local storage sync error:", err);
  }

  // 2. Insert into Supabase 'saved_phrases' table if active user session is present
  if (isSupabaseConfigured && supabase && userId) {
    try {
      // Serialize rich learning details so they fit into the specified (english_text, malay_text) columns
      const serializedData = JSON.stringify({
        gloss: translatedBimData.gloss,
        handshape: translatedBimData.handshape,
        facialExpression: translatedBimData.facialExpression,
        linguisticTip: translatedBimData.linguisticTip,
        gamifiedFeedback: translatedBimData.gamifiedFeedback,
        imageUrl: translatedBimData.imageUrl,
        youtubeUrl: translatedBimData.youtubeUrl,
        embedUrl: translatedBimData.embedUrl,
        sourceUrl: translatedBimData.sourceUrl,
        category: category
      });

      const savedRow = await saveToSavedPhrases(userId, phraseTitle, serializedData);

      if (savedRow) {
        return {
          success: true,
          data: {
            ...newPhraseItem,
            id: savedRow.id // Use real DB generated row UUID
          },
          feedback: "🎉 Gesture card synced to Supabase database ('saved_phrases' table) and saved locally!"
        };
      } else {
        return {
          success: true,
          data: newPhraseItem,
          feedback: "Saved locally! Note: Supabase insert returned null. Your 'saved_phrases' table may need migration."
        };
      }
    } catch (e: any) {
      console.warn("Exception inserting to Supabase 'saved_phrases':", e);
      return {
        success: true,
        data: newPhraseItem,
        feedback: `Saved locally! Supabase error: ${e.message || e}`
      };
    }
  }

  return {
    success: true,
    data: newPhraseItem,
    feedback: "🎉 Phrase translated and stored in local practice storage!"
  };
}

/**
 * Load all custom user phrases from local storage & Supabase
 */
export async function getCombinedUserPhrases(userId?: string): Promise<ToolkitPhrase[]> {
  const localList: ToolkitPhrase[] = [];
  
  // 1. Fetch from local first
  try {
    const existing = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (existing) {
      localList.push(...JSON.parse(existing));
    }
  } catch (e) {
    console.error("Error loading local phrases:", e);
  }

  // 2. Fetch and merge from Supabase 'saved_phrases' if user logs in
  if (isSupabaseConfigured && supabase && userId) {
    try {
      const dbRows = await getUserSavedPhrases(userId);
      if (dbRows && dbRows.length > 0) {
        const dbPhrases: ToolkitPhrase[] = dbRows.map((row) => {
          let parsedBim = {
            gloss: row.english_text.toUpperCase(),
            handshape: "Standard hand gestures",
            facialExpression: "Warm supportive look",
            linguisticTip: "Practice visual gestures gradually",
            gamifiedFeedback: "+10 XP!",
            imageUrl: undefined,
            youtubeUrl: undefined,
            embedUrl: undefined,
            sourceUrl: undefined,
            category: "Basic Conversation"
          };

          try {
            if (row.malay_text && row.malay_text.startsWith("{")) {
              parsedBim = JSON.parse(row.malay_text);
            }
          } catch {
            // keep default
          }

          const desc = `BIM GLOSS: ${parsedBim.gloss}. | Movement Guide: ${parsedBim.handshape}. | Facial Focus: ${parsedBim.facialExpression}. | Tip: ${parsedBim.linguisticTip} (${parsedBim.gamifiedFeedback})`;

          return {
            id: row.id,
            phrase: row.english_text,
            description: desc,
            image: parsedBim.imageUrl || "https://images.bimsignbank.org/vocab/A.webp",
            imageUrl: parsedBim.imageUrl,
            youtubeUrl: parsedBim.youtubeUrl,
            embedUrl: parsedBim.embedUrl,
            sourceUrl: parsedBim.sourceUrl,
            category: parsedBim.category || "Basic Conversation",
            isNew: true
          };
        });

        // Unique union merge logic
        const combined = [...localList];
        dbPhrases.forEach((dbItem) => {
          const matchIndex = combined.findIndex((loc) => 
            loc.phrase.toLowerCase() === dbItem.phrase.toLowerCase() &&
            loc.category === dbItem.category
          );
          if (matchIndex === -1) {
            combined.push(dbItem);
          } else {
            // Upgrade local ID to real DB uuid for seamless delete queries later
            combined[matchIndex].id = dbItem.id;
          }
        });

        return combined;
      }
    } catch (err) {
      console.warn("Could not query 'saved_phrases' table:", err);
    }
  }

  return localList;
}

/**
 * Deletes a user-generated phrase from local storage & Supabase
 */
export async function deleteUserPhrase(id: string, userId?: string): Promise<{ success: boolean; feedback: string }> {
  // 1. Remove from local storage
  try {
    const existing = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (existing) {
      const array = JSON.parse(existing);
      const filtered = array.filter((item: ToolkitPhrase) => item.id !== id);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
    }
  } catch (err) {
    console.error("Local storage delete error:", err);
  }

  // 2. Remove from Supabase
  if (isSupabaseConfigured && supabase && userId) {
    try {
      const ok = await deleteFromSavedPhrases(userId, id);
      if (ok) {
        return {
          success: true,
          feedback: "🎉 Card successfully deleted from cloud database!"
        };
      }
    } catch (e: any) {
      return {
        success: true,
        feedback: `Deleted locally! Note: Supabase error: ${e.message || e}`
      };
    }
  }

  return {
    success: true,
    feedback: "🎉 Phrase deleted successfully!"
  };
}
