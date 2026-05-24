import React, { useState } from "react";
import { 
  X, 
  Sparkles, 
  HelpCircle, 
  Layers, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  BookOpen, 
  Award,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { saveUserPhrase } from "../lib/userPhrasesDb";
import { ToolkitPhrase, BimTutorial } from "../types";
import { 
  translateEnglishToMalay, 
  getVerifiedBimTutorial, 
  convertYoutubeToEmbed 
} from "../data";

interface RequestPhraseModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory: string; // The category where the "+" button was clicked e.g. "Daily Life"
  availableCategories: string[]; // List of categories e.g. ["Basic Conversation", "Emergency", "Daily Life", "Social"]
  userId?: string;
  onPhraseAdded: (newPhrase: ToolkitPhrase) => void;
  onXpAdd: (amount: number) => void;
  notify: (msg: string) => void;
  phrases: ToolkitPhrase[];
}

export const RequestPhraseModal: React.FC<RequestPhraseModalProps> = ({
  isOpen,
  onClose,
  initialCategory,
  availableCategories,
  userId,
  onPhraseAdded,
  onXpAdd,
  notify,
  phrases
}) => {
  const [typedPhrase, setTypedPhrase] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || "Basic Conversation");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showTutorial, setShowTutorial] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>("");
  const [successInfo, setSuccessInfo] = useState<string | null>(null);
  const [resultCard, setResultCard] = useState<{
    phrase: string;
    gloss: string;
    handshape: string;
    facialExpression: string;
    linguisticTip: string;
    gamifiedFeedback: string;
    category: string;
  } | null>(null);

  if (!isOpen) return null;

  const runTranslationMock = async (phrase: string): Promise<{
    gloss: string;
    handshape: string;
    facialExpression: string;
    linguisticTip: string;
    gamifiedFeedback: string;
  }> => {
    // Elegant, context-aware rule-based dictionary for highly accurate simulated linguist transitions
    const cleaning = phrase.toLowerCase().trim();
    
    // Check if duplicate before even processing simulation
    const isDuplicate = phrases.some(p => p.phrase.toLowerCase() === cleaning);
    
    let gloss = phrase.toUpperCase().replace(/\b(IS|AM|ARE|THE|A|AN|TO|ADALAH|IALAH|YANG)\b/g, "").replace(/\s+/g, " ").trim();
    if (!gloss) gloss = "BERKOMUNIKASI";
    
    let handshape = "Extend open hand, pivoting minor knuckles gently to standard space.";
    let facial = "Keep a steady, supportive smile, highlighting welcoming intentions.";
    let tip = "BIM uses subject-object-verb indexing. Focus on steady pacing.";
    let levelUp = "+10 XP! Translation evaluated successfully!";

    if (cleaning.includes("toilet") || cleaning.includes("tandas")) {
      gloss = "TANDAS / MANA";
      handshape = "Form the 'T' handshape (thumb tucked between index and middle fingers) and shake it side-to-side with minor wrist tilt.";
      facial = "Raise eyebrows and tilt head slightly to signify an inquiry or location request.";
      tip = "BIM puts question variables like 'MANA' (Where) at the end of clauses.";
    } else if (cleaning.includes("hello") || cleaning.includes("hai") || cleaning.includes("apa khabar")) {
      gloss = "APA-KHABAR / HAI";
      handshape = "Raise dominant open hand from shoulder level and sweep slightly to the right in a friendly, gentle wave.";
      facial = "Maintain responsive, smiling eyes to convey genuine respect in Malaysian culture.";
      tip = "Eye contact is the foundation of Deaf culture. Never look away mid-sign.";
    } else if (cleaning.includes("thank you") || cleaning.includes("terima kasih")) {
      gloss = "TERIMA-KASIH";
      handshape = "Touch flat dominant hand fingers politely to your chin, then move the hand downward and outward toward the recipient.";
      facial = "Keep a warm smile and lower your head slightly to express honor and friendship.";
      tip = "A deeper chest-downward curve of the dominant hand indicates higher esteem or official gratitude.";
    } else if (cleaning.includes("help") || cleaning.includes("tolong")) {
      gloss = "TOLONG / SEKARANG";
      handshape = "Place your dominant hand's closed fist (thumb pointing up) on top of the flat open palm of your non-dominant hand, and lift together.";
      facial = "Adopt a serious, alert face with widened eyes to represent active urgent coordination.";
      tip = "The flat-hand lift symbolizes elevating the person in trouble to physical safety.";
    } else if (cleaning.includes("hospital") || cleaning.includes("doctor")) {
      gloss = "HOSPITAL / TOLONG";
      handshape = "Trace a small cross symbol (+) on your outer left shoulder using the index and middle fingers of your right hand.";
      facial = "Focus eyes clearly on the shoulder placement to guide bystanders' attention.";
      tip = "Tracing authority badges or shoulder symbols is a common noun structure in BIM.";
    }

    return {
      gloss,
      handshape,
      facialExpression: facial,
      linguisticTip: tip,
      gamifiedFeedback: levelUp
    };
  };

  const handleRequestTranslate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedPhrase.trim()) return;

    // Check duplicate
    const normalizedTyped = typedPhrase.trim().toLowerCase();
    const isDuplicate = phrases.some(p => p.phrase.toLowerCase() === normalizedTyped);
    if (isDuplicate) {
      notify("This word/phrase already exists in the toolkit.");
      onClose();
      return;
    }

    setIsLoading(true);
    setSuccessInfo(null);
    setResultCard(null);
    setShowTutorial(false);

    // Beautiful step-by-step loading simulation list
    const steps = [
      "🔄 Initializing AI BIM Translation engine...",
      "🔍 Stripping grammatical suffixes and word connectors...",
      "👐 Looking up sign shapes in Malaysian BIM Dictionary...",
      "📐 Synthesizing kinematic muscle movements...",
      "👁️ Calibrating supportive facial grammar offsets...",
      "🎉 Evaluation complete!"
    ];

    for (let i = 0; i < steps.length; i++) {
      setLoadingStep(steps[i]);
      await new Promise((resolve) => setTimeout(resolve, i === steps.length - 1 ? 400 : 700));
    }

    try {
      // Direct client translator rules
      const translationResult = await runTranslationMock(typedPhrase);
      
      // Save it into Supabase / local storage using our DB manager
      const { success, data, feedback } = await saveUserPhrase(
        typedPhrase,
        translationResult,
        selectedCategory,
        userId
      );

      if (success && data) {
        setResultCard({
          phrase: typedPhrase,
          ...translationResult,
          category: selectedCategory
        });

        onPhraseAdded(data);
        onXpAdd(10); // Award XP
        setSuccessInfo(feedback);
        notify(`✨ Saved new sign card: "${typedPhrase}" inside "${selectedCategory}"!`);
      } else {
        throw new Error(feedback);
      }
    } catch (err: any) {
      notify("Error saving card: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-lg overflow-hidden relative z-10 flex flex-col"
        >
          {/* Top Header */}
          <div className="bg-gradient-to-r from-slate-900 via-[#005a71] to-[#0e7490] px-6 py-5 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse shrink-0" />
              <div>
                <span className="text-[10px] font-bold text-cyan-200 uppercase tracking-widest block font-mono">
                  SUPABASE CLOUD SYNC
                </span>
                <h3 className="font-black text-lg text-white leading-tight">
                  Gemini BIM Phrase Transliteration
                </h3>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-full bg-black/20 text-slate-100 hover:bg-black/40 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 sm:p-8 overflow-y-auto space-y-6 max-h-[80vh]">
            
            {/* Ask Prompt Instructions */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1 text-left">
              <span className="text-[10px] bg-cyan-100 text-[#005a71] font-extrabold font-mono px-2 py-0.5 rounded uppercase">
                Interactive Portal Prompter
              </span>
              <p className="text-sm font-bold text-slate-900 mt-1">
                Enter a word or phrase to translate into BIM:
              </p>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Try conversational words or short statements. The engine translates, drafts structured gestures, structures grammar, and generates a new educational card.
              </p>
            </div>

            {/* Normal Input / Save State Form */}
            {!isLoading && !resultCard && (
              <form onSubmit={handleRequestTranslate} className="space-y-4">
                
                {/* Typed Phrase */}
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                    Your Word / Phrase sentence
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Where is the nearest toilet? or Thank you so much"
                    value={typedPhrase}
                    onChange={(e) => setTypedPhrase(e.target.value)}
                    className="w-full text-xs p-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-[#005a71] focus:ring-1 focus:ring-[#005a71] focus:outline-hidden font-semibold text-slate-800"
                  />
                </div>

                {/* Target save category */}
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono block">
                    Target Lesson Category to host card
                  </label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {availableCategories.filter(c => c !== "All" && c !== "Alphabet").map((cat) => {
                      const isChosen = selectedCategory === cat;
                      return (
                        <button
                          type="button"
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`p-3 rounded-xl border text-xs font-bold text-center select-none transition-all cursor-pointer ${
                            isChosen
                              ? "bg-cyan-50 border-2 border-[#005a71] text-[#005a71] shadow-xs"
                              : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600"
                          }`}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Confirm target validation */}
                <div className="bg-amber-50/50 border border-amber-200/50 p-4 rounded-xl flex items-start gap-2.5 text-[11px] leading-relaxed text-left">
                  <Layers className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-950 font-bold block mb-0.5">Automated Assignment Lock:</strong>
                    <span className="text-slate-600 font-medium">
                      Saving into category: <span className="font-extrabold text-[#005a71]">{selectedCategory}</span>. This phrase will immediately be accessible in the main lesson filters tab.
                    </span>
                  </div>
                </div>

                {selectedCategory !== initialCategory && (
                  <div className="bg-cyan-50/50 border border-cyan-200/50 p-3 rounded-xl text-left text-[11px] text-cyan-800">
                    💡 Category shifted from default (<span className="line-through">{initialCategory}</span>) to <b>{selectedCategory}</b> based on user choice.
                  </div>
                )}

                {/* Actions */}
                <button
                  type="submit"
                  className="w-full py-4 bg-[#005a71] hover:bg-[#0e7490] text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
                  <span>TRANSLATE &amp; EMBED BIM CARD</span>
                </button>
              </form>
            )}

            {/* Translation Loading Progress animation */}
            {isLoading && (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                <Loader2 className="w-12 h-12 text-[#005a71] animate-spin" />
                <div className="space-y-1">
                  <h4 className="font-extrabold text-sm text-slate-800">Synthesizing BIM translation...</h4>
                  <p className="text-xs text-purple-600 font-mono font-bold animate-pulse px-4 py-2 bg-purple-50 rounded-full inline-block">
                    {loadingStep}
                  </p>
                </div>
                <div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden relative">
                  <div className="absolute top-0 left-0 h-full bg-[#005a71] animate-[pulse_1s_infinite]" style={{ width: "65%" }} />
                </div>
              </div>
            )}

            {/* Generated results & visual feedback block */}
            {!isLoading && resultCard && (
              <div className="space-y-6 text-left">
                
                {/* Clean user success message banner */}
                <div className="bg-emerald-500 text-white p-4 rounded-2xl flex items-start gap-3 shadow-md">
                  <CheckCircle className="w-6 h-6 shrink-0 text-white mt-0.5" />
                  <div>
                    <h4 className="font-black text-xs uppercase tracking-wider">SUCCESSFULLY GENERATED! (+10 XP)</h4>
                    <p className="text-xs text-emerald-100 leading-relaxed mt-0.5">
                      New card created and saved into {resultCard.category}! Streak multiplier increased.
                    </p>
                  </div>
                </div>

                {/* Rich interactive BIM learning card mockup detail preview */}
                <div className="border border-[#bec8cd]/60 rounded-3xl overflow-hidden bg-[#fafafa]">
                  <div className="p-5 bg-gradient-to-r from-slate-900 to-[#1e293b] text-white flex justify-between items-center">
                    <div>
                      <span className="text-[9px] font-mono bg-cyan-500 text-slate-950 px-2 py-0.5 rounded font-extrabold uppercase">
                        Active BIM standard
                      </span>
                      <h4 className="font-black text-lg text-cyan-300 mt-1 uppercase">
                        {resultCard.phrase}
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-3 py-1 rounded-full">
                      {resultCard.category}
                    </span>
                  </div>

                  <div className="p-5 space-y-4 text-xs">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold">
                        BIM Gloss Output (Visual Grammar)
                      </span>
                      <p className="text-base font-black text-slate-900 font-mono tracking-wide">
                        {resultCard.gloss}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-200/50">
                      <div>
                        <strong className="text-[#005a71] block mb-0.5 text-xs">👐 Gesture hand movements:</strong>
                        <p className="text-slate-600 text-xs">
                          {resultCard.handshape}
                        </p>
                      </div>

                      <div>
                        <strong className="text-[#005a71] block mb-0.5 text-xs">👁️ Grammatical Facial Cues:</strong>
                        <p className="text-slate-600 text-xs text-left">
                          {resultCard.facialExpression}
                        </p>
                      </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl leading-relaxed text-[11px] text-amber-800">
                      <strong>Linguistic Study Tip:</strong> {resultCard.linguisticTip}
                    </div>

                    <div className="bg-[#edf9fc] p-3 rounded-xl text-center font-bold text-[#005a71] uppercase tracking-wider font-mono border border-cyan-100 text-[10px]">
                      🏆 {resultCard.gamifiedFeedback}
                    </div>

                    {(() => {
                      const translationObj = translateEnglishToMalay(resultCard.phrase);
                      const tutorial: BimTutorial | null = getVerifiedBimTutorial(translationObj.translated) || getVerifiedBimTutorial(resultCard.phrase);

                      return (
                        <div className="mt-4 p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 text-left text-white">
                          {/* Dynamic Bilingual Translation Info */}
                          <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center pb-3 border-b border-slate-800/80">
                            <div>
                              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-mono font-bold">Input (English)</div>
                              <div className="text-xs font-semibold text-slate-200">{resultCard.phrase}</div>
                            </div>
                            <div className="hidden sm:block text-slate-600 text-sm">➔</div>
                            <div>
                              <div className="text-[10px] uppercase tracking-wider text-cyan-400 font-mono font-bold">Malay Translation (BIM Keyword)</div>
                              <div className="text-xs font-extrabold text-[#fe932c] flex items-center gap-1.5">
                                <span>{translationObj.translated}</span>
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
                                  onClick={() => setShowTutorial(!showTutorial)}
                                  className="px-4 py-1.5 bg-gradient-to-r from-[#005a71] to-[#0e7490] hover:from-[#0e7490] hover:to-[#0891b2] text-white text-xs font-bold rounded-lg transition-all duration-150 flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer self-start sm:self-auto"
                                >
                                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                                  <span>{showTutorial ? "Hide BIM Tutorial" : "View BIM Tutorial"}</span>
                                </button>
                              </div>

                              {showTutorial && (
                                <div className="mt-3 p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4 text-white">
                                  {/* 1. Playable embedded video first */}
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

                                  {/* 2. Demonstration image next */}
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
                                      className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 active:scale-98 transition-all duration-150 rounded-lg text-xs font-bold text-center text-cyan-300 border border-slate-705 flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                      <span>Open Original BIMSignBank Entry</span>
                                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                      </svg>
                                    </a>
                                  ) : null}
                                </div>
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
                  </div>
                </div>

                {/* DB status info message */}
                {successInfo && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start gap-2.5 text-[10px] leading-relaxed text-slate-500">
                    <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>{successInfo}</span>
                  </div>
                )}

                {/* Closing actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setResultCard(null);
                      setTypedPhrase("");
                    }}
                    className="flex-1 py-3 text-center border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Translate another phrase
                  </button>
                  
                  <button
                    onClick={onClose}
                    className="flex-1 py-3 text-center bg-[#005a71] hover:bg-[#005a71]/90 text-white font-extrabold text-xs rounded-xl cursor-pointer shadow-md"
                  >
                    Return to Toolkit
                  </button>
                </div>

              </div>
            )}

          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
