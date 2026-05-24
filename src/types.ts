export interface TopicNode {
  id: string;
  title: string;
  description: string;
  status: "locked" | "active" | "complete";
  pointsValue: number;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  xpWorth: number;
  collected: boolean;
  type: "daily" | "friend";
}

export interface StreakBuddy {
  id: string;
  name: string;
  avatar: string;
  streakDays: number;
  nudged: boolean;
}

export interface SignMedia {
  title: string;
  word: string;
  imageUrl?: string;
  youtubeUrl?: string;
  embedUrl?: string;
  sourceUrl?: string;
}

export interface ToolkitPhrase {
  id: string;
  phrase: string; // Acts as "title"
  description: string; // Acts as "beginner explanation"
  image: string; // Local image path or dynamic URL
  category: "Basic Conversation" | "Emergency" | "Daily Life" | "Social" | string;
  isNew?: boolean;
  
  // Dynamic media system properties
  youtubeUrl?: string;
  embedUrl?: string;
  imageUrl?: string;
  title?: string;
  sourceUrl?: string;
  word?: string;
}

export interface QuizQuestion {
  id: string;
  videoUrl?: string;
  imageUrl?: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  unitId?: string;
  type?: "multiple_choice" | "image_matching" | "sign_recognition" | "practice_exercise";
}

export interface PracticeHubModule {
  id: "receptive" | "mistake" | "flashcard" | "speed";
  title: string;
  description: string;
}

export interface BimTutorial {
  english: string;
  malay: string;
  imageUrl?: string;
  youtubeUrl?: string;
  sourceUrl?: string;
  explanation?: string;
}
