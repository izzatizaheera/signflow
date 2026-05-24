import { createClient } from "@supabase/supabase-js";

// Check if credentials are present in the environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

/**
 * Clean Supabase client initialization.
 */
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ==========================================
// DB TYPES DEFINITIONS
// ==========================================
export interface DbProfile {
  id: string; // references auth.users
  username: string;
  avatar_url: string;
  created_at?: string;
}

export interface DbUserProgress {
  id: string; // uuid
  user_id: string;
  lesson_id: string;
  completed: boolean;
  xp: number;
  updated_at?: string;
}

export interface DbStreak {
  id: string; // uuid
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_active_date: string; // date string (YYYY-MM-DD)
  updated_at?: string;
}

export interface DbBuddy {
  id: string; // uuid
  user_id: string;
  buddy_name: string;
  buddy_avatar: string;
  buddy_streak: number;
  nudge_count: number;
  updated_at?: string;
}

export interface DbNudge {
  id: string; // uuid
  sender_id: string;
  receiver_buddy_id: string;
  message: string;
  created_at?: string;
}

export interface DbSavedPhrase {
  id: string; // uuid
  user_id: string;
  english_text: string;
  malay_text: string;
  created_at?: string;
}

// ==========================================
// 👣 REAL FOLLOW SYSTEM HELPERS & STORAGE UPLOADS
// ==========================================

/**
 * Upload an avatar file to the Supabase Storage 'avatars' bucket.
 * Beginner comment: Storage upload triggers here. High resolution avatar images are stored 
 * under 'avatars' bucket, returning the fully formatted public CDN URL.
 */
export async function uploadAvatarFile(userId: string, file: File): Promise<string | null> {
  if (!supabase || !isSupabaseConfigured) return null;
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = fileName; // Upload directly to bucket root or folder

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { cacheControl: "3600", upsert: true });

    if (uploadError) {
      console.warn("[Supabase Storage] Error uploading file:", uploadError.message);
      return null;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    return data.publicUrl;
  } catch (err) {
    console.error("[Supabase Storage] Exception uploading avatar:", err);
    return null;
  }
}

/**
 * Update the user's profile database row inside variables.
 * Beginner comment: Queries and updates are sent directly to the 'profiles' Table here.
 */
export async function updateUserProfile(
  userId: string,
  username: string,
  avatarUrl: string,
  bio?: string
): Promise<DbProfile | null> {
  if (!supabase || !isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from("profiles")
      .upsert({
        id: userId,
        username,
        avatar_url: avatarUrl,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.warn("[Supabase Profiles] Error updating profile row:", error.message);
    }
    return data;
  } catch (err) {
    console.error("[Supabase Profiles] Update exception:", err);
    return null;
  }
}

/**
 * Fetch and handle follower/following count dynamically from Supabase database.
 * Beginner comment: Relational queries are calculated to establish standard followers counters.
 */
export async function getFollowStats(userId: string): Promise<{ followers: number; following: number; isFollowingTarget: boolean }> {
  let followersCount = 0; // default beginner count
  let followingCount = 0; // default beginner count
  
  if (!supabase || !isSupabaseConfigured) {
    return { followers: followersCount, following: followingCount, isFollowingTarget: false };
  }
  
  try {
    const { count: followers, error: err1 } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("following_id", userId);
      
    const { count: following, error: err2 } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", userId);
      
    if (!err1 && followers !== null) followersCount = followers;
    if (!err2 && following !== null) followingCount = following;
  } catch (err) {
    // Elegant fallback tracking in case follows table is pending migration
    console.warn("Follows count fallback checked:", err);
  }
  
  return { followers: followersCount, following: followingCount, isFollowingTarget: false };
}

/**
 * Toggle following status of another user or static friend.
 */
export async function toggleFollow(followerId: string, followingId: string, isCurrentlyFollowing: boolean): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) return true; // simulated success
  try {
    if (isCurrentlyFollowing) {
      const { error } = await supabase
        .from("follows")
        .delete()
        .eq("follower_id", followerId)
        .eq("following_id", followingId);
        
      return !error;
    } else {
      const { error } = await supabase
        .from("follows")
        .insert({
          id: crypto.randomUUID(),
          follower_id: followerId,
          following_id: followingId,
          created_at: new Date().toISOString()
        });
        
      return !error;
    }
  } catch (err) {
    console.error("Toggle follow exception:", err);
    return false;
  }
}

// ==========================================
// 🔐 AUTHENTICATION HELPERS
// ==========================================

/**
 * Upsert user profile when logging in or signing up.
 */
export async function syncUserProfile(userId: string, email: string): Promise<DbProfile | null> {
  if (!supabase || !isSupabaseConfigured) return null;
  const username = email.split("@")[0] || "SignFlow Ally";
  const defaultAvatar = "https://i.pinimg.com/1200x/58/7a/5d/587a5da410420abe2e54b5ed9f605665.jpg";

  try {
    const { data: existing } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (existing) {
      return existing as DbProfile;
    }

    // Initialize with beginner defaults
    const { data, error } = await supabase
      .from("profiles")
      .upsert({
        id: userId,
        username,
        avatar_url: defaultAvatar,
        created_at: new Date().toISOString(),
        // Point 2: New users must start as COMPLETE BEGINNERS
        level: 1,
        xp: 0,
        weekly_progress: 0,
        current_streak: 0,
        hearts: 5,
        lessons_completed: 0
      })
      .select()
      .single();

    if (error) {
      console.warn("[Supabase] Profiles upsert error:", error.message);
    }
    return data;
  } catch (err) {
    console.error("[Supabase] Profiles exception:", err);
    return null;
  }
}

// ==========================================
// 📈 USER PROGRESS HELPERS (user_progress table)
// ==========================================

export async function getUserProgressList(userId: string): Promise<DbUserProgress[]> {
  if (!supabase || !isSupabaseConfigured) return [];
  try {
    const { data, error } = await supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      console.warn("[Supabase] Error loading user progress:", error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error("[Supabase] User progress exception:", err);
    return [];
  }
}

export async function saveUserProgress(
  userId: string,
  lessonId: string,
  completed: boolean,
  xpWon: number
): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) return false;
  try {
    const rowId = crypto.randomUUID();
    const { error } = await supabase
      .from("user_progress")
      .insert({
        id: rowId,
        user_id: userId,
        lesson_id: lessonId,
        completed,
        xp: xpWon,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.warn("[Supabase] Error saving progress row:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[Supabase] Progress insert exception:", err);
    return false;
  }
}

// ==========================================
// 🔥 STREAK HELPERS (streaks table)
// ==========================================

export async function getStreakRow(userId: string): Promise<DbStreak | null> {
  if (!supabase || !isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from("streaks")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.warn("[Supabase] Error loading streaks:", error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.error("[Supabase] Streaks load exception:", err);
    return null;
  }
}

export async function updateStreakRow(
  userId: string,
  currentStreak: number,
  longestStreak: number,
  lastActiveDateStr: string
): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) return false;
  try {
    const { data: existing } = await supabase
      .from("streaks")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    const rowId = existing?.id || crypto.randomUUID();

    const { error } = await supabase
      .from("streaks")
      .upsert({
        id: rowId,
        user_id: userId,
        current_streak: currentStreak,
        longest_streak: longestStreak,
        last_active_date: lastActiveDateStr,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.warn("[Supabase] Error saving streak:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[Supabase] Streak update exception:", err);
    return false;
  }
}

// ==========================================
// 👐 STREAK BUDDIES HELPERS (buddies & nudges tables)
// ==========================================

/**
 * Loads buddies for this specific user. 
 * If none exist in the DB, it seeds the DB with default buddies from INITIAL_BUDDIES.
 */
export async function getAndSeedBuddies(
  userId: string,
  defaultBuddies: { id: string; name: string; avatar: string; streakDays: number; nudged: boolean }[]
): Promise<DbBuddy[]> {
  if (!supabase || !isSupabaseConfigured) return [];
  try {
    const { data, error } = await supabase
      .from("buddies")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      console.warn("[Supabase] Error loading buddies:", error.message);
      return [];
    }

    if (data && data.length > 0) {
      return data as DbBuddy[];
    }

    // Seeding default buddies
    const seededList: DbBuddy[] = [];
    for (const buddy of defaultBuddies) {
      const generatedRowId = crypto.randomUUID();
      const { data: inserted, error: insertError } = await supabase
        .from("buddies")
        .insert({
          id: generatedRowId,
          user_id: userId,
          buddy_name: buddy.name,
          buddy_avatar: buddy.avatar,
          buddy_streak: buddy.streakDays,
          nudge_count: buddy.nudged ? 1 : 0,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (!insertError && inserted) {
        seededList.push(inserted as DbBuddy);
      }
    }

    if (seededList.length > 0) {
      return seededList;
    }

    return [];
  } catch (err) {
    console.error("[Supabase] Column sync buddies exception:", err);
    return [];
  }
}

/**
 * Increment a buddy's nudge count and records a real interaction row inside the nudges table.
 */
export async function updateNudgeInteraction(
  userId: string,
  buddyRowId: string,
  message: string
): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) return false;
  try {
    // 1. Get buddy to see current nudge count
    const { data: buddyData, error: loadErr } = await supabase
      .from("buddies")
      .select("nudge_count")
      .eq("id", buddyRowId)
      .single();

    if (loadErr) {
      console.warn("[Supabase] Could not load buddy for nudge:", loadErr.message);
      return false;
    }

    // 2. Increment nudge count in the buddies table
    const nextNudgeCount = (buddyData?.nudge_count || 0) + 1;
    const { error: buddyUpdErr } = await supabase
      .from("buddies")
      .update({
        nudge_count: nextNudgeCount,
        updated_at: new Date().toISOString()
      })
      .eq("id", buddyRowId);

    if (buddyUpdErr) {
      console.warn("[Supabase] Buddy nudge count update failed:", buddyUpdErr.message);
      return false;
    }

    // 3. Save a real row inside the 'nudges' table
    const { error: nudgeInsErr } = await supabase
      .from("nudges")
      .insert({
        id: crypto.randomUUID(),
        sender_id: userId,
        receiver_buddy_id: buddyRowId,
        message,
        created_at: new Date().toISOString()
      });

    if (nudgeInsErr) {
      console.warn("[Supabase] Nudge record generation failed:", nudgeInsErr.message);
    }

    return true;
  } catch (err) {
    console.error("[Supabase] Nudge exception:", err);
    return false;
  }
}

// ==========================================
// 📝 TRANSLATION CARD HISTORY (saved_phrases table)
// ==========================================

export async function getUserSavedPhrases(userId: string): Promise<DbSavedPhrase[]> {
  if (!supabase || !isSupabaseConfigured) return [];
  try {
    const { data, error } = await supabase
      .from("saved_phrases")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      console.warn("[Supabase] Error loading saved_phrases:", error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error("[Supabase] Loading saved phrases exception:", err);
    return [];
  }
}

export async function saveToSavedPhrases(
  userId: string,
  englishText: string,
  malayText: string
): Promise<DbSavedPhrase | null> {
  if (!supabase || !isSupabaseConfigured) return null;
  try {
    const rowId = crypto.randomUUID();
    const { data, error } = await supabase
      .from("saved_phrases")
      .insert({
        id: rowId,
        user_id: userId,
        english_text: englishText,
        malay_text: malayText,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.warn("[Supabase] Error inserting saved phrase:", error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.error("[Supabase] Insert saved phrase exception:", err);
    return null;
  }
}

export async function deleteFromSavedPhrases(userId: string, phraseId: string): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) return false;
  try {
    const { error } = await supabase
      .from("saved_phrases")
      .delete()
      .eq("user_id", userId)
      .eq("id", phraseId);

    if (error) {
      console.warn("[Supabase] Error deleting saved phrase:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[Supabase] Delete saved phrase exception:", err);
    return false;
  }
}
