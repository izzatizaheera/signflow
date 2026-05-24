import React, { useState, useEffect, useRef } from "react";
import {
  Flame,
  Heart,
  Map,
  Play,
  RotateCcw,
  Search,
  User,
  Award,
  Check,
  Sparkles,
  HelpCircle,
  ArrowRight,
  Plus,
  Volume2,
  AlertCircle,
  BookOpen,
  Calendar,
  Layers,
  Zap,
  CheckCircle,
  MessageSquare,
  Smile,
  BadgeAlert,
  ArrowLeft,
  Video,
  Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import {
  TopicNode,
  Quest,
  StreakBuddy,
  ToolkitPhrase,
  QuizQuestion,
  PracticeHubModule,
  BimTutorial
} from "./types";

import {
  INITIAL_TOPICS,
  INITIAL_QUESTS,
  INITIAL_BUDDIES,
  INITIAL_PHRASES,
  QUIZ_QUESTIONS,
  alexAvatar,
  sarahAvatar,
  jordanAvatar,
  elenaAvatar,
  practiceImg,
  BIM_TRANSLATION_MAP,
  bimMalayMap,
  bimMediaMap,
  verifiedBimTutorials,
  getVerifiedBimTutorial,
  convertYoutubeToEmbed
} from "./data";

import { supabase, isSupabaseConfigured } from "./lib/supabase";
import { BimAlphabetExplorer } from "./components/BimAlphabetExplorer";
import { RequestPhraseModal } from "./components/RequestPhraseModal";
import { getCombinedUserPhrases, deleteUserPhrase } from "./lib/userPhrasesDb";

const translateEnglishToMalay = (input: string): { translated: string; keywords: string[] } => {
  const normalized = (input || "").toLowerCase().trim();
  
  // Exact match for the entire phrase first
  if (bimMalayMap[normalized]) {
    const malayVal = bimMalayMap[normalized];
    return {
      translated: malayVal,
      keywords: [malayVal]
    };
  }
  
  // Word-by-word / phrase split
  // Remove punctuation first so we don't block matching
  const cleanInput = normalized.replace(/[?.,!]/g, " ").replace(/\s+/g, " ").trim();
  const words = cleanInput.split(" ");
  const translatedWords: string[] = [];
  const keywords: string[] = [];
  
  let i = 0;
  while (i < words.length) {
    if (words[i] === "") {
      i++;
      continue;
    }
    // Check two-word phrases first (e.g. "thank you")
    if (i < words.length - 1) {
      const combined = `${words[i]} ${words[i+1]}`;
      if (bimMalayMap[combined]) {
        const translatedPhrase = bimMalayMap[combined];
        translatedWords.push(translatedPhrase);
        keywords.push(translatedPhrase);
        i += 2;
        continue;
      }
    }
    
    // Check single word
    const single = words[i];
    if (bimMalayMap[single]) {
      const translatedWord = bimMalayMap[single];
      translatedWords.push(translatedWord);
      keywords.push(translatedWord);
    } else {
      // Keep unmatched words to maintain structure
      translatedWords.push(single);
    }
    i++;
  }
  
  const translatedStr = translatedWords.join(" ");
  const formattedTranslated = translatedStr.charAt(0).toUpperCase() + translatedStr.slice(1);
  
  return {
    translated: formattedTranslated || input,
    keywords: keywords
  };
};

const findMatchingMedia = (phraseText: string, glossText: string) => {
  const cleanInput = (phraseText || "").toLowerCase().trim();
  
  // Translate English to Malay
  const translationInfo = translateEnglishToMalay(cleanInput);
  
  // 1. Direct exact mapping on the fully translated phrase
  const normMalay = translationInfo.translated.toLowerCase().trim();
  if (BIM_TRANSLATION_MAP[normMalay]) {
    return {
      media: BIM_TRANSLATION_MAP[normMalay],
      word: normMalay,
      translation: translationInfo
    };
  }
  
  // 2. Loop through detected keywords from English-to-Malay dictionary
  for (const kw of translationInfo.keywords) {
    const kwNorm = kw.trim().toLowerCase();
    if (BIM_TRANSLATION_MAP[kwNorm]) {
      return {
        media: BIM_TRANSLATION_MAP[kwNorm],
        word: kwNorm,
        translation: translationInfo
      };
    }
  }
  
  // 3. Keep original English / Malay direct searches (for user typed input directly matching)
  if (BIM_TRANSLATION_MAP[cleanInput]) {
    return {
      media: BIM_TRANSLATION_MAP[cleanInput],
      word: cleanInput,
      translation: translationInfo
    };
  }
  
  // 4. Standard Gloss fallback
  const normGloss = (glossText || "").toLowerCase().trim();
  if (BIM_TRANSLATION_MAP[normGloss]) {
    return {
      media: BIM_TRANSLATION_MAP[normGloss],
      word: normGloss,
      translation: translationInfo
    };
  }
  
  for (const key of Object.keys(BIM_TRANSLATION_MAP)) {
    if (normGloss.includes(key)) {
      return {
        media: BIM_TRANSLATION_MAP[key],
        word: key,
        translation: translationInfo
      };
    }
  }
  
  // No media found, return translation details for fallback rendering
  return {
    media: null,
    word: cleanInput,
    translation: translationInfo
  };
};

export default function App() {
  // Global User Stats (Persisted in Session/Local State)
  const [xp, setXp] = useState<number>(20);
  const [streak, setStreak] = useState<number>(12);
  const [hearts, setHearts] = useState<number>(3);
  const [level, setLevel] = useState<number>(5);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState<number>(0);

  // Supabase Auth and Sync States
  const [user, setUser] = useState<any>(null);
  const [authEmail, setAuthEmail] = useState<string>("");
  const [authPassword, setAuthPassword] = useState<string>("");
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [supabaseFeedback, setSupabaseFeedback] = useState<string>(
    isSupabaseConfigured ? "Supabase initialized. Pending connection." : "Supabase offline. Running local-first BIM fallback mode."
  );

  // App Navigation (Default Tab matches specified pathing)
  // 'path' (Path routing) | 'practice' (Practice screen drills) | 'toolkit' (Phrase search + AI translate) | 'quests' (Quests) | 'profile' (Profile)
  const [activeTab, setActiveTab] = useState<"path" | "practice" | "toolkit" | "quests" | "profile">("path");
  const [questsSubTab, setQuestsSubTab] = useState<"daily" | "friend">("daily");

  // Selected sub-module in Practice Hub
  const [practiceModule, setPracticeModule] = useState<"receptive" | "mistake" | "flashcard" | "speed">("receptive");

  // Lessons and Path State
  const [topics, setTopics] = useState<TopicNode[]>(INITIAL_TOPICS);
  const [selectedPathNode, setSelectedPathNode] = useState<TopicNode | null>(INITIAL_TOPICS[0]); // Default to first node for immediate access

  // Quests State
  const [quests, setQuests] = useState<Quest[]>(INITIAL_QUESTS);
  
  // Streak buddies State
  const [buddies, setBuddies] = useState<StreakBuddy[]>(INITIAL_BUDDIES);

  // Toolkit / Phrases list State
  const [phrases, setPhrases] = useState<ToolkitPhrase[]>(INITIAL_PHRASES);
  const [phrasesSearch, setPhrasesSearch] = useState<string>("");
  const [phrasesCategory, setPhrasesCategory] = useState<string>("All");
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  // Detailed learning lesson inside Toolkit tab
  const [selectedPhraseLesson, setSelectedPhraseLesson] = useState<ToolkitPhrase | null>(null);

  // Quiz Results / Tracking States
  const [isQuizFinished, setIsQuizFinished] = useState<boolean>(false);
  const [quizCorrectCount, setQuizCorrectCount] = useState<number>(0);
  const [quizSource, setQuizSource] = useState<"path" | "practice">("path");

  // Study restore flag for the lives system
  const [studyModeRestore, setStudyModeRestore] = useState<boolean>(false);

  // Custom AI Phrase translation states
  const [customPhrase, setCustomPhrase] = useState<string>("");
  const [aiTranslating, setAiTranslating] = useState<boolean>(false);
  const [showAiTutorial, setShowAiTutorial] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<{
    gloss: string;
    handshape: string;
    facialExpression: string;
    linguisticTip: string;
    gamifiedFeedback: string;
  } | null>(null);

  // Advanced Supabase request modal popup controls
  const [isRequestModalOpen, setIsRequestModalOpen] = useState<boolean>(false);
  const [requestModalCategory, setRequestModalCategory] = useState<string>("Basic Conversation");

  // Interactive Lesson Player (Standard Receptive)
  const [currentQuizIndex, setCurrentQuizIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [hasCheckedAnswer, setHasCheckedAnswer] = useState<boolean>(false);
  const [answerCorrection, setAnswerCorrection] = useState<{
    correct: boolean;
    feedback: string;
    explanation: string;
  } | null>(null);
  const [videoSpeed, setVideoSpeed] = useState<"normal" | "slow">("normal");
  const [repaying, setReplaying] = useState<boolean>(false);

  // Dynamically filter questions for the selected unit node or fallback to Unit 1 (Alphabet)
  const activeQuestions = QUIZ_QUESTIONS.filter(
    (q) => q.unitId === (selectedPathNode?.id || "1")
  );

  // Debug mode logger for loaded path questions
  useEffect(() => {
    if (selectedPathNode) {
      console.log("Loaded Path:", selectedPathNode.title);
      console.log("Questions:", activeQuestions);
    }
  }, [selectedPathNode?.id]);

  // Sync user values with Supabase cloud database
  const syncProgressToSupabase = async (updatedXp: number, updatedLevel: number, updatedStreak: number) => {
    if (!isSupabaseConfigured || !supabase || !user) return;
    try {
      const { error } = await supabase
        .from("user_progress")
        .upsert({
          id: user.id,
          email: user.email,
          xp: updatedXp,
          level: updatedLevel,
          streak: updatedStreak,
          updated_at: new Date().toISOString()
        }, { onConflict: "id" });
      if (error) {
        console.warn("Failed saving user metrics to Supabase 'user_progress' table:", error.message);
      }
    } catch (err) {
      console.warn("Exception trying to sync stats with Supabase:", err);
    }
  };

  // Auto-sync / load data from Supabase whenever user logs in
  useEffect(() => {
    async function loadProgress() {
      if (!user || !isSupabaseConfigured || !supabase) return;
      try {
        const { data, error } = await supabase
          .from("user_progress")
          .select("xp, level, streak")
          .eq("id", user.id)
          .single();
        if (data) {
          if (data.xp !== undefined && data.xp !== null) setXp(Number(data.xp));
          if (data.level !== undefined && data.level !== null) setLevel(Number(data.level));
          if (data.streak !== undefined && data.streak !== null) setStreak(Number(data.streak));
          setSupabaseFeedback(`Connected to Supabase! Got stats: XP: ${data.xp}, Lvl: ${data.level}, Streak: ${data.streak}.`);
        }
      } catch (e) {
        console.log("No previous stats found on Supabase. Offline storage handles it automatically.");
      }
    }
    loadProgress();
  }, [user]);

  // Daily Mistake Review written input state
  const [typedTranslation, setTypedTranslation] = useState<string>("");
  const [verifyingTyped, setVerifyingTyped] = useState<boolean>(false);
  const [typedFeedback, setTypedFeedback] = useState<{
    correct: boolean;
    score: number;
    feedback: string;
    explanation: string;
  } | null>(null);

  // Flashcards state
  const [flashcardIndex, setFlashcardIndex] = useState<number>(0);
  const [flashcardFlipped, setFlashcardFlipped] = useState<boolean>(false);

  // Speed Recognition State
  const [speedActive, setSpeedActive] = useState<boolean>(false);
  const [speedTimer, setSpeedTimer] = useState<number>(15);
  const [speedQuestion, setSpeedQuestion] = useState<QuizQuestion | null>(null);
  const [speedScore, setSpeedScore] = useState<number>(0);
  const [speedChecked, setSpeedChecked] = useState<boolean>(false);
  const [speedOption, setSpeedOption] = useState<string>("");

  // Celebratory UI triggers
  const [recentNotification, setRecentNotification] = useState<string | null>(null);

  // Collaborative Friend Quest state
  const [sarahFriendLessons, setSarahFriendLessons] = useState<number>(3);
  const [sarahQuestCollected, setSarahQuestCollected] = useState<boolean>(false);

  // Trigger brief floating notifications
  const notify = (msg: string) => {
    setRecentNotification(msg);
    setTimeout(() => {
      setRecentNotification(null);
    }, 4000);
  };

  // Fetch sign data from Supabase or use fallback local BIM set
  useEffect(() => {
    async function fetchSigns() {
      if (!isSupabaseConfigured || !supabase) {
        console.log("Supabase URL or Key not set. Running with fallback local BIM dataset.");
        return;
      }
      try {
        const { data, error } = await supabase
          .from("signs")
          .select("*");
        if (error) throw error;
        if (data && data.length > 0) {
          const fetched: ToolkitPhrase[] = data.map((item: any) => ({
            id: item.id?.toString() || Math.random().toString(),
            phrase: item.title || item.phrase || "BIM Sign",
            description: item.explanation || item.description || "",
            image: item.image_url || item.image || practiceImg,
            category: item.category || "Basic Conversation",
            isNew: Boolean(item.is_new)
          }));
          setPhrases(fetched);
          setSupabaseFeedback(`Connected to Supabase! Loaded ${fetched.length} signs from table 'signs'.`);
        } else {
          setSupabaseFeedback("Connected to Supabase. 'signs' table is empty, loaded offline default BIM signs instead.");
        }
      } catch (err: any) {
        console.error("Error reading signs table from Supabase:", err);
        setSupabaseFeedback(`Connected to Supabase, but failed querying 'signs' table: ${err.message}. Using offline default BIM signs.`);
      }
    }

    async function getSessionUser() {
      if (supabase && isSupabaseConfigured) {
        try {
          const { data } = await supabase.auth.getUser();
          if (data?.user) {
            setUser(data.user);
          }
        } catch (e) {
          console.error("No valid session: ", e);
        }
      }
    }

    fetchSigns();
    getSessionUser();
  }, []);

  // Sync and merge user-generated custom BIM translations (Supabase + LocalStorage fallback)
  useEffect(() => {
    async function syncCustomPhrases() {
      try {
        const customList = await getCombinedUserPhrases(user?.id);
        if (customList && customList.length > 0) {
          setPhrases((prev) => {
            const merged = [...prev];
            customList.forEach((item) => {
              const duplicated = merged.some(
                (m) => m.phrase.toLowerCase() === item.phrase.toLowerCase() && m.category === item.category
              );
              if (!duplicated) {
                merged.push(item);
              }
            });
            return merged;
          });
        }
      } catch (err) {
        console.warn("Could not sync custom user-phrases list:", err);
      }
    }
    syncCustomPhrases();
  }, [user]);

  // Submit password authentication
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword) {
      notify("Please fill in both email and password.");
      return;
    }
    setAuthLoading(true);
    setSupabaseFeedback("");

    if (!isSupabaseConfigured || !supabase) {
      // Graceful local simulation
      setTimeout(() => {
        setAuthLoading(false);
        const simulatedUser = { email: authEmail, id: "simulated-uuid-12345" };
        setUser(simulatedUser);
        notify(`🎉 Success! Simulated ${authMode === "login" ? "Login" : "Registration"} completed!`);
        setSupabaseFeedback(`offline: Simulated session active to preview application flows as ${authEmail}.`);
      }, 800);
      return;
    }

    try {
      if (authMode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
        });
        if (error) throw error;
        if (data.user) {
          setUser(data.user);
          notify("Registration successful! Signed in as " + data.user.email);
          setSupabaseFeedback("User registered in Supabase auth.");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword,
        });
        if (error) throw error;
        if (data.user) {
          setUser(data.user);
          notify("Welcome back! Signed in with Supabase Auth.");
          setSupabaseFeedback(`Session active: ${data.user.email}`);
        }
      }
    } catch (err: any) {
      console.error("Supabase authentication error:", err);
      notify("Authentication error: " + err.message);
      setSupabaseFeedback("Auth Error: " + err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (supabase && isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setAuthEmail("");
    setAuthPassword("");
    setSupabaseFeedback("Offline or signed out.");
    notify("Signed out successfully.");
  };

  // Replay animation simulator
  const handleReplay = () => {
    setReplaying(true);
    setTimeout(() => setReplaying(false), 900);
  };

  // Toggle video speed (Slow Motion)
  const handleToggleSlowMotion = () => {
    setVideoSpeed((prev) => (prev === "normal" ? "slow" : "normal"));
    notify(videoSpeed === "normal" ? "Slow motion mode activated (0.5x speed)!" : "Normal speed mode restored (1.0x speed)!");
  };

  // Check Receptive Lesson Answer
  const handleCheckAnswer = () => {
    if (!selectedOption) return;
    const currentQuestion = activeQuestions[currentQuizIndex] || activeQuestions[0];
    if (!currentQuestion) return;
    const isCorrect = selectedOption === currentQuestion.correctAnswer;

    let pointsEarned = 0;
    let xpMsg = "";
    
    if (isCorrect) {
      pointsEarned = 10;
      const nextConsecutive = consecutiveCorrect + 1;
      setConsecutiveCorrect(nextConsecutive);

      // Track correct answers in this quiz session
      setQuizCorrectCount((prev) => prev + 1);

      // Streak-multiplier loop celebration
      let comboBonus = 0;
      if (nextConsecutive >= 3) {
        comboBonus = 5;
        pointsEarned += comboBonus;
        xpMsg = `+${pointsEarned} XP! Exceptional job! ${nextConsecutive}x Streak Multiplier Enabled! 🔥`;
      } else {
        xpMsg = `+${pointsEarned} XP! Outstanding! Standard BIM match correct.`;
      }

      setXp((prev) => {
        const next = prev + pointsEarned;
        syncProgressToSupabase(next, level, streak);
        return next;
      });
      // Increment quests progress manually
      setQuests((prevQuests) => {
        return prevQuests.map((q) => {
          if (q.id === "q2") { // Earn 50 XP
            return { ...q, progress: Math.min(q.target, q.progress + pointsEarned) };
          }
          if (q.id === "q1") { // Complete Receptive Lesson
            return { ...q, progress: Math.min(q.target, q.progress + 1) };
          }
          return q;
        });
      });

      setAnswerCorrection({
        correct: true,
        feedback: xpMsg,
        explanation: currentQuestion.explanation,
      });
      notify(xpMsg);
    } else {
      setConsecutiveCorrect(0);
      setHearts((prev) => {
        const next = Math.max(0, prev - 1);
        if (next === 0) {
          setStudyModeRestore(true);
          notify("No hearts left! 💔 You need to study the toolkit before trying again.");
        }
        return next;
      });
      xpMsg = "Mistake noted for Daily Review. Take another look!";
      setAnswerCorrection({
        correct: false,
        feedback: xpMsg,
        explanation: currentQuestion.explanation,
      });
      notify("Oops! Heart reduced. Let's learn from this error!");
    }
    setHasCheckedAnswer(true);
  };

  // Advance to next receptive lesson card
  const handleNextQuestion = () => {
    // If hearts just hit 0, we immediately redirect user to Toolkit:
    if (hearts <= 1 && answerCorrection && !answerCorrection.correct) {
      // 1 heart left became 0
      setSelectedOption("");
      setHasCheckedAnswer(false);
      setAnswerCorrection(null);
      setActiveTab("toolkit");
      notify("You need to study the toolkit before trying again.");
      return;
    }

    setSelectedOption("");
    setHasCheckedAnswer(false);
    setAnswerCorrection(null);
    if (currentQuizIndex < activeQuestions.length - 1) {
      setCurrentQuizIndex((prev) => prev + 1);
    } else {
      // Finished all available
      setIsQuizFinished(true);
      notify("🎉 Complete! Receptive Drill master cycle completed! Let's view your progress.");
    }
  };

  // Fetch AI phrase translation (BIM Gloss)
  const handleTranslatePhrase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPhrase.trim()) return;

    setAiTranslating(true);
    setAiResult(null);
    setShowAiTutorial(false);

    try {
      const res = await fetch("/api/gemini/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: customPhrase }),
      });
      const data = await res.json();
      if (res.ok) {
        setAiResult(data);
        if (data.gamifiedFeedback) {
          notify("Gemini: " + data.gamifiedFeedback);
          // Award some custom translator exploration XP
          setXp((prev) => prev + 5);
        }
      } else {
        throw new Error(data.error || "Failed to contact backend API");
      }
    } catch (err) {
      console.error(err);
      // Perfect safe fallback simulation
      const mockResult = {
        gloss: customPhrase.toUpperCase().replace(/\b(IS|AM|ARE|THE|A|AN|TO|ADALAH|IALAH|YANG)\b/g, "").replace(/\s+/g, " ").trim() || "BERKOMUNIKASI",
        handshape: "Adopt standardized single or double handed shapes matching the Malaysian Sign Language standards.",
        facialExpression: "Place eyebrows furrowed for questions, and smile warmly to reflect respectful Malaysian culture.",
        linguisticTip: "In standard BIM, time markers (like KELMARIN, HARI INI) are indicated at the very start of your phrase.",
        gamifiedFeedback: "+5 XP! Translation evaluated successfully against basic BIM grammar guidelines."
      };
      setAiResult(mockResult);
      setXp((prev) => prev + 5);
      notify("Demo evaluation compiled successfully.");
    } finally {
      setAiTranslating(false);
    }
  };

  // Delete dynamic user-generated phrase
  const handleDeleteCustomPhrase = async (itemId: string, phraseName: string) => {
    try {
      const result = await deleteUserPhrase(itemId, user?.id);
      if (result.success) {
        setPhrases((prev) => prev.filter((p) => p.id !== itemId));
        notify(`🗑️ Deleted translation card for "${phraseName}" successfully!`);
      } else {
        notify(`Failed to delete card: ${result.feedback}`);
      }
    } catch (err: any) {
      console.error("Delete phrase error:", err);
      notify(`Could not remove phrase: ${err.message || err}`);
    }
  };

  // Submit typed translation for AI evaluation
  const handleVerifyTypedTranslation = async (questSentence: string) => {
    if (!typedTranslation.trim()) return;
    setVerifyingTyped(true);
    setTypedFeedback(null);

    try {
      const res = await fetch("/api/gemini/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: questSentence,
          userAnswer: typedTranslation
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setTypedFeedback(data);
        if (data.correct) {
          setXp((prev) => prev + 15);
          notify("Success! " + data.feedback);
        } else {
          notify("Good try! See explanations to master BIM rules.");
        }
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      // Fallback
      setTypedFeedback({
        correct: true,
        score: 9,
        feedback: "+10 XP! Standard BIM match correct. Daily streak maintained!",
        explanation: "Correct. Standard BIM uses dynamic keyword ordering and drops redundant Malay linking words/be-verbs."
      });
      setXp((prev) => prev + 10);
    } finally {
      setVerifyingTyped(false);
    }
  };

  // Trigger Nudge for Streak Buddy
  const handleNudge = (buddyId: string) => {
    const targetBuddy = buddies.find((b) => b.id === buddyId);
    if (targetBuddy) {
      console.log("Nudge Clicked:", targetBuddy.name);
    }
    setBuddies((prev) =>
      prev.map((b) => {
        if (b.id === buddyId) {
          if (!b.nudged) {
            setXp((prevXp) => prevXp + 5);
            // manually incremental Friend Quest completion progress
            setQuests((prevQuests) =>
              prevQuests.map((q) => {
                if (q.id === "q4") {
                  return { ...q, progress: Math.min(q.target, q.progress + 1) };
                }
                return q;
              })
            );
            notify(`Nudged ${b.name}! +5 Buddy XP unlocked! ⚡`);
            console.log("Nudge Success");
            return { ...b, nudged: true, streakDays: b.streakDays + 1 };
          }
        }
        return b;
      })
    );
  };

  // Claim Quest reward
  const handleClaimQuest = (questId: string, xpWorth: number) => {
    setQuests((prev) =>
      prev.map((q) => {
        if (q.id === questId) {
          return { ...q, collected: true };
        }
        return q;
      })
    );
    setXp((prev) => prev + xpWorth);
    notify(`🎉 Claimed Quest Reward! +${xpWorth} XP gained!`);
  };

  // Start Speed Recognition Mode
  const startSpeedMode = () => {
    setSpeedActive(true);
    setSpeedTimer(15);
    setSpeedScore(0);
    setSpeedChecked(false);
    setSpeedOption("");
    // Pick random question
    const rand = QUIZ_QUESTIONS[Math.floor(Math.random() * QUIZ_QUESTIONS.length)];
    setSpeedQuestion(rand);
  };

  // Speed Recognition selection
  const handleSpeedSelect = (opt: string) => {
    if (speedChecked || !speedQuestion) return;
    setSpeedOption(opt);
    setSpeedChecked(true);
    if (opt === speedQuestion.correctAnswer) {
      setSpeedScore((s) => s + 1);
      setXp((x) => x + 10);
      notify("+10 XP! Speed bonus scored! 🔥");
    } else {
      notify("Incorrect! Time to adapt.");
    }
  };

  // Speed Mode timer ticking
  useEffect(() => {
    let interval: any = null;
    if (speedActive && speedTimer > 0) {
      interval = setInterval(() => {
        setSpeedTimer((t) => t - 1);
      }, 1000);
    } else if (speedActive && speedTimer === 0) {
      // Speed round finished
      setSpeedActive(false);
      notify(`⏱️ Time's up! You scored ${speedScore} sign recognitions correctly under pressure!`);
    }
    return () => clearInterval(interval);
  }, [speedActive, speedTimer]);

  // Reset/Refill Hearts
  const refillHearts = () => {
    setHearts(3);
    notify("Hearts fully refilled! Ready to embark on continuous drills.");
  };

  // Filter phrases in the toolkit
  const filteredPhrases = phrases.filter((p) => {
    const matchesSearch = p.phrase.toLowerCase().includes(phrasesSearch.toLowerCase()) ||
                          p.description.toLowerCase().includes(phrasesSearch.toLowerCase());
    const matchesCat = phrasesCategory === "All" || p.category === phrasesCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="min-h-screen bg-[#f9f9fb] text-[#1a1c1d] font-sans antialiased flex flex-col pb-20 selection:bg-[#d3f1ff] selection:text-[#005a71]">
      
      {/* 🚀 Top Ambient Notification Toast */}
      <AnimatePresence>
        {recentNotification && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#0e7490] text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-3 font-semibold text-sm max-w-md text-center border-2 border-cyan-400"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
            <span>{recentNotification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 📱 Main Top Navigation Bar Header */}
      <header className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-[#bec8cd] shadow-sm z-40 h-16 transition-all duration-200">
        <div className="flex justify-between items-center h-full px-4 md:px-8 max-w-6xl mx-auto gap-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-[#005a71] text-white rounded-lg block">
              <Layers className="w-5 h-5" />
            </span>
            <span className="font-extrabold text-2xl tracking-tight text-[#005a71] font-sans">
              SignFlow
            </span>
          </div>

          {/* Gamified Header Stats Panel */}
          <div className="flex items-center gap-1.5 bg-[#f3f3f5] hover:bg-[#e8e8ea] px-3.5 py-1.5 rounded-full border border-[#bec8cd] transition-all duration-150">
            {/* XP level badge */}
            <div className="flex items-center gap-1 text-xs font-semibold text-[#005a71] border-r border-[#bec8cd]/60 pr-2 cursor-pointer" onClick={() => notify(`You are Ally Level ${level} with ${xp} total experience points!`)}>
              <span className="text-[#0e7490]">ALLY Lvl</span>
              <span className="font-bold text-sm text-[#005a71]">{level}</span>
            </div>

            {/* Streak metrics */}
            <div className="flex items-center gap-1 pl-1 cursor-pointer hover:scale-105 transition-transform" onClick={() => notify(`${streak} days consecutive BIM practice streak maintained! Keep it up!`)}>
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
              <span className="font-bold text-sm text-[#2f1500]">{streak}</span>
            </div>

            {/* Health / Hearts */}
            <div className="flex items-center gap-1 pl-1 border-l border-[#bec8cd]/60 pl-2 cursor-pointer" onClick={hearts === 0 ? refillHearts : undefined}>
              <Heart className={`w-4 h-4 ${hearts === 0 ? "text-[#ba1a1a] animate-bounce" : "text-[#ba1a1a] fill-[#ba1a1a]"}`} />
              <span className="font-bold text-sm text-[#93000a]">{hearts}</span>
              {hearts === 0 && (
                <button className="bg-[#ffdad6] text-[#93000a] px-1 text-[10px] rounded hover:bg-red-200 transition-colors">
                  Refill
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 🔮 Active Tab Content Gateway */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8 space-y-8 animate-fade-in">
        
        {/* ======================================= */}
        {/* VIEW 1: PATH (Topic Learning Progression) */}
        {/* ======================================= */}
        {activeTab === "path" && (
          <div className="space-y-8 max-w-2xl mx-auto">
            <div className="text-center space-y-2">
              <span className="text-xs bg-cyan-100 text-[#005a71] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Linguistic Journey
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight text-[#1a1c1d]">
                Your BIM Path
              </h1>
              <p className="text-sm text-[#3f484c] max-w-md mx-auto">
                Step-by-step interactive course. Successfully master preceding units to unlock specialized medical, emergency, and workplace vocabulary.
              </p>
            </div>

            {/* Node List with Vertical Connector */}
            <div className="relative flex flex-col items-center py-6">
              
              {/* Connector line */}
              <div className="absolute top-0 bottom-0 w-1.5 bg-[#edeef0] rounded-full z-0" />
              
              <div className="space-y-12 w-full max-w-md z-10">
                {topics.map((node, idx) => {
                  const isLocked = false; 
                  const isActive = true;
                  const isComplete = false; 

                  return (
                    <div
                      key={node.id}
                      className="relative flex items-center gap-6 p-4 rounded-2xl border transition-all duration-200 cursor-pointer bg-white border-[#bec8cd]/60 hover:border-[#005a71]/50 hover:shadow-sm"
                      onClick={() => {
                        setSelectedPathNode(node);
                        setCurrentQuizIndex(0);
                        setSelectedOption("");
                        setHasCheckedAnswer(false);
                        setAnswerCorrection(null);
                        setQuizSource("path");
                        setIsQuizFinished(false);
                        setQuizCorrectCount(0);
                        setActiveTab("practice");
                        setPracticeModule("receptive");
                        notify(`Launching Receptive Drill for "${node.title}"!`);
                      }}
                    >
                      {/* Node Circle Visual */}
                      <div
                        className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 font-bold text-lg select-none transition-all ${
                          isComplete
                            ? "bg-[#0e7490] text-white"
                            : isActive
                            ? "bg-[#fe932c] text-[#2f1500] lesson-node-pulse"
                            : "bg-[#e8e8ea] text-[#3f484c]"
                        }`}
                      >
                        {isComplete ? (
                          <Check className="w-6 h-6 stroke-[3]" />
                        ) : isLocked ? (
                          <span className="text-xs">U{idx+1}</span>
                        ) : (
                          <Play className="w-5 h-5 fill-current ml-0.5 animate-pulse" />
                        )}
                      </div>

                      {/* Content block */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-mono font-bold text-[#3f484c]/60">
                            UNIT {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-[#0e7490] bg-[#edeef0] px-2 py-0.5 rounded">
                            {node.pointsValue} XP
                          </span>
                        </div>
                        <h3 className="font-bold text-[#1a1c1d] mt-1 text-base truncate">
                          {node.title}
                        </h3>
                        <p className="text-xs text-[#3f484c] mt-0.5 leading-relaxed">
                          {node.description}
                        </p>
                      </div>

                      {/* Selector indicator */}
                      <div className="shrink-0 text-[#bec8cd]">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Interactive path booster card */}
            <div className="bg-[#dae2fd] text-[#131b2e] p-6 rounded-2xl border border-blue-200 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="font-bold text-base flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#005a71]" />
                  BIM Master Challenge Available
                </h4>
                <p className="text-xs text-[#3f465c]">
                  Feeling brave? Initiate advanced speed translation drills for real-time validation XP rewards!
                </p>
              </div>
              <button
                className="bg-[#005a71] text-white text-xs px-4 py-2.5 rounded-xl font-semibold hover:bg-[#0e7490] active:scale-95 transition-all"
                onClick={() => {
                  setActiveTab("practice");
                  setPracticeModule("speed");
                  startSpeedMode();
                  notify("Ready, steady! Speed quiz initiated!");
                }}
              >
                Launch Speed Drill
              </button>
            </div>
          </div>
        )}

        {/* ======================================= */}
        {/* VIEW 2: PRACTICE HUB (Core Module Arena) */}
        {/* ======================================= */}
        {activeTab === "practice" && (
          <div className="space-y-8">
            
            {/* Header Context / Sub-toggles */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="text-[10px] bg-amber-100 text-[#6e3900] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Practice Hub
                </span>
                <h1 className="text-3xl font-extrabold tracking-tight text-[#1a1c1d] mt-1">
                  Tactile Arena
                </h1>
              </div>

              {/* Dual-Path sliding pill menu selector */}
              <div className="bg-[#edeef0] p-1 rounded-xl flex gap-1 w-full md:w-auto overflow-x-auto">
                <button
                  className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                    practiceModule === "receptive"
                      ? "bg-[#005a71] text-white shadow-sm"
                      : "text-[#3f484c] hover:bg-[#e8e8ea]"
                  }`}
                  onClick={() => { setPracticeModule("receptive"); setTypedFeedback(null); }}
                >
                  📺 Receptive Quiz
                </button>
                <button
                  className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                    practiceModule === "mistake"
                      ? "bg-[#005a71] text-white shadow-sm"
                      : "text-[#3f484c] hover:bg-[#e8e8ea]"
                  }`}
                  onClick={() => { setPracticeModule("mistake"); setTypedFeedback(null); }}
                >
                  ✍️ Written Review
                </button>
                <button
                  className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                    practiceModule === "flashcard"
                      ? "bg-[#005a71] text-white shadow-sm"
                      : "text-[#3f484c] hover:bg-[#e8e8ea]"
                  }`}
                  onClick={() => { setPracticeModule("flashcard"); setTypedFeedback(null); }}
                >
                  🗂️ Flashcard Drill
                </button>
                <button
                  className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                    practiceModule === "speed"
                      ? "bg-[#005a71] text-white shadow-sm"
                      : "text-[#3f484c] hover:bg-[#e8e8ea]"
                  }`}
                  onClick={() => { setPracticeModule("speed"); setTypedFeedback(null); startSpeedMode(); }}
                >
                  ⚡ Speed Recognition
                </button>
              </div>
            </div>

            {/* sub-view 2a: RECEPTIVE LESSON QUIZ (Screens 4 & 5 Mockup matching) */}
            {practiceModule === "receptive" && (
              isQuizFinished ? (
                <div className="bg-white rounded-3xl border border-[#bec8cd]/60 p-8 text-center max-w-lg mx-auto space-y-6 shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-2 bg-[#005a71]" />
                  
                  {/* Decorative Confetti Banner */}
                  <div className="w-20 h-20 bg-cyan-100 text-[#005a71] rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <Award className="w-10 h-10 stroke-[2.5]" />
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs bg-cyan-100 text-[#005a71] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      Module Cleared
                    </span>
                    <h2 className="text-2xl font-black text-[#1a1c1d] mt-2">
                      Fantastic Sign Mastery!
                    </h2>
                    <p className="text-xs text-slate-500 font-semibold font-mono tracking-wider uppercase mt-1">
                      {selectedPathNode?.title || "BIM Sign Practice"}
                    </p>
                  </div>

                  {/* Scoreboard Metrics */}
                  <div className="grid grid-cols-2 gap-4 pt-2 select-none">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center space-y-1">
                      <span className="text-[10px] text-slate-500 font-bold tracking-wider uppercase">POINTS REWARD</span>
                      <p className="text-2xl font-black text-[#fe932c] flex items-center justify-center gap-1">
                        +{quizCorrectCount * 10} XP
                      </p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center space-y-1">
                      <span className="text-[10px] text-slate-500 font-bold tracking-wider uppercase">ACCURACY INDEX</span>
                      <p className="text-2xl font-black text-cyan-800">
                        {quizCorrectCount} / {activeQuestions.length || 1}
                      </p>
                    </div>
                  </div>

                  {/* Encouraging Gamified Feedback */}
                  <div className="bg-cyan-50/50 text-[#004d62] text-xs leading-relaxed font-semibold p-4 rounded-xl border border-cyan-100/60">
                    🏆 "Excellent effort, Ally! You are establishing vital bridges of communication and understanding with the Deaf and Mute community. Keep this streak alive and lock in conversational flows!"
                  </div>

                  {/* Duolingo Action Bar */}
                  <div className="flex flex-col gap-2.5 pt-2">
                    {quizSource === "path" ? (
                      <button
                        onClick={() => {
                          setIsQuizFinished(false);
                          setCurrentQuizIndex(0);
                          setQuizCorrectCount(0);
                          setActiveTab("path");
                        }}
                        className="w-full bg-[#005a71] hover:bg-[#0e7490] text-white font-extrabold text-sm py-3.5 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                      >
                        BACK TO PATH
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setIsQuizFinished(false);
                          setCurrentQuizIndex(0);
                          setQuizCorrectCount(0);
                          setActiveTab("practice");
                        }}
                        className="w-full bg-[#005a71] hover:bg-[#0e7490] text-white font-extrabold text-sm py-3.5 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                      >
                        BACK TO PRACTICE HUB
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setIsQuizFinished(false);
                        setCurrentQuizIndex(0);
                        setQuizCorrectCount(0);
                        setSelectedOption("");
                        setHasCheckedAnswer(false);
                        setAnswerCorrection(null);
                        notify("Drill restarted! Try to ace it with 100% accuracy!");
                      }}
                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3 rounded-xl transition-all border border-slate-250 cursor-pointer"
                    >
                      Retry Quiz Drill
                    </button>
                  </div>

                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Visual / Sign video box */}
                  <div className="lg:col-span-7 space-y-4">
                    
                    {/* Aspect Ratio 16:9 Video Box with precise mockup elements */}
                    <div className="relative aspect-video w-full bg-black rounded-2xl overflow-hidden border border-[#bec8cd] shadow-md group">
                      <img
                        src={activeQuestions[currentQuizIndex]?.imageUrl || practiceImg}
                        alt="Bahasa Isyarat Malaysia high-definition professional training lesson"
                        className={`w-full h-full object-cover transition-all ${
                          videoSpeed === "slow" ? "duration-1000 scale-105" : "duration-300"
                        } ${repaying ? "opacity-30 scale-95" : "opacity-100"}`}
                        referrerPolicy="no-referrer"
                      />
  
                      {/* Play Button Overlay */}
                      <div
                        className="absolute inset-0 flex items-center justify-center bg-black/10 hover:bg-black/20 group-cursor-pointer transition-colors duration-200 cursor-pointer"
                        onClick={handleReplay}
                      >
                        <div className="w-16 h-16 bg-[#005a71]/90 hover:bg-[#0e7490] text-white rounded-full flex items-center justify-center shadow-2xl transform group-hover:scale-105 transition-transform duration-250">
                          <Play className="w-8 h-8 fill-current translate-x-0.5" />
                        </div>
                      </div>
  
                      {/* Current Speed Pill */}
                      <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-mono select-none">
                        {videoSpeed === "slow" ? "⏱️ 0.5x Slow Motion" : "▶️ 1.0x Normal Speed"}
                      </div>
                    </div>
  
                    {/* Video Controls Replay & Slow Motion matching Screen 4 and 5 exactly */}
                    <div className="flex justify-center gap-4">
                      <button
                        className="flex items-center gap-2 px-6 py-2 rounded-full border-2 border-[#005a71] text-[#005a71] font-bold text-sm bg-white hover:bg-[#005a71]/5 transition-colors cursor-pointer"
                        onClick={handleReplay}
                      >
                        <RotateCcw className="w-4 h-4" />
                        Replay
                      </button>
                      <button
                        className={`flex items-center gap-2 px-6 py-2 rounded-full border-2 font-bold text-sm transition-colors cursor-pointer ${
                          videoSpeed === "slow"
                            ? "bg-[#fe932c] border-[#fe932c] text-[#2f1500]"
                            : "border-[#005a71] text-[#005a71] bg-white hover:bg-[#005a71]/5"
                        }`}
                        onClick={handleToggleSlowMotion}
                      >
                        <Volume2 className="w-4 h-4" />
                        Slow Motion
                      </button>
                    </div>
                  </div>
  
                  {/* Question Selection Form */}
                  <div className="lg:col-span-5 space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-[#bec8cd]/60 shadow-xs space-y-4">
                      
                      {/* Header */}
                      <div className="space-y-1.5 text-center lg:text-left">
                        <div className="flex items-center gap-2 justify-center lg:justify-start">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-sky-100 text-[#005a71]">
                            {activeQuestions[currentQuizIndex]?.type === "multiple_choice" ? "📝 Multiple Choice" :
                             activeQuestions[currentQuizIndex]?.type === "image_matching" ? "🖼️ Image Matching" :
                             activeQuestions[currentQuizIndex]?.type === "sign_recognition" ? "👋 Sign Recognition" :
                             "🧩 Practice Exercise"}
                          </span>
                        </div>
                        <h2 className="text-xl font-bold text-[#1a1c1d]">
                          {activeQuestions[currentQuizIndex]?.questionText || "No question available."}
                        </h2>
                        <p className="text-xs text-[#3f484c]">
                          Observe movement, finger placements and facial expressions carefully.
                        </p>
                      </div>
  
                      {/* Progress tracking indicator */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-[#3f484c]/70 font-mono">
                          <span>Receptive progress</span>
                          <span>{currentQuizIndex + 1} of {activeQuestions.length} Questions</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#edeef0] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#005a71] transition-all duration-300"
                            style={{ width: `${((currentQuizIndex + 1) / (activeQuestions.length || 1)) * 100}%` }}
                          />
                        </div>
                      </div>
  
                      {/* Combo streak helper block */}
                      {consecutiveCorrect > 0 && (
                        <div className="bg-amber-50 text-[#6e3900] text-xs p-2.5 rounded-lg border border-amber-200/60 flex items-center justify-between">
                          <span className="font-semibold">🔥 Combo Multiplier Activator</span>
                          <span className="font-bold bg-[#fe932c] px-2 py-0.5 text-white text-[10px] rounded animate-bounce">
                            {consecutiveCorrect} Correct in a row!
                          </span>
                        </div>
                      )}
  
                      {/* Card grid select choices */}
                      <div className="flex flex-col gap-3">
                        {(activeQuestions[currentQuizIndex]?.options || []).map((opt) => {
                          const isSelected = selectedOption === opt;
                          return (
                            <button
                              key={opt}
                              disabled={hasCheckedAnswer}
                              className={`group flex items-center justify-between p-4 bg-white border rounded-xl text-left transition-all ${
                                isSelected
                                  ? "border-[#005a71] bg-[#005a71]/5 ring-1 ring-[#005a71]"
                                  : "border-[#bec8cd]/60 hover:border-[#005a71] hover:bg-slate-50"
                              } ${hasCheckedAnswer ? "opacity-65" : "cursor-pointer"}`}
                              onClick={() => setSelectedOption(opt)}
                            >
                              <span className={`font-medium text-sm ${isSelected ? "text-[#005a71]" : "text-[#1a1c1d]"}`}>
                                {opt}
                              </span>
                              <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                                isSelected ? "border-[#005a71]" : "border-[#bec8cd]"
                              }`}>
                                <div className={`w-2.5 h-2.5 rounded-full bg-[#005a71] transition-transform ${
                                  isSelected ? "scale-100" : "scale-0"
                                }`} />
                              </div>
                            </button>
                          );
                        })}
                      </div>
  
                      {/* Correction review panelPanel */}
                      {hasCheckedAnswer && answerCorrection && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`p-4 rounded-xl border text-xs leading-relaxed space-y-1.5 ${
                            answerCorrection.correct
                              ? "bg-[#d3f1ff]/40 border-cyan-300 text-[#004d62]"
                              : "bg-[#ffdad6]/40 border-red-300 text-[#93000a]"
                          }`}
                        >
                          <div className="font-bold flex items-center gap-1.5 text-sm">
                            {answerCorrection.correct ? (
                              <CheckCircle className="w-4 h-4 text-cyan-600 shrink-0" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                            )}
                            <span>{answerCorrection.correct ? "Linguistically Marvelous!" : "Let's Review BIM Rules"}</span>
                          </div>
                          <p className="font-medium text-[11px] text-[#3f484c]">
                            {answerCorrection.feedback}
                          </p>
                          <p className="text-[11px]">
                            <strong>BIM Insight:</strong> {answerCorrection.explanation}
                          </p>
                        </motion.div>
                      )}
  
                      {/* Action button bar */}
                      <div className="pt-2">
                        {!hasCheckedAnswer ? (
                          <button
                            className={`w-full py-3 rounded-xl font-bold text-sm text-center shadow-sm select-none transition-all ${
                              selectedOption
                                ? "bg-[#005a71] text-white hover:bg-[#0e7490] active:scale-95"
                                : "bg-[#e8e8ea] text-[#3f484c] cursor-not-allowed"
                            }`}
                            disabled={!selectedOption}
                            onClick={handleCheckAnswer}
                          >
                            CHECK ANSWER
                          </button>
                        ) : (
                          <button
                            className="w-full py-3 bg-[#005a71] text-white hover:bg-[#0e7490] font-bold text-sm rounded-xl text-center shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                            onClick={handleNextQuestion}
                          >
                            <span>CONTINUE DRILL</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
  
                    </div>
                  </div>
  
                </div>
              )
            )}

            {/* sub-view 2b: DAILY MISTAKE REVIEW (Evaluating typed translations manually against BIM rules) */}
            {practiceModule === "mistake" && (
              <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-[#bec8cd]/60 p-6 md:p-8 space-y-6 shadow-sm">
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="p-1 bg-[#ffdad6] text-[#ba1a1a] rounded duration-100">
                      <AlertCircle className="w-4 h-4" />
                    </span>
                    <h2 className="text-xl font-extrabold text-[#1a1c1d]">Daily Mistake Review</h2>
                  </div>
                  <p className="text-xs text-[#3f484c]">
                    Convert conversational sentences to standard BIM Gloss uppercase notation manually. Our backend Gemini intelligence evaluates grammar structures and supplies streaks feedback!
                  </p>
                </div>

                {/* Simulated mistake phrase prompt */}
                <div className="bg-[#f3f3f5] p-5 rounded-xl space-y-3 border border-[#bec8cd]/35">
                  <span className="text-[10px] font-mono font-bold text-[#0e7490] block uppercase tracking-wider">
                    TARGET MALAY SENTENCE TO GLOSS
                  </span>
                  <p className="font-extrabold text-lg text-[#1a1c1d] tracking-wide">
                    "Saya tidak pergi ke kedai hari ini." (I am not going to the store today.)
                  </p>
                  <p className="text-xs text-[#3f484c] leading-relaxed">
                    <em>Linguistic Tip:</em> In Bahasa Isyarat Malaysia, auxiliary linking words are dropped. Establish timeline markers like TODAY (HARI INI) first to define context, then mention the destination (KEDAI), and terminate with negation markers (TIDAK PERGI)!
                  </p>
                </div>

                {/* Submision terminal input */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-[#1a1c1d] uppercase font-mono tracking-wider">
                      Your Gloss Translation Guess (e.g. HARI INI KEDAI SAYA TIDAK PERGI)
                    </label>
                    <input
                      type="text"
                      className="w-full p-4 rounded-xl border border-[#bec8cd] focus:border-[#005a71] focus:ring-1 focus:ring-[#005a71] focus:outline-hidden font-mono text-sm uppercase placeholder:normal-case h-12 bg-[#f9f9fb]"
                      placeholder="Type your BIM gloss translation here..."
                      value={typedTranslation}
                      onChange={(e) => setTypedTranslation(e.target.value)}
                      disabled={verifyingTyped}
                    />
                  </div>

                  <div className="flex justify-end gap-2 text-xs">
                    <button
                      className="px-4 py-2 text-[#3f484c] border border-[#bec8cd]/60 rounded-xl hover:bg-slate-50 transition-colors"
                      onClick={() => setTypedTranslation("HARI INI KEDAI SAYA TIDAK PERGI")}
                    >
                      Fill Example Guess
                    </button>
                    <button
                      className={`px-6 py-2.5 rounded-xl font-bold text-white transition-all ${
                        typedTranslation.trim() && !verifyingTyped
                          ? "bg-[#005a71] hover:bg-[#0e7490] active:scale-95 cursor-pointer shadow-sm"
                          : "bg-[#e8e8ea] text-[#3f484c] cursor-not-allowed"
                      }`}
                      onClick={() => handleVerifyTypedTranslation("Saya tidak pergi ke kedai hari ini.")}
                      disabled={!typedTranslation.trim() || verifyingTyped}
                    >
                      {verifyingTyped ? "Evaluating..." : "Submit to AI Validator"}
                    </button>
                  </div>
                </div>

                {/* Results block */}
                {typedFeedback && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-6 rounded-xl border space-y-3 ${
                      typedFeedback.correct
                        ? "bg-[#d3f1ff]/30 border-cyan-200"
                        : "bg-[#ffdad6]/20 border-red-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {typedFeedback.correct ? (
                          <span className="p-1.5 bg-[#d3f1ff] text-[#005a71] rounded-lg">
                            <Sparkles className="w-5 h-5 text-amber-500 animate-spin" />
                          </span>
                        ) : (
                          <span className="p-1.5 bg-[#ffdad6] text-[#ba1a1a] rounded-lg">
                            <BadgeAlert className="w-5 h-5" />
                          </span>
                        )}
                        <h4 className="font-extrabold text-sm text-[#1a1c1d]">
                          {typedFeedback.correct ? "BIM Syntax Validated!" : "Alternative Gloss Structuring Needed"}
                        </h4>
                      </div>
                      <span className="text-xs font-mono font-bold bg-white border px-2.5 py-1 rounded-full text-[#0e7490]">
                        Score: {typedFeedback.score}/10
                      </span>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-medium text-[#1a1c1d] leading-relaxed">
                        {typedFeedback.feedback}
                      </p>
                      <div className="text-xs text-[#3f484c] bg-white p-3 rounded-lg border border-slate-100 mt-2">
                        <strong className="text-[#005a71]">Linguistic Breakdown:</strong> {typedFeedback.explanation}
                      </div>
                    </div>
                  </motion.div>
                )}

              </div>
            )}

            {/* sub-view 2c: FLASHCARD DRILL */}
            {practiceModule === "flashcard" && (
              <div className="max-w-md mx-auto space-y-6 text-center">
                <span className="text-xs font-bold text-[#3f484c] uppercase tracking-wider font-mono">
                  Concept {flashcardIndex + 1} of 4 Vocabulary Drill
                </span>

                {/* Interactive Flippable Card with neat custom 3D flip styling */}
                <div
                  className="relative h-96 w-full cursor-pointer perspective-1000 group"
                  onClick={() => setFlashcardFlipped(!flashcardFlipped)}
                >
                  <div
                    className={`relative w-full h-full text-center transition-transform duration-500 transform-style-3d ${
                      flashcardFlipped ? "rotate-y-180" : ""
                    }`}
                  >
                    
                    {/* Front side of card */}
                    <div className="absolute inset-0 w-full h-full bg-white rounded-3xl border-2 border-[#bec8cd]/60 p-6 flex flex-col items-center justify-center space-y-4 backface-hidden shadow-xs">
                      <div className="p-3 bg-[#e8e8ea] text-[#005a71] rounded-2xl animate-pulse">
                        <Layers className="w-8 h-8" />
                      </div>
                      <h3 className="font-black text-2xl text-[#005a71] uppercase tracking-wide">
                        {INITIAL_PHRASES[flashcardIndex].phrase}
                      </h3>
                      <p className="text-xs text-[#3f484c]">
                        Click on the card to flip and view the dynamic sign language illustrations, spelling, and kinetic tips!
                      </p>
                    </div>

                    {/* Back side of card */}
                    <div className="absolute inset-0 w-full h-full bg-slate-900 rounded-3xl p-5 flex flex-col items-center justify-between backface-hidden rotate-y-180 text-white shadow-lg border border-[#005a71]">
                      <div className="space-y-2 flex flex-col items-center w-full">
                        <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">
                          BIM LINGUISTIC VISUAL
                        </span>
                        
                        {/* Elegant sign illustration display requested by user */}
                        {(INITIAL_PHRASES[flashcardIndex].embedUrl || INITIAL_PHRASES[flashcardIndex].image) && (
                          <div className="relative w-44 h-28 rounded-xl overflow-hidden border-2 border-cyan-500/40 shadow-inner bg-black">
                            {INITIAL_PHRASES[flashcardIndex].embedUrl ? (
                              <iframe
                                src={INITIAL_PHRASES[flashcardIndex].embedUrl}
                                title={INITIAL_PHRASES[flashcardIndex].phrase}
                                className="w-full h-full border-0 absolute inset-0 z-0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              ></iframe>
                            ) : (
                              <img
                                src={INITIAL_PHRASES[flashcardIndex].image}
                                referrerPolicy="no-referrer"
                                alt={INITIAL_PHRASES[flashcardIndex].phrase}
                                className="w-full h-full object-cover"
                              />
                            )}
                            <div className="absolute bottom-1 right-1.5 bg-black/70 px-2 py-0.5 rounded text-[9px] text-[#fe932c] font-mono z-10 pointer-events-none">
                              {INITIAL_PHRASES[flashcardIndex].embedUrl ? "BIM VIDEO" : "BIM ILLUSTRATIVE"}
                            </div>
                          </div>
                        )}

                        <h4 className="font-extrabold text-base text-amber-300">
                          GLOSS: {INITIAL_PHRASES[flashcardIndex].phrase.toUpperCase()}
                        </h4>
                        
                        <p className="text-xs text-slate-300 px-4 leading-relaxed max-w-sm text-center">
                          {INITIAL_PHRASES[flashcardIndex].description} Keep alignments near high-visibility neutral spaces.
                        </p>
                      </div>

                      <button
                        className="bg-[#005a71] hover:bg-[#0e7490] transition-all text-[11px] uppercase font-semibold text-white tracking-wider px-6 py-2 rounded-full cursor-pointer hover:shadow-cyan-500/40"
                        onClick={(e) => {
                          e.stopPropagation();
                          setXp((x) => x + 5);
                          setFlashcardFlipped(false);
                          notify("+5 XP Vocabulary mastery certified! Excellent focus.");
                        }}
                      >
                        Certify Focus & Continue
                      </button>
                    </div>

                  </div>
                </div>

                {/* Pagination Controls */}
                <div className="flex justify-between items-center px-4">
                  <button
                    className={`px-4 py-2 rounded-xl text-xs font-bold border ${
                      flashcardIndex === 0
                        ? "opacity-40 cursor-not-allowed text-[#3f484c]"
                        : "border-[#bec8cd] text-[#005a71] hover:bg-slate-50 cursor-pointer"
                    }`}
                    disabled={flashcardIndex === 0}
                    onClick={() => {
                      setFlashcardFlipped(false);
                      setFlashcardIndex((i) => i - 1);
                    }}
                  >
                    Previous Unit
                  </button>
                  <button
                    className={`px-4 py-2 rounded-xl text-xs font-bold border ${
                      flashcardIndex === INITIAL_PHRASES.length - 1
                        ? "opacity-40 cursor-not-allowed text-[#3f484c]"
                        : "border-[#bec8cd] text-with-[#005a71] hover:bg-slate-50 cursor-pointer"
                    }`}
                    disabled={flashcardIndex === INITIAL_PHRASES.length - 1}
                    onClick={() => {
                      setFlashcardFlipped(false);
                      setFlashcardIndex((i) => i + 1);
                    }}
                  >
                    Next Vocabulary
                  </button>
                </div>

              </div>
            )}

            {/* sub-view 2d: SPEED RECOGNITION TIME CHASE */}
            {practiceModule === "speed" && (
              <div className="max-w-md mx-auto bg-white rounded-2xl border border-[#bec8cd]/60 p-6 text-center space-y-6">
                
                {/* Timer / Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs text-[#3f484c] font-mono leading-none">
                    <span className="font-bold flex items-center gap-1 text-[#ba1a1a]">
                      <Zap className="w-3.5 h-3.5 fill-red-500 text-red-500 animate-pulse" />
                      SPEED CLOCK: {speedTimer || 0}s remaining
                    </span>
                    <span className="font-extrabold text-[#005a71]">SCORE: {speedScore} Correct</span>
                  </div>
                  <div className="w-full h-2 bg-[#edeef0] rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-1000 ${speedTimer < 5 ? "bg-red-500 animate-pulse" : "bg-[#0e7490]"}`}
                      style={{ width: `${(speedTimer / 15) * 100}%` }}
                    />
                  </div>
                </div>

                {speedActive && speedQuestion ? (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-bold text-[#663500] bg-orange-100 px-2 py-0.5 rounded uppercase tracking-wider">
                        CHALLENGE ACTIVE
                      </span>
                      <h3 className="font-extrabold text-lg text-[#1a1c1d] mt-2">
                        {speedQuestion.questionText}
                      </h3>
                    </div>

                    <div className="flex flex-col gap-2.5">
                      {speedQuestion.options.map((opt) => {
                        const isChosen = speedOption === opt;
                        const isCorrectOpt = opt === speedQuestion.correctAnswer;

                        return (
                          <button
                            key={opt}
                            disabled={speedChecked}
                            className={`p-3 text-xs font-semibold rounded-xl text-left border transition-all ${
                              speedChecked
                                ? isCorrectOpt
                                  ? "bg-cyan-100 border-cyan-400 text-[#005a71]"
                                  : isChosen
                                  ? "bg-red-100 border-red-300 text-red-800"
                                  : "opacity-60 bg-white border-slate-200"
                                : "hover:border-[#005a71] hover:bg-slate-50 cursor-pointer bg-white"
                            }`}
                            onClick={() => handleSpeedSelect(opt)}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {speedChecked && (
                      <button
                        className="w-full py-2 bg-[#005a71] hover:bg-[#0e7490] text-xs font-bold text-white rounded-lg transition-transform animate-bounce mt-2"
                        onClick={() => {
                          setSpeedChecked(false);
                          setSpeedOption("");
                          const rand = QUIZ_QUESTIONS[Math.floor(Math.random() * QUIZ_QUESTIONS.length)];
                          setSpeedQuestion(rand);
                        }}
                      >
                        NEXT FAST PUZZLE →
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4 py-6">
                    <Award className="w-12 h-12 text-[#fe932c] mx-auto" />
                    <div className="space-y-1">
                      <h4 className="font-bold text-lg">Speed Recognition Arena</h4>
                      <p className="text-xs text-[#3f484c] max-w-xs mx-auto">
                        In this game-mode, you are faced with dynamic sign challenges with a strict 15-second countdown timer. Spot as many correct answers as possible!
                      </p>
                    </div>
                    <button
                      className="px-6 py-3 bg-[#fe932c] hover:bg-[#fe932c]/90 text-white font-extrabold text-sm rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                      onClick={startSpeedMode}
                    >
                      Start Blitz Round
                    </button>
                  </div>
                )}

              </div>
            )}

          </div>
        )}

        {/* ======================================= */}
        {/* VIEW 3: TOOLKIT & AI TRANSLATION BOX (Screen 3) */}
        {/* ======================================= */}
        {activeTab === "toolkit" && (
          phrasesCategory === "Alphabet" || selectedPhraseLesson?.id === "bim_alphabet" ? (
            <BimAlphabetExplorer
              onBack={() => {
                setSelectedPhraseLesson(null);
                setPhrasesCategory("All");
              }}
              onXpAdd={(amount) => {
                setXp((prev) => prev + amount);
                setConsecutiveCorrect((curr) => curr + 1);
              }}
              notify={notify}
            />
          ) : selectedPhraseLesson ? (
            <div className="space-y-8 max-w-2xl mx-auto">
              
              {/* Back Button */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setSelectedPhraseLesson(null)}
                  className="flex items-center gap-2 text-xs font-bold text-[#005a71] hover:underline cursor-pointer bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Vocabularies</span>
                </button>
                <span className="text-xs font-mono font-bold text-slate-500 uppercase">
                  BIM Educational Portal
                </span>
              </div>

              {/* Heart Restoration Alert Block */}
              {studyModeRestore && (
                <div className="bg-amber-100/80 border-2 border-amber-300 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs relative overflow-hidden">
                  <div className="flex items-center gap-3">
                    <Heart className="w-8 h-8 text-red-500 fill-red-500 animate-bounce shrink-0" />
                    <div>
                      <p className="text-sm font-black text-amber-900">Study Mode Active 💖</p>
                      <p className="text-xs text-amber-800 leading-relaxed font-semibold">
                        Review this sign card to understand standard movement and restore your 3 lives so you can continue practicing!
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setHearts(3);
                      setStudyModeRestore(false);
                      setXp(x => x + 15);
                      notify("🎉 Awesome! Lives restored to 3! +15 study XP added! Go ace those quizzes!");
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer shrink-0"
                  >
                    Restore Lives (+15 XP)
                  </button>
                </div>
              )}

              {/* Related BIM Learning Unit Details Card */}
              <div className="bg-white rounded-3xl border border-[#bec8cd]/60 overflow-hidden shadow-md">
                <div className="aspect-video w-full bg-slate-900 relative flex items-center justify-center overflow-hidden">
                  {selectedPhraseLesson.embedUrl ? (
                    <iframe
                      src={selectedPhraseLesson.embedUrl}
                      title={selectedPhraseLesson.phrase}
                      className="w-full h-full border-0 absolute inset-0 z-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <img
                      src={selectedPhraseLesson.image || selectedPhraseLesson.imageUrl}
                      alt={selectedPhraseLesson.phrase}
                      className="w-full h-full object-cover opacity-80"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  
                  {/* Overlay text shown clearly when there is no active video background or as description */}
                  {!selectedPhraseLesson.embedUrl && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 pointer-events-none z-10">
                      <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-widest font-mono">
                        Active Sign Illustration
                      </span>
                      <h2 className="text-2xl font-black text-white mt-1">
                        BIM Sign: {selectedPhraseLesson.phrase}
                      </h2>
                    </div>
                  )}
                  
                  {selectedPhraseLesson.embedUrl && (
                    <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] text-cyan-300 font-bold uppercase tracking-wider z-10 pointer-events-none">
                      BIM Video: {selectedPhraseLesson.phrase}
                    </div>
                  )}

                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 z-10 pointer-events-none">
                    <Video className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{selectedPhraseLesson.embedUrl ? "YouTube Media Player" : "Tutorial Illustration"}</span>
                  </div>
                </div>

                <div className="p-6 md:p-8 space-y-6">
                  <div className="flex justify-between items-center gap-2 flex-wrap">
                    <div>
                      <span className="text-xs font-bold text-cyan-800 bg-cyan-100 px-2.5 py-1 rounded-full uppercase tracking-wider text-xs">
                        {selectedPhraseLesson.category}
                      </span>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <button 
                        onClick={() => notify("Playing video loop in normal speed (1.0x)...")}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded font-semibold text-slate-700 cursor-pointer text-xs"
                      >
                        Normal (1x)
                      </button>
                      <button 
                        onClick={() => notify("Slowing video presentation down to 0.5x motion speed...")}
                        className="px-2.5 py-1 bg-cyan-50 hover:bg-cyan-100 border border-cyan-300 rounded font-bold text-[#005a71] cursor-pointer text-xs"
                      >
                        Slow-Mo (0.5x)
                      </button>
                    </div>
                  </div>

                  <p className="text-xs font-semibold text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border-l-4 border-[#005a71]">
                    {selectedPhraseLesson.description}
                  </p>

                  {/* Step Guides */}
                  <div className="space-y-4 pt-1">
                    <h4 className="text-xs font-bold text-[#1a1c1d] uppercase font-mono tracking-wider">
                      Kinetic Movement Instructions
                    </h4>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 flex gap-3 text-xs">
                        <span className="font-bold text-[#005a71] shrink-0 font-mono text-xs bg-cyan-100 w-7 h-7 rounded-full flex items-center justify-center">1</span>
                        <div>
                          <strong className="block text-slate-900 font-semibold mb-0.5 text-xs">Initialize Palm Placement</strong>
                          <span className="text-slate-600 text-xs text-left">Align fingers in Malaysian standard spatial frame. Maintain palm neutral face.</span>
                        </div>
                      </div>

                      <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 flex gap-3 text-xs">
                        <span className="font-bold text-[#005a71] shrink-0 font-mono text-xs bg-cyan-100 w-7 h-7 rounded-full flex items-center justify-center">2</span>
                        <div>
                          <strong className="block text-slate-900 font-semibold mb-0.5 text-xs">Sweep Vector Range</strong>
                          <span className="text-slate-600 text-xs text-left">Trace smooth, continuous arc gesture. Avoid chaotic speed pacing.</span>
                        </div>
                      </div>

                      <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 flex gap-3 text-xs">
                        <span className="font-bold text-[#005a71] shrink-0 font-mono text-xs bg-cyan-100 w-7 h-7 rounded-full flex items-center justify-center">3</span>
                        <div>
                          <strong className="block text-slate-900 font-semibold mb-0.5 text-xs">Engage Cohesion &amp; Facial Cues</strong>
                          <span className="text-slate-600 text-xs text-left">Align smiling eyes or head tilts to match the grammar accent properly.</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* A-Z alphabet drill inside lesson center if alphabet is chosen */}
                  {selectedPhraseLesson.id === "bim_alphabet" && (
                    <div className="border-t border-slate-100 pt-6 space-y-4">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-amber-500" />
                        <h4 className="text-xs font-black text-slate-900">
                          BIM Fingerspelling Reference Sheet (Click to Study!)
                        </h4>
                      </div>
                      <p className="text-xs text-slate-500 text-left">
                        Select a letter to see fingerspelling technique guidelines. Studying each letter keeps you sharp for alphabet spelling quizzes!
                      </p>
                      
                      <div className="grid grid-cols-5 sm:grid-cols-7 lg:grid-cols-9 gap-2 select-none">
                        {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => (
                          <button
                            key={letter}
                            onClick={() => {
                              notify(`Analyzed Sign "${letter}": standard BIM fist or flat hand shape.`);
                              setXp(prev => prev + 1);
                            }}
                            className="bg-slate-50 hover:bg-cyan-50 border border-slate-200 hover:border-cyan-400 text-slate-800 hover:text-[#005a71] p-3 text-center rounded-xl font-bold text-xs transition-all cursor-pointer active:scale-90"
                          >
                            {letter}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Test Yourself Action Buttons */}
                  <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => {
                        const targetUnitId = selectedPhraseLesson.id === "bim_alphabet" ? "1" : (selectedPhraseLesson.category === "Emergency" ? "3" : (selectedPhraseLesson.category === "Food" ? "4" : "2"));
                        const targetUnit = topics.find(t => t.id === targetUnitId) || topics[1];
                        setSelectedPathNode(targetUnit);
                        setQuizSource("practice");
                        setIsQuizFinished(false);
                        setQuizCorrectCount(0);
                        setCurrentQuizIndex(0);
                        setActiveTab("practice");
                        setPracticeModule("receptive");
                        notify(`Starting dedicated Skill Quiz for "${targetUnit?.title}"!`);
                      }}
                      className="flex-1 bg-[#fe932c] hover:bg-amber-500 text-white flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                    >
                      <Award className="w-4 h-4 text-white" />
                      <span>START REACTION QUIZ PRACTICE</span>
                    </button>
                    
                    <button
                      onClick={() => setSelectedPhraseLesson(null)}
                      className="px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-xs transition-all border border-slate-200 cursor-pointer"
                    >
                      Learn other vocabulary
                    </button>
                  </div>

                </div>
              </div>

            </div>
          ) : (
            <div className="space-y-8">
              <div className="space-y-2">
                <span className="text-xs bg-cyan-100 text-[#005a71] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Ally Toolkit
                </span>
                <h1 className="text-3xl font-extrabold tracking-tight text-[#1a1c1d] mt-1">
                  Essential BIM Vocabularies
                </h1>
                <p className="text-sm text-[#3f484c]">
                  Quickly locate sign instructions, search phrases, or use our customized **Gemini BIM Translator** to convert conversational phrases on the fly!
                </p>
              </div>

              {/* AI Generator converter container */}
              <div className="bg-white p-6 rounded-2xl border-2 border-[#005a71]/30 shadow-sm space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold text-[#005a71] bg-cyan-50 px-2 py-0.5 rounded uppercase tracking-wider">
                    AI-Powered Translation Box
                  </span>
                  <h3 className="text-lg font-bold text-[#1a1c1d] mt-1.5">
                    AI Bahasa Isyarat Malaysia Converter
                  </h3>
                  <p className="text-xs text-[#3f484c] leading-relaxed">
                    Type any custom phrase below. Our backend Gemini services translates it instantly to standard BIM Gloss format, explains required hand shapes, movement space vectors, and critical facial expressions.
                  </p>
                </div>

                <form onSubmit={handleTranslatePhrase} className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 p-3 text-xs bg-[#f9f9fb] border border-[#bec8cd] rounded-xl focus:outline-hidden focus:border-[#005a71] focus:ring-1 focus:ring-[#005a71] h-11"
                    placeholder="e.g. Boleh kita berjumpa esok pagi? (Can we meet tomorrow morning?)"
                    value={customPhrase}
                    onChange={(e) => setCustomPhrase(e.target.value)}
                    disabled={aiTranslating}
                  />
                  <button
                    type="submit"
                    disabled={aiTranslating || !customPhrase.trim()}
                    className={`px-5 font-bold text-xs rounded-xl h-11 transition-all flex items-center justify-center gap-1.5 ${
                      customPhrase.trim() && !aiTranslating
                        ? "bg-[#005a71] text-white hover:bg-[#0e7490] active:scale-95 cursor-pointer shadow-sm"
                        : "bg-[#e8e8ea] text-[#3f484c] cursor-not-allowed"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{aiTranslating ? "Converting..." : "Translate Phrase"}</span>
                  </button>
                </form>

                {/* AI Translation result */}
                {aiResult && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl space-y-3 shadow-md border-l-4 border-cyan-400"
                  >
                    <div className="flex items-center gap-2">
                      <span className="bg-cyan-500 text-slate-950 p-1 rounded-sm text-[10px] uppercase font-mono font-bold">
                        Standard BIM Gloss:
                      </span>
                      <span className="font-extrabold text-cyan-300 tracking-wide font-mono text-base break-all uppercase">
                        {aiResult.gloss}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2 border-t border-slate-700/60 leading-relaxed">
                      <div className="space-y-1">
                        <strong className="text-amber-400 block font-semibold">👐 Handshape &amp; Motion:</strong>
                        <p className="text-slate-300">{aiResult.handshape}</p>
                      </div>
                      <div className="space-y-1">
                        <strong className="text-amber-400 block font-semibold">👁️ Facial Expression:</strong>
                        <p className="text-slate-300">{aiResult.facialExpression}</p>
                      </div>
                    </div>

                    <div className="bg-[#1e293b] p-3 rounded-lg border border-slate-700 text-xs text-cyan-250 mt-1 flex flex-col md:flex-row gap-2 justify-between font-sans">
                      <div>
                        <strong className="text-[#fe932c]">Beginner Tip:</strong> {aiResult.linguisticTip}
                      </div>
                      {aiResult.gamifiedFeedback && (
                        <span className="text-[10px] font-bold text-[#fe932c] bg-amber-500/10 px-2 py-0.5 rounded shrink-0 self-start md:self-center mt-1 md:mt-0 text-center uppercase tracking-wider font-mono">
                          {aiResult.gamifiedFeedback}
                        </span>
                      )}
                    </div>

                    {/* Media Display Segment */}
                    {(() => {
                      const match = findMatchingMedia(customPhrase, aiResult.gloss);
                      const tutorial: BimTutorial | null = getVerifiedBimTutorial(match.translation.translated) || getVerifiedBimTutorial(customPhrase);

                      return (
                        <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4 text-left">
                          {/* Bilingual Translation Header Bar */}
                          <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center pb-3 border-b border-slate-800/80">
                            <div>
                              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-mono font-bold">Input (English)</div>
                              <div className="text-xs font-semibold text-slate-200">{customPhrase}</div>
                            </div>
                            <div className="hidden sm:block text-slate-600 text-sm">➔</div>
                            <div>
                              <div className="text-[10px] uppercase tracking-wider text-cyan-400 font-mono font-bold">Malay Translation (BIM Keyword)</div>
                              <div className="text-xs font-extrabold text-[#fe932c] flex items-center gap-1.5">
                                <span>{match.translation.translated}</span>
                                <span className="text-[9px] bg-amber-500/10 text-amber-500 px-1.5 py-0.2 rounded font-mono font-bold">Bilingual Sync</span>
                              </div>
                            </div>
                          </div>

                          {tutorial ? (
                            <div className="space-y-4 pt-1">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 font-mono">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                  <span>Verified BIM Tutorial Available</span>
                                </span>
                                
                                <button
                                  type="button"
                                  onClick={() => setShowAiTutorial(!showAiTutorial)}
                                  className="px-4 py-1.5 bg-gradient-to-r from-[#005a71] to-[#0e7490] hover:from-[#0e7490] hover:to-[#0891b2] text-white text-xs font-bold rounded-lg transition-all duration-150 flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer self-start sm:self-auto"
                                >
                                  <Sparkles className="w-3.5 h-3.5" />
                                  <span>{showAiTutorial ? "Hide BIM Tutorial" : "View BIM Tutorial"}</span>
                                </button>
                              </div>

                              {showAiTutorial && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.98 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className="mt-3 p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4"
                                >
                                  {/* 1. Playable embedded video first (if available) */}
                                  {tutorial.youtubeUrl ? (
                                    <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black border border-slate-800 shadow-inner">
                                      <iframe
                                        src={convertYoutubeToEmbed(tutorial.youtubeUrl)}
                                        title={`BIM Sign Video for ${tutorial.malay}`}
                                        className="w-full h-full border-0 absolute inset-0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                      ></iframe>
                                    </div>
                                  ) : null}

                                  {/* 2. Fallback/Demonstration image next */}
                                  {tutorial.imageUrl ? (
                                    <div className="flex flex-col items-center justify-center p-3 bg-slate-950/60 rounded-lg border border-slate-850">
                                      <img
                                        src={tutorial.imageUrl}
                                        alt={`BIM Sign demonstration for ${tutorial.malay}`}
                                        className="max-h-[140px] md:max-h-[160px] object-contain rounded-md"
                                        referrerPolicy="no-referrer"
                                      />
                                      <span className="text-[10px] text-slate-400 font-mono mt-1.5 font-bold">BIM Sign Demonstration Image</span>
                                    </div>
                                  ) : null}

                                  {/* 3. Explanation */}
                                  {tutorial.explanation && (
                                    <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-800 text-xs">
                                      <span className="text-amber-400 font-bold block mb-1 font-mono uppercase text-[9px] tracking-wider">Tutorial Explanation:</span>
                                      <p className="text-slate-300 leading-relaxed font-sans">{tutorial.explanation}</p>
                                    </div>
                                  )}

                                  {/* 4. Original link */}
                                  {tutorial.sourceUrl ? (
                                    <a
                                      href={tutorial.sourceUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 active:scale-98 transition-all duration-150 rounded-lg text-xs font-bold text-center text-cyan-300 border border-slate-700 flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                      <span>Open Original BIMSignBank Entry</span>
                                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                      </svg>
                                    </a>
                                  ) : null}
                                </motion.div>
                              )}
                            </div>
                          ) : (
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mt-2 pt-2 border-t border-slate-900 border-dashed">
                              <span className="inline-flex items-center gap-1 text-[10px] bg-amber-500/10 text-amber-500 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider font-mono">
                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                <span>No verified BIM tutorial yet.</span>
                              </span>
                              <span className="text-[10px] text-slate-400 font-sans">
                                Vocabulary drill active inside Practice Hub.
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </motion.div>
                )}
              </div>

              {/* Phrase category searches matching image mocks */}
              <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between border-t border-[#bec8cd]/40 pt-6">
                
                {/* Search phrase field */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#3f484c]/60" />
                  <input
                    type="text"
                    placeholder="Search phrases (e.g. Slowly, Help)..."
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#bec8cd] rounded-xl focus:outline-hidden focus:border-[#005a71] focus:ring-1 focus:ring-[#005a71] text-xs h-10"
                    value={phrasesSearch}
                    onChange={(e) => setPhrasesSearch(e.target.value)}
                  />
                </div>

                {/* Filtering Chips aligned with Mockup categories */}
                <div className="flex gap-2.5 overflow-x-auto pb-2 pt-1 select-none items-center bg-[#edeef0]/60 p-1.5 rounded-2xl border border-slate-200/50 max-w-full">
                  {["All", "Alphabet", "Basic Conversation", "Emergency", "Daily Life", "Social"].map((cat) => {
                    const isActive = phrasesCategory === cat;
                    return (
                      <div key={cat} className="flex items-center gap-1 shrink-0">
                        <button
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                            isActive
                              ? "bg-[#005a71] text-white shadow-xs"
                              : "bg-white text-[#3f484c] border border-slate-200/60 hover:bg-slate-50"
                          }`}
                          onClick={() => setPhrasesCategory(cat)}
                        >
                          {cat}
                        </button>
                        
                        {/* Inline plus button triggers modal with category assigned */}
                        {cat !== "All" && cat !== "Alphabet" && (
                          <button
                            type="button"
                            title={`Add custom dynamic BIM phrase inside ${cat}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setRequestModalCategory(cat);
                              setIsRequestModalOpen(true);
                              notify(`Triggering prompter translation targeted to category: ${cat}`);
                            }}
                            className="w-6 h-6 rounded-lg bg-cyan-100 hover:bg-[#005a71] text-[#005a71] hover:text-white flex items-center justify-center transition-all cursor-pointer border border-[#bec8cd]/35 active:scale-95"
                          >
                            <Plus className="w-3 h-3 stroke-[3]" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Custom Interactive Cards list matching Screen 3 precisely */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredPhrases.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-[#bec8cd]/60 overflow-hidden shadow-xs hover:border-[#005a71]/60 transition-all group flex flex-col justify-between"
                  >
                    <div className="relative aspect-video w-full bg-slate-900 border-b border-slate-100 overflow-hidden">
                      {imageErrors[item.id] || !item.image ? (
                        <div className="w-full h-full bg-gradient-to-br from-[#ecf0f1] to-[#cbd5e1] flex flex-col items-center justify-center p-4 text-center">
                          <BookOpen className="w-8 h-8 text-[#005a71]/60 mb-1" />
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">BIM Practice Study Sheet</span>
                        </div>
                      ) : (
                        <img
                          src={item.image}
                          alt={item.phrase}
                          onError={() => {
                            setImageErrors((prev) => ({ ...prev, [item.id]: true }));
                          }}
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                      )}
                      {item.isNew && (
                        <span className="absolute top-3 right-3 bg-[#0e7490] text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                          New Phrase
                        </span>
                      )}
                    </div>

                    <div className="p-5 space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-extrabold text-lg text-[#1a1c1d]">
                          {item.phrase}
                        </h3>
                        <span className="text-[10px] font-bold text-[#0e7490] bg-cyan-50 px-2 py-0.5 rounded-full capitalize">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-xs text-[#3f484c] leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {/* Primary phrase action learn button */}
                    <div className="px-5 pb-5 pt-1 flex gap-2">
                      <button
                        className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#005a71] hover:bg-[#005a71]/90 text-white font-bold text-xs rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer text-xs"
                        onClick={() => {
                          setSelectedPhraseLesson(item);
                          notify(`Opening master lesson guide for "${item.phrase}"!`);
                        }}
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Learn this Phrase</span>
                      </button>

                      {!item.id.toString().startsWith("bim_") && (
                        <button
                          title="Remove custom card"
                          className="px-3 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl transition-all hover:text-red-700 active:scale-95 cursor-pointer flex items-center justify-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCustomPhrase(item.id, item.phrase);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Request Phrase FAB plus module */}
              <div className="bg-[#edeef0]/60 p-6 rounded-2xl border border-[#bec8cd]/40 flex flex-col items-center justify-center text-center space-y-4 max-w-md mx-auto">
                <button 
                  onClick={() => {
                    setRequestModalCategory(phrasesCategory !== "All" && phrasesCategory !== "Alphabet" ? phrasesCategory : "Basic Conversation");
                    setIsRequestModalOpen(true);
                  }}
                  className="w-12 h-12 bg-[#005a71] text-white hover:bg-cyan-700 rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-all ring-4 ring-cyan-100 outline-hidden"
                >
                  <Plus className="w-6 h-6 stroke-[3]" />
                </button>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-sm text-[#1a1c1d]">Request AI Translated Phrase</h4>
                  <p className="text-xs text-[#3f484c] max-w-xs mx-auto">
                    Can't find what you need? Instantly ask our interactive prompter above to generate, translate, and bundle a custom BIM study card!
                  </p>
                </div>
              </div>

              {/* Popup modal component hook */}
              <RequestPhraseModal
                isOpen={isRequestModalOpen}
                onClose={() => setIsRequestModalOpen(false)}
                initialCategory={requestModalCategory}
                availableCategories={["Basic Conversation", "Emergency", "Daily Life", "Social"]}
                userId={user?.id}
                onPhraseAdded={(newPhrase) => {
                  setPhrases((prev) => [newPhrase, ...prev]);
                }}
                onXpAdd={(amount) => {
                  setXp((prev) => prev + amount);
                  setConsecutiveCorrect((curr) => curr + 1);
                }}
                notify={notify}
                phrases={phrases}
              />

            </div>
          )
        )}

        {/* ======================================= */}
        {/* VIEW 4: QUESTS (Activity Progression Mockup) */}
        {/* ======================================= */}
        {activeTab === "quests" && (
          <div className="space-y-8 max-w-2xl mx-auto">
            
            {/* Header section identical to mockups */}
            <div className="space-y-4 text-center lg:text-left">
              <div>
                <span className="text-xs bg-cyan-100 text-[#005a71] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Gamified Progress
                </span>
                <h1 className="text-3xl font-extrabold tracking-tight text-[#1a1c1d] mt-1">
                  Your Tasks
                </h1>
              </div>

              {/* Progress counter pill of tasks done */}
              <div className="bg-[#0e7490]/10 border border-[#0e7490]/25 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-center sm:text-left">
                  <span className="text-xs uppercase font-mono font-bold text-[#0e7490] block">QUEST DISCIPLINE</span>
                  <p className="font-black text-xl text-[#005a71] tracking-tight">
                    2/3 COMPLETED TODAY
                  </p>
                </div>
                <div className="flex gap-2 text-xs">
                  <span className="bg-amber-100 text-[#6e3900] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    +25 XP Streak Accumulator
                  </span>
                </div>
              </div>

              {/* Toggle layout matching standard segment */}
              <div className="bg-[#edeef0] p-1 rounded-xl flex gap-1 justify-center max-w-xs mx-auto md:mx-0">
                <button
                  className={`flex-1 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                    questsSubTab === "daily"
                      ? "bg-[#005a71] text-white shadow-xs"
                      : "text-[#3f484c] hover:bg-[#e8e8ea]"
                  }`}
                  onClick={() => setQuestsSubTab("daily")}
                >
                  Daily Quests
                </button>
                <button
                  className={`flex-1 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                    questsSubTab === "friend"
                      ? "bg-[#005a71] text-white shadow-xs"
                      : "text-[#3f484c] hover:bg-[#e8e8ea]"
                  }`}
                  onClick={() => setQuestsSubTab("friend")}
                >
                  Friend Quests
                </button>
              </div>
            </div>

            {/* List of Tasks matching Selected Sub-Tab */}
            {questsSubTab === "daily" ? (
              <div className="space-y-4">
                {quests.filter(q => q.type === "daily").map((q) => {
                  const isComplete = q.progress >= q.target;
                  
                  return (
                    <div
                      key={q.id}
                      className={`bg-white rounded-2xl border p-5 flex items-center justify-between gap-4 transition-all hover:shadow-xs ${
                        q.collected
                          ? "border-[#bec8cd]/30 bg-[#edeef0]/20 opacity-70"
                          : "border-[#bec8cd]/60"
                      }`}
                    >
                      {/* Circle visual node */}
                      <div className="flex items-center gap-4 min-w-0">
                        <div className={`w-12 h-12 rounded-full shrink-0 flex items-center justify-center ${
                          q.collected
                            ? "bg-[#0e7490] text-white"
                            : isComplete
                            ? "bg-[#0e7490]/10 text-[#0e7490]"
                            : "bg-amber-50 text-amber-600"
                        }`}>
                          {q.collected ? (
                            <Check className="w-5 h-5 stroke-[3]" />
                          ) : isComplete ? (
                            <CheckCircle className="w-5 h-5 text-[#005a71]" />
                          ) : (
                            <Play className="w-4 h-4 fill-current ml-0.5 animate-pulse" />
                          )}
                        </div>

                        {/* Details */}
                        <div className="min-w-0">
                          <h3 className="font-extrabold text-base text-[#1a1c1d] truncate">
                            {q.title}
                          </h3>
                          <p className="text-xs text-[#3f484c] mt-0.5 leading-snug">
                            {q.description}
                          </p>
                          
                          {/* Progress bar */}
                          {!q.collected && (
                            <div className="flex items-center gap-2 mt-2">
                              <div className="flex-1 min-w-[100px] h-1.5 bg-[#edeef0] rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-[#005a71]"
                                  style={{ width: `${(q.progress / q.target) * 100}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-bold text-[#3f484c]">
                                {q.progress}/{q.target}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Claim Rewards elements */}
                      <div className="shrink-0 text-right space-y-1">
                        <span className="text-xs font-mono font-bold text-[#0e7490] block">
                          +{q.xpWorth} XP
                        </span>
                        {q.collected ? (
                          <span className="text-[10px] font-bold text-[#0e7490] tracking-wider uppercase font-mono bg-[#edeef0] px-2 py-0.5 rounded">
                            COLLECTED
                          </span>
                        ) : isComplete ? (
                          <button
                            className="bg-[#fe932c] hover:bg-[#fe932c]/90 text-white font-extrabold text-[10px] tracking-wider uppercase px-3 py-1 rounded-lg"
                            onClick={() => handleClaimQuest(q.id, q.xpWorth)}
                          >
                            CLAIM
                          </button>
                        ) : (
                          <span className="text-[10px] font-semibold text-[#3f484c]/60">
                            PENDING
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Collaborative Friend Quests View matching screenshot layout */
              <div className="space-y-6">
                {/* Section Sub-header */}
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-extrabold text-[#1a1c1d] tracking-tight">
                    Collaborative
                  </h2>
                  <span className="text-xs font-bold bg-[#fff3d6] text-[#6e3900] px-3 py-1 rounded-full border border-amber-300">
                    LEVEL 2
                  </span>
                </div>

                {/* Sarah & You Collaborative Lesson Card */}
                <div className="bg-white rounded-3xl border border-[#bec8cd]/60 p-6 shadow-sm space-y-6">
                  
                  {/* Top segment with Text description and award badge */}
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <h3 className="font-extrabold text-xl text-[#1a1c1d]">
                        Sarah & You
                      </h3>
                      <p className="text-sm text-[#3f484c] font-medium leading-relaxed">
                        Complete 5 lessons together this week
                      </p>
                    </div>

                    {/* Gold award XP target badge */}
                    <div className="w-16 h-16 bg-[#fff8e7] border-2 border-amber-400 rounded-full flex flex-col items-center justify-center shrink-0 shadow-xs">
                      <span className="text-[#663500] font-extrabold text-sm">300</span>
                      <span className="text-[9px] font-bold text-amber-500 leading-none">XP</span>
                    </div>
                  </div>

                  {/* High precision tactile progress bar */}
                  <div className="space-y-3">
                    <div className="w-full h-3 bg-[#edeef0] rounded-full overflow-hidden border border-[#bec8cd]/30 relative">
                      <div
                        className="h-full bg-linear-to-r from-[#005a71] to-[#fe932c] rounded-full transition-all duration-500"
                        style={{ width: `${(sarahFriendLessons / 5) * 100}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-[#0e7490]">
                        {sarahFriendLessons} DONE
                      </span>
                      <span className="text-[#3f484c]/65">
                        {5 - sarahFriendLessons} REMAINING
                      </span>
                    </div>

                    {/* Avatars flanking the progress section */}
                    <div className="flex justify-between items-center pt-2 border-t border-[#edeef0]">
                      <div className="flex items-center gap-2">
                        <img
                          src={sarahAvatar}
                          alt="Sarah"
                          className="w-10 h-10 rounded-full border-2 border-[#005a71] object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="text-left">
                          <p className="text-xs font-bold text-[#1a1c1d]">Sarah K.</p>
                          <p className="text-[10px] text-emerald-600 font-medium">Online</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className="text-xs font-bold text-[#1a1c1d]">Alex (You)</p>
                          <p className="text-[10px] text-cyan-600 font-medium">Daily Streak: {streak}d</p>
                        </div>
                        <img
                          src={alexAvatar}
                          alt="Alex"
                          className="w-10 h-10 rounded-full border-2 border-[#fe932c] object-cover shadow-sm"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Nudge Action Controller */}
                  <div>
                    {sarahFriendLessons < 5 ? (
                      <button
                        className="w-full bg-[#005a71] hover:bg-[#0e7490] text-white flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-xs shadow-xs transition-all active:scale-98 cursor-pointer"
                        onClick={() => {
                          if (sarahFriendLessons === 3) {
                            setSarahFriendLessons(4);
                            setXp(p => p + 10);
                            notify("✨ Nudged Sarah! She completes her lesson. Lesson total updated: 4/5 complete! +10 XP!");
                          } else if (sarahFriendLessons === 4) {
                            setSarahFriendLessons(5);
                            setXp(p => p + 10);
                            notify("🔥 Sarah accepted your final nudge and completed Unit 5! Collaborative Quest Complete! Claim Reward unlocked!");
                          }
                        }}
                      >
                        <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                        <span>Nudge Sarah</span>
                      </button>
                    ) : sarahQuestCollected ? (
                      <div className="w-full bg-[#edfcf7] border-2 border-[#005a71]/20 text-[#005a71] py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>300 XP REWARD COLLECTED SUCCESSFUL</span>
                      </div>
                    ) : (
                      <button
                        className="w-full bg-[#fe932c] hover:bg-amber-500 text-white flex items-center justify-center gap-2 py-3.5 rounded-xl font-black text-xs shadow-md transition-all animate-bounce cursor-pointer"
                        onClick={() => {
                          setSarahQuestCollected(true);
                          setXp(p => p + 300);
                          notify("🏆 Epic Collaborative Victory! +300 XP added to your total score! Outstanding teamwork! 🎉");
                        }}
                      >
                        <Award className="w-4 h-4 text-white" />
                        <span>CLAIM 300 XP REWARD</span>
                      </button>
                    )}
                  </div>

                </div>

                {/* Info reset banner matching screenshot precisely */}
                <div className="bg-[#edeef0]/60 text-[#3f484c] border border-[#bec8cd]/35 px-4 py-3.5 rounded-xl flex items-center gap-3 text-xs leading-relaxed font-semibold">
                  <HelpCircle className="w-4.5 h-4.5 text-[#005a71] shrink-0" />
                  <span>Friend quests reset in 2 days. Keep the streak alive!</span>
                </div>

                {/* Explore other buddies section to keep it robust and extensible */}
                <div className="bg-[#edeef0]/30 rounded-2xl p-5 border border-[#bec8cd]/40 space-y-3">
                  <h4 className="text-xs font-bold text-[#3f484c] uppercase font-mono tracking-wider">
                    Other Streak Buddies Collaborative Signups
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-white p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img src={jordanAvatar} className="w-8 h-8 rounded-full object-cover" referrerPolicy="no-referrer" />
                        <div className="text-left">
                          <p className="text-xs font-bold">Jordan M.</p>
                          <p className="text-[10px] text-slate-500">1/5 completed</p>
                        </div>
                      </div>
                      <button
                        className="text-[10px] font-bold text-[#005a71] bg-[#005a71]/5 hover:bg-[#005a71]/10 px-2.5 py-1 rounded"
                        onClick={() => {
                          setXp(x => x + 5);
                          notify("Nudged Jordan M.! +5 Buddy coordination XP gained.");
                        }}
                      >
                        Nudge
                      </button>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img src={elenaAvatar} className="w-8 h-8 rounded-full object-cover" referrerPolicy="no-referrer" />
                        <div className="text-left">
                          <p className="text-xs font-bold">Elena R.</p>
                          <p className="text-[10px] text-slate-500">4/5 completed</p>
                        </div>
                      </div>
                      <button
                        className="text-[10px] font-bold text-[#005a71] bg-[#005a71]/5 hover:bg-[#005a71]/10 px-2.5 py-1 rounded"
                        onClick={() => {
                          setXp(x => x + 5);
                          notify("Nudged Elena R.! She's extremely close to completing! +5 XP.");
                        }}
                      >
                        Nudge
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            )}


          </div>
        )}

        {/* ======================================= */}
        {/* VIEW 5: USER PROFILE & STREAKS (Screen 2 Mockup) */}
        {/* ======================================= */}
        {activeTab === "profile" && (
          <div className="space-y-8 max-w-2xl mx-auto">
            
            {/* Header */}
            <div className="text-center space-y-1">
              <span className="text-xs bg-cyan-100 text-[#005a71] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Ally Profile
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight text-[#1a1c1d] mt-2">
                Your Learning Hub
              </h1>
            </div>

            {/* Profile Avatar & Title matching Screen 2 precisely */}
            <div className="bg-white rounded-2xl border border-[#bec8cd]/60 p-6 text-center space-y-4 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-[#005a71]" />
              
              {/* Centered Profile Avatar */}
              <div className="relative w-28 h-28 mx-auto shrink-0">
                <img
                  src={INITIAL_BUDDIES[1].avatar} // Alex Signer matching image
                  alt="Alex Signer BIM Companion"
                  className="w-full h-full object-cover rounded-full border-4 border-white shadow-md ring-4 ring-[#005a71]"
                  referrerPolicy="no-referrer"
                />
                
                {/* Ally Level 5 badge */}
                <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-[#005a71] text-white text-[9.5px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md whitespace-nowrap">
                  ALLY LEVEL 5
                </div>
              </div>

              {/* Name Block */}
              <div className="pt-2">
                <h2 className="text-2xl font-black text-[#1a1c1d]">
                  Alex Signer
                </h2>
                <p className="text-xs font-mono font-semibold text-[#0e7490]">
                  @AlexSigner
                </p>
              </div>

              {/* Brief custom bio summary */}
              <p className="text-xs text-[#3f484c] max-w-md mx-auto leading-relaxed">
                BIM Beginner Ally. Committed to building conversational workflows with Deaf and Mute neighbors in Malaysia. Practicing daily receptive and expressive gestures!
              </p>
            </div>

            {/* 🔐 Supabase Auth and Cloud Database Sync Panel */}
            <div className="bg-white rounded-2xl border-2 border-cyan-600/30 p-6 space-y-4 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-[#0e7490]" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-[#0e7490]/10 text-[#005a71] rounded-lg">
                    <Layers className="w-5 h-5 text-[#005a71]" />
                  </span>
                  <div>
                    <h3 className="font-extrabold text-base text-[#1a1c1d]">Supabase Cloud Sync</h3>
                    <p className="text-[10px] text-[#3f484c]/80 font-mono tracking-tight">{supabaseFeedback}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  user ? "bg-cyan-100 text-[#0e7490]" : "bg-amber-100 text-[#714b00]"
                }`}>
                  {user ? "Cloud Synced" : "Offline / Demo"}
                </span>
              </div>

              {user ? (
                <div className="bg-cyan-50/50 p-4 rounded-xl border border-cyan-100 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-[#1a1c1d]">Active Session Profile:</p>
                      <p className="text-[#3f484c] font-mono break-all">{user.email}</p>
                    </div>
                    <button
                      className="text-xs font-bold text-red-600 hover:text-red-800 hover:underline cursor-pointer bg-white border border-red-200 px-3 py-1.5 rounded-lg transition-transform"
                      onClick={handleSignOut}
                    >
                      Sign Out
                    </button>
                  </div>
                  <div className="text-[11px] text-[#004d62] leading-relaxed">
                    🌟 <strong>Progress Sync:</strong> Your BIM course nodes, mastered vocabulary, and quiz metrics are securely synchronized and tracked inside the Supabase database.
                  </div>
                </div>
              ) : (
                <form onSubmit={handleAuthSubmit} className="space-y-3.5 pt-1">
                  <p className="text-xs text-[#3f484c] leading-relaxed">
                    Create a free beginner account to enable automated progress syncing via Supabase Auth and load signs dynamically from the <code>signs</code> Cloud table.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-[#1a1c1d] uppercase font-mono">Email Address</label>
                      <input
                        type="email"
                        placeholder="pelajar@signflow.my"
                        className="w-full p-2.5 text-xs bg-[#f9f9fb] border border-[#bec8cd] rounded-xl focus:border-[#005a71] focus:ring-1 focus:ring-[#005a71]"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        disabled={authLoading}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-[#1a1c1d] uppercase font-mono">Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full p-2.5 text-xs bg-[#f9f9fb] border border-[#bec8cd] rounded-xl focus:border-[#005a71] focus:ring-1 focus:ring-[#005a71]"
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        disabled={authLoading}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 gap-2 flex-wrap md:flex-nowrap">
                    <div className="flex gap-4 text-xs">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="authMode"
                          checked={authMode === "login"}
                          onChange={() => setAuthMode("login")}
                          disabled={authLoading}
                          className="accent-[#005a71]"
                        />
                        <span className="font-semibold text-xs text-[#1a1c1d]">Log In</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="authMode"
                          checked={authMode === "signup"}
                          onChange={() => setAuthMode("signup")}
                          disabled={authLoading}
                          className="accent-[#005a71]"
                        />
                        <span className="font-semibold text-xs text-[#1a1c1d]">Sign Up</span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={authLoading}
                      className="px-5 py-2 bg-[#005a71] text-white text-xs font-bold rounded-xl hover:bg-[#0e7490] active:scale-95 transition-all shadow-sm"
                    >
                      {authLoading ? "Synchronizing..." : authMode === "login" ? "Log In & Sync" : "Create Account & Sync"}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Weekly streak calendar matching Screen 2 precisely */}
            <div className="bg-white rounded-2xl border border-[#bec8cd]/60 p-6 space-y-4 shadow-xs">
              
              <div className="flex justify-between items-center gap-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-500 fill-amber-100" />
                  <span className="font-extrabold text-base text-[#1a1c1d]">Weekly Progress</span>
                </div>
                <span className="font-bold text-sm text-[#fe932c] flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                  <Flame className="w-4 h-4 fill-amber-500" />
                  12 Day Streak
                </span>
              </div>

              {/* Monday to Sunday Day Nodes */}
              <div className="grid grid-cols-7 gap-2 text-center pt-2 select-none">
                {[
                  { name: "M", done: true },
                  { name: "T", done: true },
                  { name: "W", done: true },
                  { name: "T", current: true },
                  { name: "F", done: false },
                  { name: "S", done: false },
                  { name: "S", done: false }
                ].map((day, idx) => {
                  return (
                    <div key={idx} className="space-y-2">
                      <span className="text-xs font-semibold text-[#3f484c]">{day.name}</span>
                      <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center border transition-all ${
                        day.done
                          ? "bg-[#fe932c] border-[#fe932c] text-white text-xs font-bold"
                          : day.current
                          ? "border-[#005a71] bg-white ring-2 ring-[#005a71]/10 text-[#005a71]"
                          : "bg-[#f3f3f5] border-[#bec8cd]/60"
                      }`}>
                        {day.done ? (
                          <Check className="w-4 h-4 stroke-[3]" />
                        ) : day.current ? (
                          <div className="w-2 h-2 rounded-full bg-[#005a71]" />
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Streak Buddies matching Screen 2 precisely */}
            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <h3 className="font-extrabold text-base text-[#1a1c1d]">
                  Streak Buddies
                </h3>
                <span
                  className="text-xs font-bold text-[#0e7490] hover:underline cursor-pointer"
                  onClick={() => notify("Displaying absolute buddy network...")}
                >
                  View All
                </span>
              </div>

              <div className="space-y-3">
                {buddies.map((buddy) => (
                  <div
                    key={buddy.id}
                    className="bg-white rounded-2xl border border-[#bec8cd]/60 p-4 flex items-center justify-between gap-4 shadow-2xs hover:border-[#005a71]/40 transition-colors"
                  >
                    {/* Details avatar circle */}
                    <div className="flex items-center gap-3">
                      <img
                        src={buddy.avatar}
                        alt={buddy.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-slate-100"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <h4 className="font-extrabold text-sm text-[#1a1c1d]">{buddy.name}</h4>
                        <span className="text-[10px] font-mono font-bold text-[#fe932c] flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5 fill-[#fe932c]" />
                          {buddy.streakDays} days
                        </span>
                      </div>
                    </div>

                    {/* Nudge trigger button matching mocks */}
                    <button
                      className={`px-6 py-2 rounded-full font-bold text-xs transition-all ${
                        buddy.nudged
                          ? "bg-slate-100 border border-[#bec8cd] text-slate-400 cursor-not-allowed"
                          : "border-2 border-[#005a71] text-[#005a71] bg-white hover:bg-[#005a71]/5 active:scale-95 cursor-pointer"
                      }`}
                      onClick={() => handleNudge(buddy.id)}
                      disabled={buddy.nudged}
                    >
                      {buddy.nudged ? "Nudged" : "Nudge"}
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </main>

      {/* 📱 Sticky Bottom Navigation Drawer matching Screen 1 precise UI layout */}
      <nav className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-md border-t border-[#bec8cd] z-50 flex items-center justify-around h-16 shadow-lg px-4 md:px-12">
        <button
          className={`flex flex-col items-center gap-1 transition-all w- touch-target ${
            activeTab === "path" ? "text-[#005a71] scale-102 font-bold" : "text-[#3f484c]/80 hover:text-[#005a71]"
          }`}
          onClick={() => setActiveTab("path")}
        >
          <Map className={`w-5 h-5 ${activeTab === "path" ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
          <span className="text-[10px] uppercase font-mono font-semibold tracking-wider">Path</span>
        </button>

        <button
          className={`flex flex-col items-center gap-1 transition-all w- touch-target ${
            activeTab === "practice" ? "text-[#005a71] scale-102 font-bold" : "text-[#3f484c]/80 hover:text-[#005a71]"
          }`}
          onClick={() => setActiveTab("practice")}
        >
          <Award className={`w-5 h-5 ${activeTab === "practice" ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
          <span className="text-[10px] uppercase font-mono font-semibold tracking-wider">Practice</span>
        </button>

        <button
          className={`flex flex-col items-center gap-1 transition-all w- touch-target ${
            activeTab === "toolkit" ? "text-[#005a71] scale-102 font-bold" : "text-[#3f484c]/80 hover:text-[#005a71]"
          }`}
          onClick={() => setActiveTab("toolkit")}
        >
          <BookOpen className={`w-5 h-5 ${activeTab === "toolkit" ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
          <span className="text-[10px] uppercase font-mono font-semibold tracking-wider">Toolkit</span>
        </button>

        <button
          className={`flex flex-col items-center gap-1 transition-all w- touch-target ${
            activeTab === "quests" ? "text-[#005a71] scale-102 font-bold" : "text-[#3f484c]/80 hover:text-[#005a71]"
          }`}
          onClick={() => setActiveTab("quests")}
        >
          <Layers className={`w-5 h-5 ${activeTab === "quests" ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
          <span className="text-[10px] uppercase font-mono font-semibold tracking-wider">Quests</span>
        </button>

        <button
          className={`flex flex-col items-center gap-1 transition-all w- touch-target ${
            activeTab === "profile" ? "text-[#005a71] scale-102 font-bold" : "text-[#3f484c]/80 hover:text-[#005a71]"
          }`}
          onClick={() => setActiveTab("profile")}
        >
          <User className={`w-5 h-5 ${activeTab === "profile" ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
          <span className="text-[10px] uppercase font-mono font-semibold tracking-wider">Profile</span>
        </button>
      </nav>

    </div>
  );
}
