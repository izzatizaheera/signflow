import React, { useState } from "react";
import { 
  ArrowLeft, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  Sparkles, 
  Award, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  Video, 
  ThumbsUp, 
  HelpCircle 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { alphabetMedia } from "../data";

interface BimAlphabetExplorerProps {
  onBack: () => void;
  onXpAdd: (amount: number) => void;
  notify: (msg: string) => void;
}

interface LetterData {
  letter: string;
  title: string;
  tutorial: string;
  videoDescription: string;
  tips: string;
  svgPathAccent: string; // Dynamic path highlight for our stylized vector hand outline
}

const ALPHABET_DATA: LetterData[] = [
  {
    letter: "A",
    title: "The Thumb Out-Fist",
    tutorial: "Clench your hand into a compact fist with your thumb pointing straight up, resting snugly against the side of your curled index finger.",
    videoDescription: "Demonstrates starting with an open palm face-front, then clenching fingers tightly while securing the thumb flush to the right margin.",
    tips: "Ensure your thumb points straight up to differentiate clearly from the letter 'S' (where the thumb crosses in front).",
    svgPathAccent: "M10 8c1-1 3-1 4 0s1 3 0 4l-4 4"
  },
  {
    letter: "B",
    title: "Vertical Open Shield",
    tutorial: "Hold your hand straight up with all four fingers pressed tightly together like a vertical board, folding your thumb inward flat against your palm.",
    videoDescription: "Shows an expansive raised flat hand with the thumb gently folded into the palm center at eye level.",
    tips: "Keep your outer fingers in a continuous straight line. The thumb must be folded rather than sticking out.",
    svgPathAccent: "M6 6c0-2 2-4 4-4s4 2 4 4v8"
  },
  {
    letter: "C",
    title: "Slightly Curved Cup",
    tutorial: "Curve all four fingers together and arch your thumb underneath, forming a clear hollow semi-circle facing left that mimics the shape of the Letter C.",
    videoDescription: "Rotates the wrist slightly to profile the smooth curved space between fingers and the thumb.",
    tips: "Keep the gap wide enough so it remains highly visible from a side or front perspective.",
    svgPathAccent: "M14 4a6 6 0 0 0-8 8a6 6 0 0 0 8 8"
  },
  {
    letter: "D",
    title: "Upward Pointer Circle",
    tutorial: "Point your index finger straight up while curving your middle, ring, and pinky fingers down to join your thumb in a soft circular touch.",
    videoDescription: "Focuses on the vertical index finger alignment and the circular lock formed by the helper fingers.",
    tips: "Press the middle finger down securely. A floppy index will make it look like '1' instead of 'D'.",
    svgPathAccent: "M10 2v10M10 12a4 4 0 1 1-4-4"
  },
  {
    letter: "E",
    title: "Folded Finger Claw",
    tutorial: "Curl all four fingers halfway down together to rest on their fingertips, then pull your thumb under to lie horizontal just below the tips.",
    videoDescription: "Shows the hand profile shifting from open to a tight, high-tension claw shape without space.",
    tips: "Make sure fingers touch the thumb for a compact profile; otherwise, it looks like a loose fist.",
    svgPathAccent: "M6 10c0-1 1-2 2-2h4c1 0 2 1 2 2"
  },
  {
    letter: "F",
    title: "The Okay Gesture",
    tutorial: "Touch the tip of your index finger to your thumb tip to make a neat circle, while holding your middle, ring, and pinky fingers straight up and spread out.",
    videoDescription: "Presents the front palm face with the index-thumb ring standing in high-contrast against the other three fingers.",
    tips: "Do not fold the other fingers; expand them wide like a fan to show clear separation.",
    svgPathAccent: "M10 10a2 2 0 1 1-2-2M12 6V2M14 6V2"
  },
  {
    letter: "G",
    title: "Horizontal Pinch Pin",
    tutorial: "Point your index finger straight to the side while extending your thumb parallel below it, as if pointing to an object or pinching a small key.",
    videoDescription: "Features a 90-degree wrist twist with index and thumb pointing left horizontally with a 1-inch gap between them.",
    tips: "Keep the index straight and level. Do not angle it down, or it can be mistaken for the letter 'Q'.",
    svgPathAccent: "M4 10h10M4 14h6"
  },
  {
    letter: "H",
    title: "Double Parallel Finger Sweep",
    tutorial: "Extend your index and middle fingers straight out parallel to the side, maintaining a closed fist with your remaining fingers and thumb tucked.",
    videoDescription: "A horizontal slice across the screen showing the twin-finger setup starting near the chin.",
    tips: "Keep the middle and index finger pressed side-by-side without any gaping, pointing horizontally.",
    svgPathAccent: "M4 8h12M4 12h12"
  },
  {
    letter: "I",
    title: "The Pinky Pole",
    tutorial: "Clench your hand into a solid compact fist while extending only your little pinky finger straight up toward the sky.",
    videoDescription: "Shows an upright fist facing front with the pinky finger extended vertically at shoulder height.",
    tips: "Close your other fingers tight! Keep your palm neutral rather than pulling it back.",
    svgPathAccent: "M14 6v8M14 14a2 2 0 0 1-2 2"
  },
  {
    letter: "J",
    title: "J-Hook Swivel Wave",
    tutorial: "Start with the 'I' pinky raise, then trace a graceful hook shape in the air by scooping your hand down, left, and back up.",
    videoDescription: "An animated tracing loop showing the pinky finger outlining the classic J curve.",
    tips: "Perform the wrist twist smoothly. It is a kinetic motion, not a stagnant pose.",
    svgPathAccent: "M12 6v8a4 4 0 0 1-6-3"
  },
  {
    letter: "K",
    title: "Peace Sign with Middle Thumb",
    tutorial: "Raise your index and middle fingers in a 'V' shape, then press your thumb tip directly against the middle joint of your raised index finger.",
    videoDescription: "High-definition alignment of the thumb stabilizing the middle of the upright fingers.",
    tips: "Tilt the middle finger slightly forward to emphasize the central thumb anchor point.",
    svgPathAccent: "M8 2v12M12 2v12M10 8l4 6"
  },
  {
    letter: "L",
    title: "The Classic Right Angle",
    tutorial: "Extend your index finger straight up and your thumb straight out to the side at a strict 90-degree angle, forming a literal 'L'.",
    videoDescription: "Clear static presentation of the L corner frame facing the screen.",
    tips: "Ensure your other three fingers remain curled into a tight fist in front of your palm.",
    svgPathAccent: "M6 2v10h8"
  },
  {
    letter: "M",
    title: "Three-Finger Canopy",
    tutorial: "Tuck your thumb between your ring and pinky fingers, then fold your index, middle, and ring fingers down over your thumb canopy.",
    videoDescription: "Demonstrates high-level thumb placement under three fingers in a downward drop.",
    tips: "Ensure three distinct finger curves are visible over the thumb to make it clear.",
    svgPathAccent: "M6 10c0-2 4-2 4 0v4M10 10c0-2 4-2 4 0v4"
  },
  {
    letter: "N",
    title: "Twin-Finger Canopy",
    tutorial: "Tuck your thumb between your middle and ring fingers, then drape your index and middle fingers over the top of the thumb.",
    videoDescription: "Drapes two fingers over a tucked thumb to outline the double hump.",
    tips: "Differentiate from M by keeping only the index and middle fingers draped. Ring and pinky must stay tucked.",
    svgPathAccent: "M8 10c0-2 3-2 3 0v4M11 10c0-2 3-2 3 0v4"
  },
  {
    letter: "O",
    title: "The Spyglass Circle",
    tutorial: "Curve all five fingers together in a tight, clean circular frame, touching all fingertips together to peer through a circle.",
    videoDescription: "Rotates the hand to show a perfect circular tube formed by all fingers.",
    tips: "Create a rounded scope. Do not flatten the circle, otherwise it loses clarity.",
    svgPathAccent: "M10 4a6 6 0 1 1 0 12a6 6 0 0 1 0-12"
  },
  {
    letter: "P",
    title: "Downward-Pointed K",
    tutorial: "Form the 'K' handshape (index and middle up/apart, thumb pointing to middle), then tilt your wrist down so the index finger points flat down.",
    videoDescription: "Shows a 90-degree downward rotation of the peaceful K-sign shape.",
    tips: "Keep your hand level at the wrist so the visual points downward rather than to the side.",
    svgPathAccent: "M8 12V2M11 8l4 4"
  },
  {
    letter: "Q",
    title: "Downward Pincher Claws",
    tutorial: "Form the 'G' horizontal pinch shape, then point both your index finger and thumb straight down toward the floor in parallel lines.",
    videoDescription: "Demonstrates dropping a pinch towards the ground as if measuring or pointing at a spot.",
    tips: "Maintain the 1-inch gap between index and thumb cleanly pointing downwards.",
    svgPathAccent: "M6 4v10M10 4v6"
  },
  {
    letter: "R",
    title: "Double Finger Twist Cross",
    tutorial: "Cross your middle finger tightly over the back of your index finger, while curling your other fingers securely into your palm with thumb overlay.",
    videoDescription: "Shows the index and middle fingers twisting around each other tightly representing binding or friendship.",
    tips: "The middle finger must cross in front/over. Keep them raised together.",
    svgPathAccent: "M8 2c2 1 2 5 0 8M10 2c-2 1-2 5 0 8"
  },
  {
    letter: "S",
    title: "Locked Fist Frame",
    tutorial: "Clench your hand into a tight fist and wrap your thumb horizontally across the front of your curled index and middle fingers.",
    videoDescription: "A protective solid fist starting from open hand to absolute closed core.",
    tips: "Keep your thumb flat against the middle of the fingers. Do not leave the thumb pointing outward.",
    svgPathAccent: "M6 6h8M6 10h8"
  },
  {
    letter: "T",
    title: "The Single Knuckle Hump",
    tutorial: "Tuck your thumb under your index finger only, and clench your other fingers down to form a single prominent knuckle canopy.",
    videoDescription: "Focuses on tucking the thumb between the index and middle finger with a neat fit.",
    tips: "Make sure the thumb peeks up between the index and middle finger loops.",
    svgPathAccent: "M8 6a2 2 0 1 1-2-2M10 10v4"
  },
  {
    letter: "U",
    title: "Joined Double Pillars",
    tutorial: "Extend your index and middle fingers straight up side-by-side, pressing them together securely, keeping your thumb flat against your folded palm.",
    videoDescription: "Presents two joined straight fingers rising as a single block.",
    tips: "Do not let any gap form between the index and middle fingers, or it might look like 'V'.",
    svgPathAccent: "M8 4v10M11 4v10"
  },
  {
    letter: "V",
    title: "Open Peace Sign",
    tutorial: "Extend your index and middle fingers straight up and separate them wide in a 'V' shape, while holding others closed with your thumb.",
    videoDescription: "Shows a classic crisp peace or victory sign facing front.",
    tips: "Keep the base clear and the fingers straight with wide separation.",
    svgPathAccent: "M6 4l4 10l4-10"
  },
  {
    letter: "W",
    title: "The Triple Fork",
    tutorial: "Extend your index, middle, and ring fingers straight up and spread them apart in a fork shape, while touching your thumb and pinky together.",
    videoDescription: "Rises three spread fingers forming a distinct letter W configuration.",
    tips: "Ensure the ring finger is fully extended to display three distinct pillars clearly.",
    svgPathAccent: "M4 4l3 10l3-8l3 8l3-10"
  },
  {
    letter: "X",
    title: "The Captain's Hook",
    tutorial: "Hold your index finger up and curve it halfway down into a rigid hook shape, keeping your remaining fingers clenched flat inside your palm.",
    videoDescription: "Curves the index finger down into a claw-like shape.",
    tips: "The index finger must form a rigid right angle, looking like an arch hook.",
    svgPathAccent: "M8 4c2-2 4 0 2 4l-4 4"
  },
  {
    letter: "Y",
    title: "The Call Me Wings",
    tutorial: "Extend your thumb and little pinky finger straight out wide in opposite directions, while keeping your middle three fingers folded closed.",
    videoDescription: "Shows a wide wingspan hand outline representing harmony or telephone.",
    tips: "Keep the center fingers pinned down flat to emphasize the wide outer wings.",
    svgPathAccent: "M4 6l6 6l6-6"
  },
  {
    letter: "Z",
    title: "Kinetic Z Scribe",
    tutorial: "Extend your index finger and trace the letter 'Z' in empty space in front of you—a horizontal stroke, a diagonal down, and a bottom horizontal.",
    videoDescription: "An active motion path tracing Z on the screen utilizing the index tip.",
    tips: "Delineate the three strokes clearly. It is a kinetic trace sign.",
    svgPathAccent: "M4 4h10l-10 8h10"
  }
];

export const BimAlphabetExplorer: React.FC<BimAlphabetExplorerProps> = ({
  onBack,
  onXpAdd,
  notify
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [videoSpeed, setVideoSpeed] = useState<"normal" | "slow">("normal");
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [masteredLetters, setMasteredLetters] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("bim_mastered_letters");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const activeLetter = ALPHABET_DATA[currentIndex];
  const isLetterMastered = masteredLetters.includes(activeLetter.letter);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % ALPHABET_DATA.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + ALPHABET_DATA.length) % ALPHABET_DATA.length);
  };

  const handleLetterClick = (idx: number) => {
    setCurrentIndex(idx);
    notify(`Switched to Letter ${ALPHABET_DATA[idx].letter}!`);
  };

  const toggleMastery = () => {
    let nextMastered: string[];
    if (isLetterMastered) {
      nextMastered = masteredLetters.filter(l => l !== activeLetter.letter);
      notify(`Removed Letter ${activeLetter.letter} from mastered list.`);
    } else {
      nextMastered = [...masteredLetters, activeLetter.letter];
      onXpAdd(5);
      notify(`🎉 Letter ${activeLetter.letter} mastered! +5 Study XP added to your streak!`);
    }

    setMasteredLetters(nextMastered);
    try {
      localStorage.setItem("bim_mastered_letters", JSON.stringify(nextMastered));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-32">
      {/* Educational Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#bec8cd]/40 pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 transition-all cursor-pointer"
            id="alphabet-back-btn"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-cyan-100 text-[#005a71] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest font-mono">
                BIM ACADEMY
              </span>
              <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                <span>{masteredLetters.length} / 26 Mastered</span>
              </span>
            </div>
            <h1 className="text-3xl font-black text-[#1a1c1d] tracking-tight mt-1">
              Interactive BIM Fingerspelling Portal
            </h1>
          </div>
        </div>

        {/* Dynamic mastery bar */}
        <div className="w-full md:w-56 space-y-1.5 shrink-0 bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div className="flex justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <span>Progress index</span>
            <span>{Math.round((masteredLetters.length / 26) * 100)}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-linear-to-r from-cyan-600 to-[#0e7490] transition-all duration-300"
              style={{ width: `${(masteredLetters.length / 26) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Grid of Alphabet Selector Buttons */}
      <div className="bg-white p-4 rounded-2xl border border-[#bec8cd]/50 shadow-xs">
        <p className="text-xs text-[#3f484c] mb-3.5 font-bold font-mono uppercase tracking-wider text-center md:text-left flex items-center justify-center md:justify-start gap-1.5">
          <Sparkles className="w-4 h-4 text-[#fe932c]" />
          <span>Fingerspelling Index Board (Select any letter to load)</span>
        </p>
        <div className="grid grid-cols-6 sm:grid-cols-9 md:grid-cols-13 gap-1.5">
          {ALPHABET_DATA.map((item, idx) => {
            const isSelected = currentIndex === idx;
            const isMastered = masteredLetters.includes(item.letter);
            return (
              <button
                key={item.letter}
                onClick={() => handleLetterClick(idx)}
                className={`p-3 rounded-xl font-black text-sm select-none transition-all duration-200 flex flex-col items-center justify-center relative cursor-pointer ${
                  isSelected 
                    ? "bg-[#005a71] text-white ring-4 ring-cyan-100" 
                    : isMastered
                    ? "bg-emerald-50 text-emerald-800 border-2 border-emerald-400/80 hover:bg-emerald-100/60"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200"
                }`}
              >
                <span>{item.letter}</span>
                {isMastered && !isSelected && (
                  <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-emerald-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Detailed interactive card view */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Video & Visual Simulation Component */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-lg relative aspect-video flex flex-col justify-between p-6">
            
            {/* Ambient visual overlay representing animated scanner frame */}
            <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/80 to-transparent p-4 flex justify-between items-center z-10">
              <span className="text-[10px] text-cyan-400 font-mono font-bold uppercase tracking-widest flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                HTML5 Video Loop Player
              </span>
              <div className="flex items-center gap-1.5 bg-black/60 px-2.5 py-1 rounded-md text-[10px] text-slate-300">
                <Video className="w-3.5 h-3.5 text-cyan-400" />
                <span>Simulation Active</span>
              </div>
            </div>

            {/* Playable video first, image fallback if both exist */}
            <div className="flex-1 flex flex-col items-center justify-center py-2 text-center relative overflow-hidden w-full h-full min-h-[220px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeLetter.letter}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  className="w-full h-full flex items-center justify-center p-1"
                >
                  {(() => {
                    const media = alphabetMedia[activeLetter.letter];
                    const embedUrl = media?.embed || (media?.youtube ? `https://www.youtube.com/embed/${media.youtube.split("youtu.be/")[1]?.split("?")[0]}` : undefined);
                    
                    if (embedUrl) {
                      return (
                        <div className="w-full h-full absolute inset-0 bg-black min-h-[200px]">
                          <iframe
                            src={embedUrl}
                            title={`BIM Letter Sign ${activeLetter.letter}`}
                            className="w-full h-full border-0 absolute inset-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                        </div>
                      );
                    } else if (media?.image) {
                      return (
                        <div className="relative w-full h-full flex flex-col items-center justify-center min-h-[160px] bg-slate-900/40 rounded-2xl p-4">
                          <img
                            src={media.image}
                            alt={`BIM Letter Sign ${activeLetter.letter}`}
                            className="max-h-[160px] md:max-h-[180px] object-contain rounded-xl opacity-95 filter brightness-105 border-4 border-white shadow-xl"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute top-2 right-2 scale-75 opacity-70 pointer-events-none bg-black/60 p-2 rounded-lg border border-white/10 hidden sm:block">
                            <svg className="w-10 h-10 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <circle cx="12" cy="12" r="10" stroke="#1e293b" className="opacity-40" />
                              <path d={activeLetter.svgPathAccent} stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                          <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-0.5 rounded text-[10px] text-amber-300 font-mono font-bold">
                            Official BIM Image
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div className="flex flex-col items-center justify-center">
                          <svg className="w-28 h-28 text-cyan-400 hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <circle cx="12" cy="12" r="10" stroke="#1e293b" className="opacity-40" />
                            <path d="M12 18V9" strokeDasharray="2 2" className="text-slate-500" />
                            <path d="M7 14h10" strokeDasharray="2 2" className="text-slate-500" />
                            <path d={activeLetter.svgPathAccent} stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse" />
                          </svg>
                          <h1 className="text-5xl font-black text-white mt-2 font-mono">{activeLetter.letter}</h1>
                        </div>
                      );
                    }
                  })()}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Bottom Playback status bar */}
            <div className="bg-black/40 backdrop-blur-md p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between gap-4">
              <button 
                onClick={() => {
                  setIsPlaying(!isPlaying);
                  notify(isPlaying ? "Video paused" : "Video playing loop...");
                }}
                className="text-white hover:text-cyan-400 cursor-pointer"
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
              </button>

              <div className="flex-1">
                <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden relative">
                  <div 
                    className={`h-full bg-cyan-400 rounded-full ${isPlaying ? (videoSpeed === "slow" ? "animate-[pulse_4s_infinite]" : "animate-[pulse_1.5s_infinite]") : ""}`}
                    style={{ width: isPlaying ? "75%" : "25%" }}
                  />
                </div>
              </div>

              <div className="flex gap-1.5">
                <button
                  onClick={() => {
                    setVideoSpeed("normal");
                    notify("Playback frame speed set to 1.0x (Normal)");
                  }}
                  className={`px-2 py-1 rounded text-[10px] font-bold ${videoSpeed === "normal" ? "bg-cyan-400 text-slate-950" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}
                >
                  1.0x
                </button>
                <button
                  onClick={() => {
                    setVideoSpeed("slow");
                    notify("Playback frame speed set to 0.5x (Slow Motion)");
                  }}
                  className={`px-2 py-1 rounded text-[10px] font-bold ${videoSpeed === "slow" ? "bg-cyan-400 text-slate-950" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}
                >
                  0.5x
                </button>
              </div>
            </div>

          </div>

          {/* Quick interactive note */}
          <div className="bg-cyan-50 border border-cyan-200 p-4 rounded-2xl flex items-start gap-3">
            <Clock className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
            <div className="text-xs text-left">
              <strong className="text-cyan-950 block mb-0.5 font-bold">Recommended Study Flow</strong>
              <p className="text-cyan-800 font-medium">
                Try switching the loop simulator to <span className="font-extrabold text-cyan-900 border-b border-cyan-300">Slow-Mo (0.5x)</span> to isolate the individual finger joint curls and wrist tilt points.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Step-by-Step Educational Card */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white rounded-3xl border border-[#bec8cd]/50 shadow-md p-6 sm:p-8 space-y-6 text-left">
            <div className="flex justify-between items-start gap-4 flex-wrap">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-cyan-800 bg-cyan-50 px-3 py-1 rounded-full">
                  Letter Shape Description
                </span>
                <h2 className="text-2xl font-black text-slate-900 mt-1.5 flex items-center gap-2">
                  <span>Representative:</span>
                  <span className="text-cyan-700 font-black font-mono text-3xl">"{activeLetter.letter}"</span>
                </h2>
              </div>
              
              {/* Mastery toggle button */}
              <button
                onClick={toggleMastery}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all select-none active:scale-95 cursor-pointer ${
                  isLetterMastered
                    ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300"
                }`}
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{isLetterMastered ? "Mastered (+5 XP)" : "Mark Learned"}</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider font-mono">
                  Concept Alias Name
                </h4>
                <p className="text-sm font-bold text-slate-800 mt-0.5">
                  {activeLetter.title}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider font-mono">
                  Step-by-Step Tutorial Guidelines
                </h4>
                <p className="text-xs font-semibold text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border-l-4 border-cyan-500 mt-1.5">
                  {activeLetter.tutorial}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider font-mono">
                  Video Simulation Reference
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed mt-1">
                  {activeLetter.videoDescription}
                </p>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <div className="flex items-start gap-2.5 bg-amber-50/70 border border-amber-200/50 p-3 rounded-xl text-xs">
                  <ThumbsUp className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-900 font-bold block mb-0.5">Expert Grammar Tip:</strong>
                    <span className="text-amber-800 font-medium">{activeLetter.tips}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex gap-4 pt-4 border-t border-slate-100">
              <button
                onClick={handlePrev}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold text-xs text-slate-700 active:scale-95 cursor-pointer select-none transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev Letter</span>
              </button>

              <button
                onClick={handleNext}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#005a71] hover:bg-[#0e7490] text-white font-extrabold text-xs active:scale-95 cursor-pointer shadow-sm select-none transition-all"
              >
                <span>Next Letter</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* Speed Quiz drill card trigger */}
      <div className="bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 rounded-3xl p-6 md:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="space-y-1.5 text-center md:text-left">
          <h3 className="text-lg font-black flex items-center justify-center md:justify-start gap-1.5 text-amber-300">
            <Award className="w-5 h-5" />
            Unleash Fingerspelling Speed!
          </h3>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed font-medium">
            Ready to trace your knowledge against live questions? Jump directly to the Speed Recognition hub to practice letters, words and full sentences with an active streak multiplier loop!
          </p>
        </div>
        <button
          onClick={onBack}
          className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-black px-6 py-4.5 rounded-xl transition-all shadow-md active:scale-95 shrink-0 select-none cursor-pointer"
        >
          PRACTICE HUB DRILL
        </button>
      </div>

    </div>
  );
};
