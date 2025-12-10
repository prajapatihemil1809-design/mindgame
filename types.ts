export enum InteractionType {
  CLICK = 'CLICK',
  DRAG = 'DRAG',
  HIDDEN = 'HIDDEN',
  INPUT = 'INPUT'
}

export interface LevelConfig {
  id: number;
  question: string;
  type: InteractionType;
  solutionVal?: string | number; // For input/click puzzles
  assets: LevelAsset[];
  hint: string; // The hardcoded hint
}

export interface LevelAsset {
  id: string;
  type: 'image' | 'text' | 'shape';
  content: string; // URL or Text
  initialX: number; // Percentage 0-100
  initialY: number; // Percentage 0-100
  width: number; // w- class scale or pixels
  height: number;
  draggable?: boolean;
  isCorrect?: boolean; // If clicking this is the solution
  hidden?: boolean;
  targetId?: string; // If this object needs to be dragged to another
  zIndex?: number;
  state?: string; // Custom state for multi-step puzzles (e.g., "heated")
}

export interface GameState {
  currentLevelId: number;
  coins: number;
  completedLevels: number[];
  inventory: string[]; // Items collected
}