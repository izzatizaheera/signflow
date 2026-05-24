import { TopicNode, Quest, StreakBuddy, ToolkitPhrase, QuizQuestion, SignMedia, BimTutorial } from "./types";

// =========================================================================
// 🚀 BEGINNER EDUCATIONAL MEDIA PORTAL & CONFIGURATION GUIDE
// =========================================================================
// 💡 WHERE ARE THE SIGN URLS AND AVATAR IMAGES STORED?
//    They are stored here in `src/data.ts` as standard exported constants.
//
// 🔧 HOW TO REPLACE CHANNELS AND ASSETS LATER:
//    - To update an image, simply find the corresponding image variable (e.g. `needHelpImg`)
//      and swap out its string URL value.
//      - To add future BIM words, append them to `INITIAL_PHRASES` list and `BIM_TRANSLATION_MAP`.
//    - To replace media or embed video loops, change the `youtubeUrl` inside the corresponding Media object properties.
// =========================================================================

// High-definition learning avatar images
export const alexAvatar = "https://i.pinimg.com/1200x/58/7a/5d/587a5da410420abe2e54b5ed9f605665.jpg";
export const sarahAvatar = "https://i.pinimg.com/1200x/16/93/9d/16939d659f92b59f707bf54d409435eb.jpg";
export const jordanAvatar = "https://i.pinimg.com/736x/81/c8/87/81c887373dedb752c8067edebbf87f10.jpg";
export const elenaAvatar = "https://i.pinimg.com/736x/f7/d8/f2/f7d8f2df2827bd6f8e0e95b12434ceab.jpg";

// Standard BIM Sign media assets
export const needHelpImg = "https://images.bimsignbank.org/vocab/Tolong%20(Bantu).webp";
export const helloImg = "https://images.bimsignbank.org/vocab/Hai%2C%20Hello.webp";
export const thankYouImg = "https://images.bimsignbank.org/vocab/Terima%20Kasih.webp";
export const whatImg = "https://images.bimsignbank.org/vocab/Apa.webp";
export const pleaseImg = "https://images.bimsignbank.org/vocab/Sila%20(Mempersilakan).webp";
export const practiceImg = "https://images.bimsignbank.org/vocab/A.webp";
export const welcomeImg = "https://images.bimsignbank.org/vocab/Selamat%20Datang.webp";
export const toiletImg = "https://images.bimsignbank.org/vocab/Tandas.webp";
export const whereImg = "https://images.bimsignbank.org/vocab/Mana.webp";
export const emergencyImg = "https://images.bimsignbank.org/vocab/Kecemasan.webp";
export const hospitalImg = "https://images.bimsignbank.org/vocab/Hospital.webp";
export const policeImg = "https://images.bimsignbank.org/vocab/Polis.webp";
export const restaurantImg = "https://images.bimsignbank.org/vocab/Restoran.webp";
export const callImg = "https://images.bimsignbank.org/vocab/Telefon.webp";
export const whenImg = "https://images.bimsignbank.org/vocab/Bila.webp";
export const ituImg = "https://images.bimsignbank.org/vocab/Itu.webp";
export const whereIsImg = "https://images.bimsignbank.org/vocab/Mana.webp";
export const slowlyPleaseImg = "https://images.bimsignbank.org/vocab/Sila%20(Mempersilakan).webp";

export function convertYoutubeToEmbed(youtubeUrl?: string): string {
  if (!youtubeUrl) return "";
  let videoId = "";
  if (youtubeUrl.includes("youtu.be/")) {
    videoId = youtubeUrl.split("youtu.be/")[1]?.split("?")[0] || "";
  } else if (youtubeUrl.includes("watch?v=")) {
    videoId = youtubeUrl.split("watch?v=")[1]?.split("&")[0] || "";
  } else if (youtubeUrl.includes("embed/")) {
    videoId = youtubeUrl.split("embed/")[1]?.split("?")[0] || "";
  }
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}`;
  }
  return youtubeUrl;
}

// Media Object Definitions
export const needHelpMedia: SignMedia = { title: "Help", word: "Help", imageUrl: needHelpImg, youtubeUrl: "https://youtu.be/NV1FIqb3k-0", embedUrl: convertYoutubeToEmbed("https://youtu.be/NV1FIqb3k-0"), sourceUrl: "https://bimsignbank.org/groups/general/search/Tolong" };
export const helloMedia: SignMedia = { title: "Hello", word: "Hello", imageUrl: helloImg, youtubeUrl: "https://youtu.be/J3Yts6SKxOQ", embedUrl: convertYoutubeToEmbed("https://youtu.be/J3Yts6SKxOQ"), sourceUrl: "https://bimsignbank.org/groups/general/search/Hello" };
export const thankYouMedia: SignMedia = { title: "Thank You", word: "Thank You", imageUrl: thankYouImg, youtubeUrl: "https://youtu.be/uQiZ5mBhers", embedUrl: convertYoutubeToEmbed("https://youtu.be/uQiZ5mBhers"), sourceUrl: "https://bimsignbank.org/groups/general/search/Terima%20Kasih" };
export const whatMedia: SignMedia = { title: "What", word: "What", imageUrl: whatImg, youtubeUrl: "https://youtu.be/08zGcmBg824", embedUrl: convertYoutubeToEmbed("https://youtu.be/08zGcmBg824"), sourceUrl: "https://bimsignbank.org/groups/general/search/Apa" };
export const pleaseMedia: SignMedia = { title: "Please", word: "Please", imageUrl: pleaseImg, youtubeUrl: "https://youtu.be/tqrmhLXW-sg", embedUrl: convertYoutubeToEmbed("https://youtu.be/tqrmhLXW-sg"), sourceUrl: "https://bimsignbank.org/groups/general/search/Sila" };
export const welcomeMedia: SignMedia = { title: "Welcome", word: "Welcome", imageUrl: welcomeImg, sourceUrl: "https://bimsignbank.org/groups/general/search/Selamat%20Datang" };
export const toiletMedia: SignMedia = { title: "Toilet", word: "Toilet", imageUrl: toiletImg, sourceUrl: "https://bimsignbank.org/groups/general/search/Tondas" };
export const whereMedia: SignMedia = { title: "Where", word: "Where", imageUrl: whereImg, sourceUrl: "https://bimsignbank.org/groups/general/search/Di%20Mana" };
export const emergencyMedia: SignMedia = { title: "Emergency", word: "Emergency", imageUrl: emergencyImg, sourceUrl: "https://bimsignbank.org/groups/general/search/Kecemasan" };
export const hospitalMedia: SignMedia = { title: "Hospital", word: "Hospital", imageUrl: hospitalImg, sourceUrl: "https://bimsignbank.org/groups/general/search/Hospital" };
export const policeMedia: SignMedia = { title: "Police", word: "Police", imageUrl: policeImg, sourceUrl: "https://bimsignbank.org/groups/general/search/Polis" };
export const restaurantMedia: SignMedia = { title: "Restaurant", word: "Restaurant", imageUrl: restaurantImg, sourceUrl: "https://bimsignbank.org/groups/general/search/Restoran" };
export const callMedia: SignMedia = { title: "Call", word: "Call", imageUrl: callImg, sourceUrl: "https://bimsignbank.org/groups/general/search/Telefon" };
export const whenMedia: SignMedia = { title: "When", word: "When", imageUrl: whenImg, sourceUrl: "https://bimsignbank.org/groups/general/search/Bila" };
export const ituMedia: SignMedia = { title: "Itu", word: "Itu", imageUrl: ituImg, sourceUrl: "https://bimsignbank.org/groups/general/search/Itu" };

export const bimMediaMap: Record<string, { imageUrl?: string; youtubeUrl?: string; sourceUrl?: string; }> = {
  apa: { imageUrl: "https://images.bimsignbank.org/vocab/Apa.webp", youtubeUrl: "https://youtu.be/08zGcmBg824", sourceUrl: "https://bimsignbank.org/groups/general/search/Apa" },
  tandas: { imageUrl: "https://images.bimsignbank.org/vocab/Tandas.webp", sourceUrl: "https://bimsignbank.org/groups/general/search/Tandas" },
  telefon: { imageUrl: "https://images.bimsignbank.org/vocab/Telefon.webp", sourceUrl: "https://bimsignbank.org/groups/general/search/Telefon" },
  restoran: { imageUrl: "https://images.bimsignbank.org/vocab/Restoran.webp", sourceUrl: "https://bimsignbank.org/groups/general/search/Restoran" },
  mana: { imageUrl: "https://images.bimsignbank.org/vocab/Mana.webp", sourceUrl: "https://bimsignbank.org/groups/general/search/Di%20Mana" },
  bila: { imageUrl: "https://images.bimsignbank.org/vocab/Bila.webp", sourceUrl: "https://bimsignbank.org/groups/general/search/Bila" },
  tolong: { imageUrl: "https://images.bimsignbank.org/vocab/Tolong%20(Bantu).webp", youtubeUrl: "https://youtu.be/NV1FIqb3k-0", sourceUrl: "https://bimsignbank.org/groups/general/search/Tolong" },
  "di mana": {
    imageUrl: "https://images.bimsignbank.org/vocab/Mana.webp",
    sourceUrl: "https://images.bimsignbank.org/groups/conversation/question/Where"
  }
};

export const verifiedBimTutorials: Record<string, BimTutorial> = {
  apa: {
    english: "what",
    malay: "apa",
    imageUrl: "https://images.bimsignbank.org/vocab/Apa.webp",
    youtubeUrl: "https://youtu.be/08zGcmBg824",
    sourceUrl: "https://bimsignbank.org/groups/general/search/Apa",
    explanation: "Standard question marker for 'what' query. Signed with index finger pointing upwards and wiggled."
  },
  tandas: {
    english: "toilet",
    malay: "tandas",
    imageUrl: "https://images.bimsignbank.org/vocab/Tandas.webp",
    sourceUrl: "https://bimsignbank.org/groups/general/search/Tandas",
    explanation: "Signed by spelling/shaking letter 'T' gesture side to side cleanly."
  },
  telefon: {
    english: "call",
    malay: "telefon",
    imageUrl: "https://images.bimsignbank.org/vocab/Telefon.webp",
    sourceUrl: "https://bimsignbank.org/groups/general/search/Telefon",
    explanation: "Signed with thumb and pinky extended, placing receive shape near ear."
  },
  restoran: {
    english: "restaurant",
    malay: "restoran",
    imageUrl: "https://images.bimsignbank.org/vocab/Restoran.webp",
    sourceUrl: "https://bimsignbank.org/groups/general/search/Restoran",
    explanation: "Politely raise and wave letter 'R' sign shape near sides of lips."
  },
  bila: {
    english: "when",
    malay: "bila",
    imageUrl: "https://images.bimsignbank.org/vocab/Bila.webp",
    sourceUrl: "https://bimsignbank.org/groups/general/search/Bila",
    explanation: "Standard question marker for 'when' queries."
  },
  "di mana": {
    english: "where",
    malay: "di mana",
    imageUrl: "https://images.bimsignbank.org/vocab/Mana.webp",
    sourceUrl: "https://bimsignbank.org/groups/general/search/Di%20Mana",
    explanation: "Open palms face upward, shift left and right questioning location."
  },
  tolong: {
    english: "help",
    malay: "tolong",
    imageUrl: "https://images.bimsignbank.org/vocab/Tolong%20(Bantu).webp",
    youtubeUrl: "https://youtu.be/NV1FIqb3k-0",
    sourceUrl: "https://bimsignbank.org/groups/general/search/Tolong",
    explanation: "Fist thumb-up rest on top of flat open palm lifting upwards together."
  }
};

export const getVerifiedBimTutorial = (input: string): BimTutorial | null => {
  if (!input) return null;
  const clean = input.toLowerCase().trim();
  
  // Try directly as Malay key
  if (verifiedBimTutorials[clean]) {
    return verifiedBimTutorials[clean];
  }
  
  // Try finding by English or Malay match
  for (const key of Object.keys(verifiedBimTutorials)) {
    const tutorial = verifiedBimTutorials[key];
    if (tutorial.english.toLowerCase() === clean || tutorial.malay.toLowerCase() === clean) {
      return tutorial;
    }
  }
  
  // Try sub-word contains match
  for (const key of Object.keys(verifiedBimTutorials)) {
    const tutorial = verifiedBimTutorials[key];
    if (clean.includes(tutorial.english.toLowerCase()) || clean.includes(tutorial.malay.toLowerCase())) {
      return tutorial;
    }
  }
  
  return null;
};

export const BIM_TRANSLATION_MAP: Record<string, SignMedia> = {
  "apa": { title: "Apa", word: "apa", ...bimMediaMap.apa, embedUrl: convertYoutubeToEmbed(bimMediaMap.apa.youtubeUrl) },
  "tandas": { title: "Tandas", word: "tandas", ...bimMediaMap.tandas },
  "telefon": { title: "Telefon", word: "telefon", ...bimMediaMap.telefon },
  "restoran": { title: "Restoran", word: "restoran", ...bimMediaMap.restoran },
  "mana": { title: "Mana", word: "mana", ...bimMediaMap.mana },
  "bila": { title: "Bila", word: "bila", ...bimMediaMap.bila },
  "tolong": { title: "Tolong", word: "tolong", ...bimMediaMap.tolong, embedUrl: convertYoutubeToEmbed(bimMediaMap.tolong.youtubeUrl) },
  "itu": { title: "Itu", word: "Itu", imageUrl: ituImg, sourceUrl: "https://bimsignbank.org/groups/general/search/Itu" },
  "help": needHelpMedia,
  "hello": helloMedia,
  "thank you": thankYouMedia,
  "thankyou": thankYouMedia,
  "what": whatMedia,
  "please": pleaseMedia,
  "welcome": welcomeMedia,
  "toilet": toiletMedia,
  "where": whereMedia,
  "emergency": emergencyMedia,
  "hospital": hospitalMedia,
  "police": policeMedia,
  "restaurant": restaurantMedia,
  "call": callMedia,
  "when": whenMedia,
  "hai": helloMedia,
  "terima kasih": thankYouMedia,
  "sila": pleaseMedia,
  "selamat datang": welcomeMedia,
  "di mana": whereMedia,
  "kecemasan": emergencyMedia,
  "hospital_malay": hospitalMedia,
  "polis": policeMedia
};

export const bimMalayMap: Record<string, string> = {
  "hello": "hai",
  "thank you": "terima kasih",
  "thankyou": "terima kasih",
  "help": "tolong",
  "what": "apa",
  "toilet": "tandas",
  "where": "di mana",
  "when": "bila",
  "please": "sila",
  "welcome": "selamat datang",
  "hospital": "hospital",
  "police": "polis",
  "emergency": "kecemasan",
  "restaurant": "restoran",
  "call": "telefon",
  "itu": "itu",
  "water": "air",
  "eat": "makan",
  "drink": "minum",
  "friend": "kawan",
  "family": "keluarga"
};

export const translateEnglishToMalay = (input: string): { translated: string; keywords: string[] } => {
  const normalized = (input || "").toLowerCase().trim();
  if (bimMalayMap[normalized]) {
    const malayVal = bimMalayMap[normalized];
    return { translated: malayVal, keywords: [malayVal] };
  }
  const cleanInput = normalized.replace(/[?.,!]/g, " ").replace(/\s+/g, " ").trim();
  const words = cleanInput.split(" ");
  const translatedWords: string[] = [];
  const keywords: string[] = [];
  let i = 0;
  while (i < words.length) {
    if (words[i] === "") { i++; continue; }
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
    const single = words[i];
    if (bimMalayMap[single]) {
      const translatedWord = bimMalayMap[single];
      translatedWords.push(translatedWord);
      keywords.push(translatedWord);
    } else {
      translatedWords.push(single);
    }
    i++;
  }
  const translatedStr = translatedWords.join(" ");
  const formattedTranslated = translatedStr.charAt(0).toUpperCase() + translatedStr.slice(1);
  return { translated: formattedTranslated || input, keywords: keywords };
};

export const findMatchingMedia = (phraseText: string, glossText: string = "") => {
  const cleanInput = (phraseText || "").toLowerCase().trim();
  const translationInfo = translateEnglishToMalay(cleanInput);
  const normMalay = translationInfo.translated.toLowerCase().trim();
  if (BIM_TRANSLATION_MAP[normMalay]) {
    const media = BIM_TRANSLATION_MAP[normMalay];
    return { media: { ...media, embedUrl: convertYoutubeToEmbed(media.youtubeUrl || media.embedUrl) }, word: normMalay, translation: translationInfo };
  }
  for (const kw of translationInfo.keywords) {
    const kwNorm = kw.trim().toLowerCase();
    if (BIM_TRANSLATION_MAP[kwNorm]) {
      const media = BIM_TRANSLATION_MAP[kwNorm];
      return { media: { ...media, embedUrl: convertYoutubeToEmbed(media.youtubeUrl || media.embedUrl) }, word: kwNorm, translation: translationInfo };
    }
  }
  if (BIM_TRANSLATION_MAP[cleanInput]) {
    const media = BIM_TRANSLATION_MAP[cleanInput];
    return { media: { ...media, embedUrl: convertYoutubeToEmbed(media.youtubeUrl || media.embedUrl) }, word: cleanInput, translation: translationInfo };
  }
  const normGloss = (glossText || "").toLowerCase().trim();
  if (BIM_TRANSLATION_MAP[normGloss]) {
    const media = BIM_TRANSLATION_MAP[normGloss];
    return { media: { ...media, embedUrl: convertYoutubeToEmbed(media.youtubeUrl || media.embedUrl) }, word: normGloss, translation: translationInfo };
  }
  for (const key of Object.keys(BIM_TRANSLATION_MAP)) {
    if (normGloss.includes(key)) {
      const media = BIM_TRANSLATION_MAP[key];
      return { media: { ...media, embedUrl: convertYoutubeToEmbed(media.youtubeUrl || media.embedUrl) }, word: key, translation: translationInfo };
    }
  }
  return { media: null, word: cleanInput, translation: translationInfo };
};

export const alphabetMedia: Record<string, { imageUrl: string; image: string; youtubeUrl?: string; youtube?: string; embedUrl?: string; embed?: string; sourceUrl: string; source: string; }> = {
  A: { imageUrl: "https://images.bimsignbank.org/vocab/A.webp", image: "https://images.bimsignbank.org/vocab/A.webp", youtubeUrl: "https://youtu.be/mrtQKEIWYqc", youtube: "https://youtu.be/mrtQKEIWYqc", embedUrl: "https://www.youtube.com/embed/mrtQKEIWYqc", embed: "https://www.youtube.com/embed/mrtQKEIWYqc", sourceUrl: "https://bimsignbank.org/groups/general/alphabets/A", source: "https://bimsignbank.org/groups/general/alphabets/A" },
  B: { imageUrl: "https://images.bimsignbank.org/vocab/B.webp", image: "https://images.bimsignbank.org/vocab/B.webp", youtubeUrl: "https://youtu.be/LdM4S6BST0g", youtube: "https://youtu.be/LdM4S6BST0g", embedUrl: "https://www.youtube.com/embed/LdM4S6BST0g", embed: "https://www.youtube.com/embed/LdM4S6BST0g", sourceUrl: "https://bimsignbank.org/groups/general/alphabets/B", source: "https://bimsignbank.org/groups/general/alphabets/B" },
  C: { imageUrl: "https://images.bimsignbank.org/vocab/C.webp", image: "https://images.bimsignbank.org/vocab/C.webp", sourceUrl: "https://bimsignbank.org/groups/general/alphabets/C", source: "https://bimsignbank.org/groups/general/alphabets/C" },
  D: { imageUrl: "https://images.bimsignbank.org/vocab/D.webp", image: "https://images.bimsignbank.org/vocab/D.webp", sourceUrl: "https://bimsignbank.org/groups/general/alphabets/D", source: "https://bimsignbank.org/groups/general/alphabets/D" },
  E: { imageUrl: "https://images.bimsignbank.org/vocab/E.webp", image: "https://images.bimsignbank.org/vocab/E.webp", sourceUrl: "https://bimsignbank.org/groups/general/alphabets/E", source: "https://bimsignbank.org/groups/general/alphabets/E" },
  F: { imageUrl: "https://images.bimsignbank.org/vocab/F.webp", image: "https://images.bimsignbank.org/vocab/F.webp", sourceUrl: "https://bimsignbank.org/groups/general/alphabets/F", source: "https://bimsignbank.org/groups/general/alphabets/F" },
  G: { imageUrl: "https://images.bimsignbank.org/vocab/G.webp", image: "https://images.bimsignbank.org/vocab/G.webp", sourceUrl: "https://bimsignbank.org/groups/general/alphabets/G", source: "https://bimsignbank.org/groups/general/alphabets/G" },
  H: { imageUrl: "https://images.bimsignbank.org/vocab/H.webp", image: "https://images.bimsignbank.org/vocab/H.webp", sourceUrl: "https://bimsignbank.org/groups/general/alphabets/H", source: "https://bimsignbank.org/groups/general/alphabets/H" },
  I: { imageUrl: "https://images.bimsignbank.org/vocab/I.webp", image: "https://images.bimsignbank.org/vocab/I.webp", sourceUrl: "https://bimsignbank.org/groups/general/alphabets/I", source: "https://bimsignbank.org/groups/general/alphabets/I" },
  J: { imageUrl: "https://images.bimsignbank.org/vocab/J.webp", image: "https://images.bimsignbank.org/vocab/J.webp", sourceUrl: "https://bimsignbank.org/groups/general/alphabets/J", source: "https://bimsignbank.org/groups/general/alphabets/J" },
  K: { imageUrl: "https://images.bimsignbank.org/vocab/K.webp", image: "https://images.bimsignbank.org/vocab/K.webp", sourceUrl: "https://bimsignbank.org/groups/general/alphabets/K", source: "https://bimsignbank.org/groups/general/alphabets/K" },
  L: { imageUrl: "https://images.bimsignbank.org/vocab/L.webp", image: "https://images.bimsignbank.org/vocab/L.webp", sourceUrl: "https://bimsignbank.org/groups/general/alphabets/L", source: "https://bimsignbank.org/groups/general/alphabets/L" },
  M: { imageUrl: "https://images.bimsignbank.org/vocab/M.webp", image: "https://images.bimsignbank.org/vocab/M.webp", sourceUrl: "https://bimsignbank.org/groups/general/alphabets/M", source: "https://bimsignbank.org/groups/general/alphabets/M" },
  N: { imageUrl: "https://images.bimsignbank.org/vocab/N.webp", image: "https://images.bimsignbank.org/vocab/N.webp", sourceUrl: "https://bimsignbank.org/groups/general/alphabets/N", source: "https://bimsignbank.org/groups/general/alphabets/N" },
  O: { imageUrl: "https://images.bimsignbank.org/vocab/O.webp", image: "https://images.bimsignbank.org/vocab/O.webp", sourceUrl: "https://bimsignbank.org/groups/general/alphabets/O", source: "https://bimsignbank.org/groups/general/alphabets/O" },
  P: { imageUrl: "https://images.bimsignbank.org/vocab/P.webp", image: "https://images.bimsignbank.org/vocab/P.webp", sourceUrl: "https://bimsignbank.org/groups/general/alphabets/P", source: "https://bimsignbank.org/groups/general/alphabets/P" },
  Q: { imageUrl: "https://images.bimsignbank.org/vocab/Q.webp", image: "https://images.bimsignbank.org/vocab/Q.webp", sourceUrl: "https://bimsignbank.org/groups/general/alphabets/Q", source: "https://bimsignbank.org/groups/general/alphabets/Q" },
  R: { imageUrl: "https://images.bimsignbank.org/vocab/R.webp", image: "https://images.bimsignbank.org/vocab/R.webp", sourceUrl: "https://bimsignbank.org/groups/general/alphabets/R", source: "https://bimsignbank.org/groups/general/alphabets/R" },
  S: { imageUrl: "https://images.bimsignbank.org/vocab/S.webp", image: "https://images.bimsignbank.org/vocab/S.webp", sourceUrl: "https://bimsignbank.org/groups/general/alphabets/S", source: "https://bimsignbank.org/groups/general/alphabets/S" },
  T: { imageUrl: "https://images.bimsignbank.org/vocab/T.webp", image: "https://images.bimsignbank.org/vocab/T.webp", sourceUrl: "https://bimsignbank.org/groups/general/alphabets/T", source: "https://bimsignbank.org/groups/general/alphabets/T" },
  U: { imageUrl: "https://images.bimsignbank.org/vocab/U.webp", image: "https://images.bimsignbank.org/vocab/U.webp", sourceUrl: "https://bimsignbank.org/groups/general/alphabets/U", source: "https://bimsignbank.org/groups/general/alphabets/U" },
  V: { imageUrl: "https://images.bimsignbank.org/vocab/V.webp", image: "https://images.bimsignbank.org/vocab/V.webp", sourceUrl: "https://bimsignbank.org/groups/general/alphabets/V", source: "https://bimsignbank.org/groups/general/alphabets/V" },
  W: { imageUrl: "https://images.bimsignbank.org/vocab/W.webp", image: "https://images.bimsignbank.org/vocab/W.webp", sourceUrl: "https://bimsignbank.org/groups/general/alphabets/W", source: "https://bimsignbank.org/groups/general/alphabets/W" },
  X: { imageUrl: "https://images.bimsignbank.org/vocab/X.webp", image: "https://images.bimsignbank.org/vocab/X.webp", sourceUrl: "https://bimsignbank.org/groups/general/alphabets/X", source: "https://bimsignbank.org/groups/general/alphabets/X" },
  Y: { imageUrl: "https://images.bimsignbank.org/vocab/Y.webp", image: "https://images.bimsignbank.org/vocab/Y.webp", sourceUrl: "https://bimsignbank.org/groups/general/alphabets/Y", source: "https://bimsignbank.org/groups/general/alphabets/Y" },
  Z: { imageUrl: "https://images.bimsignbank.org/vocab/Z.webp", image: "https://images.bimsignbank.org/vocab/Z.webp", sourceUrl: "https://bimsignbank.org/groups/general/alphabets/Z", source: "https://bimsignbank.org/groups/general/alphabets/Z" }
};

export const INITIAL_TOPICS: TopicNode[] = [
  { id: "1", title: "Unit 1: Alphabet", description: "Master BIM single and double-handed A–Z letter shapes and beginner finger spelling.", status: "active", pointsValue: 15 },
  { id: "2", title: "Unit 2: Common Daily Words", description: "Learn BIM 'Hello', 'Thank You' (Terima Kasih), 'Please', 'Sorry', 'Friend', 'Family', 'Where', and 'Help'.", status: "active", pointsValue: 15 },
  { id: "3", title: "Unit 3: Emergency Signs", description: "Express vital needs: 'Help', 'Hospital', 'Police', 'Danger', 'Emergency', 'Call', and 'Toilet' in BIM.", status: "active", pointsValue: 20 },
  { id: "4", title: "Unit 4: Food & Drink Ordering", description: "Dine out smoothly: 'Eat', 'Drink', 'Water', 'Rice', 'Chicken', 'Delicious', 'Bill', and 'Restaurant'.", status: "active", pointsValue: 20 },
  { id: "5", title: "Unit 5: Professional Sign Language", description: "Office & school conversation: 'Meeting', 'Work', 'Teacher', 'Student', 'Computer', and 'cooperation'.", status: "active", pointsValue: 25 },
];

export const INITIAL_QUESTS: Quest[] = [
  { id: "q1", title: "Complete 1 Receptive Lesson", description: "Practice your listening vocabulary with standard BIM receptive quizzes.", progress: 0, target: 1, xpWorth: 15, collected: false, type: "daily" },
  { id: "q2", title: "Earn 50 XP", description: "Practice consecutive BIM words to pile up experience points.", progress: 20, target: 50, xpWorth: 10, collected: false, type: "daily" },
  { id: "q3", title: "Sign 'Terima Kasih' to a teammate", description: "Practice showing appreciation with flat-hand chin swipe motion.", progress: 1, target: 1, xpWorth: 10, collected: true, type: "daily" },
  { id: "q4", title: "Send a friendly Nudge", description: "Remind your streak buddies to keep practicing their Malaysian Sign Language today.", progress: 0, target: 1, xpWorth: 15, collected: false, type: "friend" },
  { id: "q5", title: "Collective BIM Mastery", description: "Accumulate total streak days with your peer group.", progress: 80, target: 100, xpWorth: 30, collected: false, type: "friend" },
];

export const INITIAL_BUDDIES: StreakBuddy[] = [
  { id: "b1", name: "Sarah K.", avatar: sarahAvatar, streakDays: 15, nudged: false },
  { id: "b2", name: "Jordan M.", avatar: jordanAvatar, streakDays: 8, nudged: false },
  { id: "b3", name: "Elena R.", avatar: elenaAvatar, streakDays: 12, nudged: false },
];

export const INITIAL_PHRASES: ToolkitPhrase[] = [
  { id: "bim_alphabet", phrase: "A–Z Hand Signs", description: "Learn standard single-handed manual alphabet shapes. Useful for fingerspelling names and locations across Malaysia.", image: practiceImg, category: "Basic Conversation" },
  { id: "bim_hello", phrase: "Hello (Hai)", description: "Raise open palm and wave from the side of the head. Keep a smiling, warm facial expression to greet friends.", image: helloImg, imageUrl: helloImg, youtubeUrl: "https://youtu.be/J3Yts6SKxOQ", embedUrl: "https://www.youtube.com/embed/J3Yts6SKxOQ", title: "Hello", sourceUrl: "https://bimsignbank.org/groups/general/search/Hello", category: "Basic Conversation" },
  { id: "bim_thank_you", phrase: "Thank You (Terima Kasih)", description: "Touch flat dominant hand fingers politely to your chin, then move the hand downward and outward toward the recipient.", image: thankYouImg, imageUrl: thankYouImg, youtubeUrl: "https://youtu.be/uQiZ5mBhers", embedUrl: "https://www.youtube.com/embed/uQiZ5mBhers", title: "Thank You", sourceUrl: "https://bimsignbank.org/groups/general/search/Terima%20Kasih", category: "Basic Conversation" },
  { id: "bim_please", phrase: "Please (Sila)", description: "Place your flat open hand over the center of your chest and sweep it downward gently in a welcoming gesture.", image: pleaseImg, imageUrl: pleaseImg, youtubeUrl: "https://youtu.be/tqrmhLXW-sg", embedUrl: "https://www.youtube.com/embed/tqrmhLXW-sg", title: "Please", sourceUrl: "https://bimsignbank.org/groups/general/search/Sila", category: "Basic Conversation" },
  { id: "bim_what", phrase: "What? (Apa?)", description: "Raise your dominant index finger vertically and wiggle it side to side with a questioning shoulder shrug and focused eyes.", image: whatImg, imageUrl: whatImg, youtubeUrl: "https://youtu.be/08zGcmBg824", embedUrl: "https://www.youtube.com/embed/08zGcmBg824", title: "What", sourceUrl: "https://bimsignbank.org/groups/general/search/Apa", category: "Basic Conversation" },
  { id: "bim_sorry", phrase: "Sorry (Maaf)", description: "Make a closed fist and rub it in a gentle circular motion over your heart, wearing a sincere apologetic expression.", image: needHelpImg, category: "Basic Conversation" },
  { id: "bim_friend", phrase: "Friend (Kawan)", description: "Interlock your dominant and non-dominant index fingers together in a warm clasp, symbolizing mutual trust and support.", image: practiceImg, category: "Social" },
  { id: "bim_family", phrase: "Family (Keluarga)", description: "Form the 'K' handshape with both thumbs and index fingers, drawing a horizontal circle starting from the front to loop back.", image: practiceImg, category: "Social" },
  { id: "bim_where", phrase: "Where? (Mana?)", description: "Extend both hands forward with open palms facing upward, gently shifting them side to side with a questioning facial focus.", image: whereImg, imageUrl: whereImg, sourceUrl: "https://bimsignbank.org/groups/general/search/Di%20Mana", category: "Basic Conversation" },
  { id: "bim_help", phrase: "Help (Tolong)", description: "Place your dominant hand's closed fist (thumb pointing up) on top of the flat open palm of your non-dominant hand, and lift together.", image: needHelpImg, imageUrl: needHelpImg, youtubeUrl: "https://youtu.be/NV1FIqb3k-0", embedUrl: "https://www.youtube.com/embed/NV1FIqb3k-0", title: "Help", sourceUrl: "https://bimsignbank.org/groups/general/search/Tolong", category: "Emergency", isNew: true },
  { id: "bim_hospital", phrase: "Hospital (Hospital)", description: "Trace a small cross symbol (+) on your outer left shoulder using the index and middle fingers of your right hand.", image: hospitalImg, imageUrl: hospitalImg, sourceUrl: "https://bimsignbank.org/groups/general/search/Hospital", category: "Emergency" },
  { id: "bim_police", phrase: "Police (Polis)", description: "Place your index and middle fingers together and touch the side of your forehead, indicating the classic Malaysian authority cap or salute.", image: policeImg, imageUrl: policeImg, sourceUrl: "https://bimsignbank.org/groups/general/search/Polis", category: "Emergency" },
  { id: "bim_danger", phrase: "Danger (Bahaya)", description: "Cross both wrists sharply in front of your chest with hands open, making a high-alert warning facial expression.", image: slowlyPleaseImg, category: "Emergency" },
  { id: "bim_emergency", phrase: "Emergency (Kecemasan)", description: "Wave both hands outwards in a rhythmic, alternating caution motion to alert of rapid warning or hazard status.", image: emergencyImg, imageUrl: emergencyImg, sourceUrl: "https://bimsignbank.org/groups/general/search/Kecemasan", category: "Emergency" },
  { id: "bim_call", phrase: "Call (Hubungi)", description: "Extend your thumb and pinky finger from a closed fist, place near your ear like a telephone receiver, and direct outward.", image: whereIsImg, category: "Emergency" },
  { id: "bim_toilet", phrase: "Toilet (Tandas)", description: "Form a fist with your thumb tucked between your index and middle fingers (the letter 'T'), and shake it side-to-side.", image: toiletImg, imageUrl: toiletImg, sourceUrl: "https://bimsignbank.org/groups/general/search/Tandas", category: "Daily Life" },
  { id: "bim_eat", phrase: "Eat (Makan)", description: "Form a flat 'O' handshape with your fingertips touching together, and gently bring it near your open mouth twice.", image: practiceImg, category: "Daily Life" },
  { id: "bim_drink", phrase: "Drink (Minum)", description: "Mime holding a small glass or cup with your fingers and tilt your hand toward your mouth, mimicking drinking liquid.", image: practiceImg, category: "Daily Life" },
  { id: "bim_water", phrase: "Water (Air)", description: "Form a 'W' handshape (extend index, middle, and ring fingers) and tap your chin twice with your index finger.", image: practiceImg, category: "Daily Life" },
  { id: "bim_rice", phrase: "Rice (Nasi)", description: "Hold your non-dominant hand curved like a rice bowl and use your dominant hand's fingers to mime scoop eating gestures.", image: practiceImg, category: "Daily Life" },
  { id: "bim_chicken", phrase: "Chicken (Ayam)", description: "Touch your thumb and index finger together near your mouth twice to simulate a pecking chick beak movement.", image: practiceImg, category: "Daily Life" },
  { id: "bim_delicious", phrase: "Delicious (Sedap)", description: "Bring your fingertips together and kiss them lightly outward, or swipe your main hand down your cheek with a satisfied smile.", image: slowlyPleaseImg, category: "Daily Life" },
  { id: "bim_bill", phrase: "Bill Check (Kira / Bil)", description: "Draw a small rectangle box in the air, or mime sliding pen lines on your palm to ask for the restaurant tab.", image: practiceImg, category: "Daily Life" },
  { id: "bim_restaurant", phrase: "Restaurant (Restoran)", description: "Form the letter 'R' and move it in a polite wave near the right and left sides of your lips.", image: whereIsImg, category: "Daily Life" },
  { id: "bim_meeting", phrase: "Meeting (Mesyuarat)", description: "Place both hands in front of you with fingers open, and bring them together in an overlapping concentric circle to represent people gathering.", image: practiceImg, category: "Social" },
  { id: "bim_work", phrase: "Work (Kerja)", description: "Tap your dominant fist down vertically onto the wrist area of your non-dominant fist twice to symbolize task duty.", image: practiceImg, category: "Social" },
  { id: "bim_teacher", phrase: "Teacher (Cikgu / Guru)", description: "Bring hands near your temples and push forward with closed fingers twice, followed by a flat-hand downward person gesture.", image: practiceImg, category: "Social" },
  { id: "bim_student", phrase: "Student (Pelajar)", description: "Mime pulling knowledge from an open book palm to your forehead, followed by the standard sliding person suffix.", image: practiceImg, category: "Social" },
  { id: "bim_office", phrase: "Office (Pejabat)", description: "Outline a 3D box or square shape with both index fingers, indicating a room structure used for corporate business.", image: practiceImg, category: "Social" },
  { id: "bim_computer", phrase: "Computer (Komputer)", description: "Move the 'C' handshape in circular motions along your forearm, or mime rhythmic typing on a physical keyboard.", image: practiceImg, category: "Social" },
  { id: "bim_presentation", phrase: "Presentation (Pembentangan)", description: "Sweep both arms confidently outward from the center to describe a screen, showing information clearly to an audience.", image: practiceImg, category: "Social" },
  { id: "bim_cooperation", phrase: "Thank You for Your Cooperation (Terima Kasih Kerjasama)", description: "Combine standard Flat hand Chin Swipe (Thank You) with interlocked fingers pushed outward (Cooperation) to express joint gratitude.", image: slowlyPleaseImg, category: "Social" }
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  { id: "u1_q1", unitId: "1", type: "sign_recognition", imageUrl: practiceImg, questionText: "Which BIM hand gesture represents the letter 'A'?", options: ["A closed fist with the thumb resting facing up alongside the index finger", "Five fingers fully extended and spread out apart", "Index and middle fingers crossed over each other tight", "A curved hand shape representing a shallow cup"], correctAnswer: "A closed fist with the thumb resting facing up alongside the index finger", explanation: "The letter 'A' in BIM is signed using a closed fist with the thumb resting snugly against the side of the index finger." },
  { id: "u1_q2", unitId: "1", type: "multiple_choice", imageUrl: "https://images.bimsignbank.org/vocab/B.webp", questionText: "Show the correct hand gesture for the letter 'B' in BIM.", options: ["A flat open hand with four fingers straight up and thumb tucked inside the palm", "Only the pinky finger extended straight up toward the sky", "Thumb and index finger touching to form a neat circle", "Forming a sharp horizontal scissors shape with index and middle fingers"], correctAnswer: "A flat open hand with four fingers straight up and thumb tucked inside the palm", explanation: "In BIM, letter 'B' is expressed by rising four fingers flat and tucking the thumb slightly in across your palm." },
  { id: "u1_q3", unitId: "1", type: "image_matching", imageUrl: "https://images.bimsignbank.org/vocab/C.webp", questionText: "Which description matches the BIM manual alphabet letter 'C'?", options: ["Curving your fingers and thumb to form an open half-circle shape resembling the letter C", "Crossing your index and middle fingers over each other tightly", "Sticking out only your index finger and pointing to the sky", "Clenching a tight fist with the thumb on top of all fingers"], correctAnswer: "Curving your fingers and thumb to form an open half-circle shape resembling the letter C", explanation: "The letter 'C' is a highly iconic shape where your fingers are arched and spaced from your thumb to simulate a C outline." },
  { id: "u1_q4", unitId: "1", type: "practice_exercise", imageUrl: practiceImg, questionText: "In a fingerspelling drill, how would you sign the acronym 'BIM' letter-by-letter?", options: ["First, flat open palm (B). Second, index finger only (I). Third, three fingers draped over thumb (M).", "First, index and middle fingers up. Second, pinky up. Third, fist up.", "First, open palm. Second, two fingers making a circle. Third, peace sign.", "First, index finger pointing front. Second, hand shaking. Third, flat hand."], correctAnswer: "First, flat open palm (B). Second, index finger only (I). Third, three fingers draped over thumb (M).", explanation: "To spell 'BIM', you fingerspell: B (flat hand, thumb tucked), I (pinky finger pointing up), and M (three fingers draped over the thumb)." },
  { id: "u1_q5", unitId: "1", type: "multiple_choice", imageUrl: practiceImg, questionText: "What is the key linguistic rule for clear fingerspelling in Bahasa Isyarat Malaysia?", options: ["Keep your hand steady in one central visual 'signing space' and pause briefly between words", "Bounce your hand dramatically with each letter spelled to show emphasis", "Move your hand continuously from left to right as if writing in midair", "Cover your mouth with your non-dominant hand while fingerspelling"], correctAnswer: "Keep your hand steady in one central visual 'signing space' and pause briefly between words", explanation: "Fingerspelling should be performed in a single steady visual box in front of your shoulder. Bouncing or drifting makes it hard to extract letters." },

  // Unit 2: Daily Words
  { id: "u2_q1", unitId: "2", type: "multiple_choice", imageUrl: thankYouImg, questionText: "How is the common sign for 'Thank You' (Terima Kasih) executed in BIM?", options: ["Touch dominant fingertips politely to your chin, then sweep outward toward the recipient", "Cross both hands over your chest in a deep bow shape", "Clench both fists and knock them together twice", "Tap your forehead with your index finger thrice"], correctAnswer: "Touch dominant fingertips politely to your chin, then sweep outward toward the recipient", explanation: "The sign for 'Thank You' (Terima Kasih) is signed by touching your dominant fingers to your chin and drawing them outward in a respectful gesture." },
  { id: "u2_q2", unitId: "2", type: "sign_recognition", imageUrl: helloImg, questionText: "What is the standard BIM gesture to represent 'Hello' (Hai)?", options: ["Raise your open hand and wave it politely from the side of your temples or face", "Clasp your own hands together and shake them in greeting", "Point your index finger forward while squinting with friendly eyes", "Sweep your dominant palm in a vertical circle over your chest"], correctAnswer: "Raise your open hand and wave it politely from the side of your temples or face", explanation: "To say 'Hello', raise your dominant hand with an open palm facing forward and wave it from the side of your head." },
  { id: "u2_q3", unitId: "2", type: "multiple_choice", imageUrl: whereImg, questionText: "Identify the correct BIM gesture for asking 'Where' (Mana).", options: ["Extend both hands with open palms facing upward, shifting them side-to-side", "Point with your index finger directly at the ground twice", "Hold a fist to your ear as if talking on a hand phone receiver", "Cross both wrists sharply in front of your chest with hands closed"], correctAnswer: "Extend both hands with open palms facing upward, shifting them side-to-side", explanation: "In BIM, 'Where' is represented by placing both open hands in front of you facing upwards, lightly swaying them laterally." },
  { id: "u2_q4", unitId: "2", type: "image_matching", imageUrl: pleaseImg, questionText: "Which action describes the sign for 'Please' (Sila) in Bahasa Isyarat Malaysia?", options: ["Dominant flat open palm placed over the center of chest sweeping downward gently", "Two fingers tapping the lips carefully twice", "Wiggling both thumbs in front of your chin with a warm smile", "Spelling the letters S-I-L-A with one hand"], correctAnswer: "Dominant flat open palm placed over the center of chest sweeping downward gently", explanation: "To politely say 'Please' or welcome/invite someone (Sila), sweep your page-flat palm down across the center of your chest." },

  // Unit 3: Emergency Signs
  { id: "u3_q1", unitId: "3", type: "multiple_choice", imageUrl: needHelpImg, questionText: "How is the crucial emergency sign for 'Help' (Tolong) expressed in BIM?", options: ["Place your dominant closed fist (thumb pointing up) onto the flat open opposite palm and lift them together", "Cross your arms above your head in a large 'X' shape", "Wave both index fingers in rapid alternating circles near your ears", "Slap your chest repeatedly with both flat palms"], correctAnswer: "Place your dominant closed fist (thumb pointing up) onto the flat open opposite palm and lift them together", explanation: "The sign for 'Help' (Tolong) uses a supportive motion where a thumb-up fist sits on or is raised by your flat non-dominant hand." },
  { id: "u3_q2", unitId: "3", type: "sign_recognition", imageUrl: policeImg, questionText: "What is the standard BIM sign to represent the 'Police' (Polis)?", options: ["Touch the side of your forehead with index and middle fingers, symbolizing an authority cap or salute", "Make a siren sound with your mouth while turning left and right and raising arms", "Draw an imaginary badge shape over your left chest using your thumb", "Extend both hands forward in front of you as if holding handcuffs"], correctAnswer: "Touch the side of your forehead with index and middle fingers, symbolizing an authority cap or salute", explanation: "Polis (Police) is signed by touching index and middle fingers together against the side of your forehead, representing a service cap salute." },
  { id: "u3_q3", unitId: "3", type: "multiple_choice", imageUrl: hospitalImg, questionText: "How do you signal 'Hospital' in Bahasa Isyarat Malaysia?", options: ["Trace a neat small cross (+) on your upper outer left arm using your dominant index and middle fingers", "Mime holding a stethoscope and placing it over your heart", "Draw a triangular roof shape above your head representing a health clinic", "Pretend to sleep by leaning your head onto clasped hands"], correctAnswer: "Trace a neat small cross (+) on your upper outer left arm using your dominant index and middle fingers", explanation: "The sign for Hospital is a cross symbol (+) illustrated near the left sleeve/shoulder area using index and middle fingers." },
  { id: "u3_q4", unitId: "3", type: "image_matching", imageUrl: toiletImg, questionText: "To sign 'Toilet' (Tandas) in daily life, what handshape is used?", options: ["Make a fist with your thumb tucked between index and middle fingers (letter 'T'), and shake it side-to-side", "Wiggle your pinky finger vertically while pointing to the ground", "Mime washing your hands with both flat open palms", "Point your index finger back over your shoulder with an expression"], correctAnswer: "Make a fist with your thumb tucked between index and middle fingers (letter 'T'), and shake it side-to-side", explanation: "Tandas (Toilet) is signed by forming the manual alphabet letter 'T' and shaking it gently left and right." },

  // Unit 4: Food & Drink Ordering
  { id: "u4_q1", unitId: "4", type: "multiple_choice", imageUrl: practiceImg, questionText: "What describes the proper gesture for 'Eat' (Makan) in BIM?", options: ["Bring a flat-O handshape with fingertips bunched together near your mouth twice", "Pretend to cut food with an imaginary knife and fork", "Rub your tummy in clockwise circular motions with a smile", "Point at your teeth with your pinky finger twice"], correctAnswer: "Bring a flat-O handshape with fingertips bunched together near your mouth twice", explanation: "Makan is signed by holding your hand in a flat-O shape and mimicking bringing it to your mouth." },
  { id: "u4_q2", unitId: "4", type: "sign_recognition", imageUrl: practiceImg, questionText: "How is the sign for 'Water' (Air) structured in BIM?", options: ["Form a 'W' handshape and tap your chin twice with your index finger", "Trace a circular ripple in front of your eyes using a pointer finger", "Mime pouring liquid from one hand to another", "Touch your throat with two fingers while looking thirsty"], correctAnswer: "Form a 'W' handshape and tap your chin twice with your index finger", explanation: "Air (Water) is signed with the 'W' manual alphabet shape (index, middle, ring fingers up) gently tapping the chin twice." },
  { id: "u4_q3", unitId: "4", type: "multiple_choice", imageUrl: restaurantImg, questionText: "How is 'Restaurant' (Restoran) expressed in Malaysian sign language?", options: ["Form the letter 'R' with crossed index/middle fingers and wave it near the sides of your lips", "Mime holding a menu card and flipping pages", "Clap your hands together thrice as if calling a waiter", "Double tap your shoulder with an open palm"], correctAnswer: "Form the letter 'R' with crossed index/middle fingers and wave it near the sides of your lips", explanation: "Restoran is signed by forming the letter 'R' (crossing index and middle fingers) and weaving it politely near the corners of your lips." },
  { id: "u4_q4", unitId: "4", type: "image_matching", imageUrl: practiceImg, questionText: "How do you ask for the 'Bill Check' (Kira / Bil) at a Malaysian food establishment?", options: ["Mime drawing a small rectangle check card in the air, or trace lines across your open palm", "Raise both hands and snap your index fingers loudly", "Point with your index finger directly to your wallet or pocket", "Close your eyes and make a counting motion with your thumb and fingers"], correctAnswer: "Mime drawing a small rectangle check card in the air, or trace lines across your open palm", explanation: "To request the bill (kira), mime drawing a small rectangular slip in the air style or tracing a list counting pattern across your open palm." },

  // Unit 5: Professional Sign Language
  { id: "u5_q1", unitId: "5", type: "multiple_choice", imageUrl: practiceImg, questionText: "What gesture represents 'Work' (Kerja) in a corporate discussion?", options: ["Tap your dominant fist vertically onto the wrist area of your non-dominant fist twice", "Pretend to type rapidly on a keyboard using all fingers", "Cross both index fingers in front of your face to form a neat cross", "Place both hands onto your hips and nod confidently"], correctAnswer: "Tap your dominant fist vertically onto the wrist area of your non-dominant fist twice", explanation: "Kerja (Work/Duty) is represented by hitting the wrist of your non-dominant hand with your dominant fist in a vertical hammer tap twice." },
  { id: "u5_q2", unitId: "5", type: "sign_recognition", imageUrl: practiceImg, questionText: "How is 'Teacher' (Cikgu / Guru) signed in Malaysian sign language?", options: ["Bring closed fingers near temples and push forward twice, followed by the downward person suffix gesture", "Form an 'A-B-C' shape in front of your head using your fingers", "Mime writing on a blackboard with white chalk", "Point at an open book with your dominant thumb"], correctAnswer: "Bring closed fingers near temples and push forward twice, followed by the downward person suffix gesture", explanation: "Guru or Cikgu (Teacher) combines the sign for teaching/direction (pushing from temples) with the standard sliding flat-hands person suffix." },
  { id: "u5_q3", unitId: "5", type: "multiple_choice", imageUrl: practiceImg, questionText: "Which gesture represents a 'Computer' (Komputer) in professional settings?", options: ["Move the 'C' handshape in circular motions along your forearm, or mime rhythmic keyboard typing", "Draw an invisible square screen with both dominant index fingers", "Touch your ear with your pinky while staring forward", "Cross your wrists and tap your fingers continuously like keys"], correctAnswer: "Move the 'C' handshape in circular motions along your forearm, or mime rhythmic keyboard typing", explanation: "Komputer is signed by forming a 'C' hand and rotating it along the opposite arm, or miming a focused desktop typing gesture." },
  { id: "u5_q4", unitId: "5", type: "image_matching", imageUrl: slowlyPleaseImg, questionText: "How is 'Thank you for your Cooperation' (Terima Kasih Kerjasama) signed in a workplace meeting?", options: ["Combine the flat-hand chin swipe (Thank You) with interlocked fingers pushed outwards (Cooperation) politely", "Simply wave both open palms high in the sky with a low bow", "Cross your index fingers near your eyes and nod twice", "Press both hands flat against your forehead with closed eyes"], correctAnswer: "Combine the flat-hand chin swipe (Thank You) with interlocked fingers pushed outwards (Cooperation) politely", explanation: "To express cooperation appreciation, sign standard 'Terima Kasih' followed by interlocking your fingers and presenting them outward." }
];
