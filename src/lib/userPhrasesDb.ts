import { supabase, isSupabaseConfigured } from "./supabase";
import { ToolkitPhrase } from "../types";

// Fallback constant key
const LOCAL_STORAGE_KEY = "bim_local_user_phrases";

export interface UserPhraseDbRow {
  id?: string;
  user_id: string;
  phrase: string;
  translated_text: string; // Stored as a JSON block or clean readable string
  category: string;
  created_at?: string;
}

/**
 * Inserts a newly generated phrase into Supabase (user_phrases table)
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
  
  // Format info as beautiful explanatory text
  const customDescription = `BIM GLOSS: ${translatedBimData.gloss}. | Movement Guide: ${translatedBimData.handshape}. | Facial Focus: ${translatedBimData.facialExpression}. | Tip: ${translatedBimData.linguisticTip} (${translatedBimData.gamifiedFeedback})`;

  const newPhraseItem: ToolkitPhrase = {
    id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    phrase: phraseTitle,
    description: customDescription,
    image: translatedBimData.imageUrl || "https://images.bimsignbank.org/vocab/A.webp", // Match correct default fallback
    imageUrl: translatedBimData.imageUrl,
    youtubeUrl: translatedBimData.youtubeUrl,
    embedUrl: translatedBimData.embedUrl,
    sourceUrl: translatedBimData.sourceUrl,
    category: category,
    isNew: true
  };

  // 1. Back up to Local Storage regardless of status
  try {
    const existing = localStorage.getItem(LOCAL_STORAGE_KEY);
    const array = existing ? JSON.parse(existing) : [];
    array.push(newPhraseItem);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(array));
  } catch (err) {
    console.error("Local storage sync error:", err);
  }

  // 2. Query Supabase custom 'user_phrases' table if active
  if (isSupabaseConfigured && supabase) {
    try {
      const activeUserId = userId || "anonymous_ally";
      const { data, error } = await supabase
        .from("user_phrases")
        .insert({
          user_id: activeUserId,
          phrase: phraseTitle,
          translated_text: JSON.stringify(translatedBimData),
          category: category,
          created_at: new Date().toISOString()
        })
        .select();

      if (error) {
        console.warn("Supabase saving to 'user_phrases' table failed: ", error.message);
        return {
          success: true, // Mark success relative to local state fallback
          data: newPhraseItem,
          feedback: `Saved locally! Note: Supabase inserts failed. Please verify that 'user_phrases' table exists. Error: ${error.message}`
        };
      }

      const returnedId = data?.[0]?.id?.toString() || newPhraseItem.id;
      return {
        success: true,
        data: {
          ...newPhraseItem,
          id: returnedId
        },
        feedback: "🎉 Phrase saved securely to Supabase database ('user_phrases' table) & synced with local study list!"
      };
    } catch (e: any) {
      console.warn("Exception inserting to Supabase:", e);
      return {
        success: true,
        data: newPhraseItem,
        feedback: `Saved locally! Supabase exception: ${e.message || e}`
      };
    }
  }

  return {
    success: true,
    data: newPhraseItem,
    feedback: "🎉 Phrase translated successfully and stored in local Ally storage! (To save and backup on Supabase, configure your credentials in Settings!)"
  };
}

/**
 * Load all user-generated phrases from local storage & Supabase
 */
export async function getCombinedUserPhrases(userId?: string): Promise<ToolkitPhrase[]> {
  const localPhrases: ToolkitPhrase[] = [];
  
  // 1. Fetch from local storage first
  try {
    const existing = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (existing) {
      localPhrases.push(...JSON.parse(existing));
    }
  } catch (e) {
    console.error("Error loading local custom phrases:", e);
  }

  // 2. Fetch and merge from Supabase 'user_phrases' if available
  if (isSupabaseConfigured && supabase) {
    try {
      const activeUserId = userId || "anonymous_ally";
      const { data, error } = await supabase
        .from("user_phrases")
        .select("*")
        .eq("user_id", activeUserId);

      if (!error && data && data.length > 0) {
        const dbPhrases: ToolkitPhrase[] = data.map((item: any) => {
          let parsedText = {
            gloss: item.phrase.toUpperCase(),
            handshape: "Standard hand wave contours",
            facialExpression: "Warm attentive smile",
            linguisticTip: "Practice transition frames slowly",
            gamifiedFeedback: "+10 XP!"
          };

          try {
            if (item.translated_text) {
              parsedText = typeof item.translated_text === "string" 
                ? JSON.parse(item.translated_text) 
                : item.translated_text;
            }
          } catch {
            // keep default fallback
          }

          const desc = `BIM GLOSS: ${parsedText.gloss}. | Movement Guide: ${parsedText.handshape}. | Facial Focus: ${parsedText.facialExpression}. | Tip: ${parsedText.linguisticTip} (${parsedText.gamifiedFeedback})`;

          return {
            id: item.id?.toString(),
            phrase: item.phrase,
            description: desc,
            image: "/src/assets/images/asl_hands_practice_1779393673641.png",
            category: item.category || "Basic Conversation",
            isNew: true
          };
        });

        // Combine lists, making sure we don't duplicate identical phrases
        const resultList = [...localPhrases];
        dbPhrases.forEach((dbItem) => {
          const hasMatch = resultList.some((localItem) => 
            localItem.phrase.toLowerCase() === dbItem.phrase.toLowerCase() &&
            localItem.category === dbItem.category
          );
          if (!hasMatch) {
            resultList.push(dbItem);
          }
        });

        return resultList;
      }
    } catch (e) {
      console.warn("Could not query 'user_phrases' from Supabase:", e);
    }
  }

  return localPhrases;
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

  // 2. Remove from Supabase if configured
  if (isSupabaseConfigured && supabase) {
    try {
      const activeUserId = userId || "anonymous_ally";
      const { error } = await supabase
        .from("user_phrases")
        .delete()
        .eq("user_id", activeUserId)
        .eq("id", id);

      if (error) {
        return {
          success: true,
          feedback: `Removed locally! Note: Supabase delete failed: ${error.message}`
        };
      }
    } catch (e: any) {
      return {
        success: true,
        feedback: `Removed locally! Supabase error: ${e.message || e}`
      };
    }
  }

  return {
    success: true,
    feedback: "🎉 Phrase deleted successfully!"
  };
}
