import { LevelConfig, InteractionType } from './types';

export const TOTAL_LEVELS = 20;
export const STARTING_COINS = 50;
export const HINT_COST = 20;

export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    question: "Make the giraffe shorter.",
    type: InteractionType.DRAG,
    hint: "Necks are flexible in cartoons!",
    assets: [
      { id: 'body', type: 'text', content: '🦒', initialX: 50, initialY: 60, width: 150, height: 150, draggable: false, zIndex: 1 },
      { id: 'head', type: 'text', content: '🦒', initialX: 50, initialY: 20, width: 150, height: 150, draggable: true, zIndex: 2 }, 
      // Visual trick: The head is a separate draggable asset on top of a static body to simulate neck shortening
    ]
  },
  {
    id: 2,
    question: "Which glass has water?",
    type: InteractionType.DRAG,
    hint: "Try pouring them out.",
    assets: [
      { id: 'glass1', type: 'text', content: '🥛', initialX: 20, initialY: 50, width: 80, height: 80, draggable: true, zIndex: 1 },
      { id: 'glass2', type: 'text', content: '🥛', initialX: 50, initialY: 50, width: 80, height: 80, draggable: true, zIndex: 1 },
      { id: 'glass3', type: 'text', content: '🥛', initialX: 80, initialY: 50, width: 80, height: 80, draggable: true, zIndex: 1, isCorrect: true },
    ]
  },
  {
    id: 3,
    question: "Help the man reach the apple.",
    type: InteractionType.DRAG,
    hint: "If he can't go to the apple...",
    assets: [
      { id: 'man', type: 'text', content: '🧍', initialX: 20, initialY: 70, width: 100, height: 100, draggable: false },
      { id: 'apple', type: 'text', content: '🍎', initialX: 80, initialY: 30, width: 60, height: 60, draggable: true, targetId: 'man' },
    ]
  },
  {
    id: 4,
    question: "Which shadow is correct?",
    type: InteractionType.CLICK,
    hint: "Look closely at the leaf direction.",
    assets: [
      { id: 'fruit', type: 'text', content: '🍎', initialX: 50, initialY: 30, width: 100, height: 100, draggable: false },
      { id: 's1', type: 'shape', content: 'bg-black opacity-30 rounded-full rotate-45', initialX: 20, initialY: 70, width: 80, height: 80, draggable: false },
      { id: 's2', type: 'shape', content: 'bg-black opacity-30 rounded-full', initialX: 50, initialY: 70, width: 80, height: 80, draggable: false, isCorrect: true },
      { id: 's3', type: 'shape', content: 'bg-black opacity-30 rounded-full -rotate-45', initialX: 80, initialY: 70, width: 80, height: 80, draggable: false },
    ]
  },
  {
    id: 5,
    question: "Turn off the lamp.",
    type: InteractionType.DRAG,
    hint: "Where does light come from? Not the lamp!",
    assets: [
      { id: 'lamp', type: 'text', content: '🛋️', initialX: 50, initialY: 70, width: 150, height: 150, draggable: false },
      { id: 'light', type: 'shape', content: 'bg-yellow-200 opacity-50 rounded-full blur-xl', initialX: 50, initialY: 50, width: 200, height: 200, draggable: false, zIndex: 0 },
      { id: 'sun', type: 'text', content: '☀️', initialX: 85, initialY: 15, width: 80, height: 80, draggable: true, zIndex: 10 },
    ]
  },
  {
    id: 6,
    question: "Which one is the real cat?",
    type: InteractionType.CLICK,
    hint: "He's hiding behind a disguise. Shake him!",
    assets: [
      { id: 'c1', type: 'text', content: '😼', initialX: 20, initialY: 50, width: 100, height: 100, draggable: true },
      { id: 'c2', type: 'text', content: '😼', initialX: 50, initialY: 50, width: 100, height: 100, draggable: true },
      { id: 'c3', type: 'text', content: '😼', initialX: 80, initialY: 50, width: 100, height: 100, draggable: true }, // Logic: Dragging shakes disguise off
    ]
  },
  {
    id: 7,
    question: "Make 2 + 2 = 22",
    type: InteractionType.DRAG,
    hint: "It's not math, it's art.",
    assets: [
      { id: '2a', type: 'text', content: '2', initialX: 20, initialY: 50, width: 50, height: 50, draggable: true },
      { id: 'plus', type: 'text', content: '+', initialX: 40, initialY: 50, width: 50, height: 50, draggable: false },
      { id: '2b', type: 'text', content: '2', initialX: 60, initialY: 50, width: 50, height: 50, draggable: true },
      { id: 'eq', type: 'text', content: '=', initialX: 80, initialY: 50, width: 50, height: 50, draggable: false },
      { id: 'ans', type: 'text', content: '?', initialX: 95, initialY: 50, width: 50, height: 50, draggable: false },
    ]
  },
  {
    id: 8,
    question: "Stop the fight!",
    type: InteractionType.DRAG,
    hint: "Sharing is caring.",
    assets: [
      { id: 'kid1', type: 'text', content: '😠', initialX: 30, initialY: 60, width: 80, height: 80, draggable: false },
      { id: 'kid2', type: 'text', content: '😡', initialX: 70, initialY: 60, width: 80, height: 80, draggable: false },
      { id: 'candy', type: 'text', content: '🍭', initialX: 50, initialY: 30, width: 60, height: 60, draggable: true },
    ]
  },
  {
    id: 9,
    question: "Fix the broken clock.",
    type: InteractionType.DRAG,
    hint: "Put the hands back where they belong.",
    assets: [
      { id: 'clock', type: 'text', content: '🕛', initialX: 50, initialY: 50, width: 150, height: 150, draggable: false },
      { id: 'min', type: 'shape', content: 'bg-black w-2 h-16', initialX: 20, initialY: 80, width: 8, height: 64, draggable: true, targetId: 'clock' },
      { id: 'hour', type: 'shape', content: 'bg-black w-2 h-10', initialX: 80, initialY: 80, width: 8, height: 40, draggable: true, targetId: 'clock' },
    ]
  },
  {
    id: 10,
    question: "Where is the ghost?",
    type: InteractionType.DRAG,
    hint: "Ghosts only come out in the dark.",
    assets: [
      { id: 'sun', type: 'text', content: '☀️', initialX: 50, initialY: 20, width: 100, height: 100, draggable: true, zIndex: 10 },
      { id: 'ghost', type: 'text', content: '👻', initialX: 80, initialY: 70, width: 80, height: 80, draggable: false, isCorrect: true, hidden: true },
    ]
  },
  {
    id: 11,
    question: "Solve 9 + 1 = ?",
    type: InteractionType.DRAG,
    hint: "Is that a 1 or something else covering a number?",
    assets: [
      { id: '9', type: 'text', content: '9', initialX: 20, initialY: 50, width: 50, height: 50, draggable: false },
      { id: 'plus', type: 'text', content: '+', initialX: 40, initialY: 50, width: 50, height: 50, draggable: false },
      { id: '1', type: 'text', content: '1', initialX: 60, initialY: 50, width: 40, height: 50, draggable: true, zIndex: 5 },
      { id: '0', type: 'text', content: '0', initialX: 60, initialY: 50, width: 40, height: 50, draggable: false, isCorrect: true }, // 1 covers 0
      { id: 'eq', type: 'text', content: '=', initialX: 80, initialY: 50, width: 50, height: 50, draggable: false },
      { id: 'ans', type: 'text', content: '9', initialX: 95, initialY: 50, width: 50, height: 50, draggable: false },
    ]
  },
  {
    id: 12,
    question: "Find the hidden ice.",
    type: InteractionType.DRAG,
    hint: "It's hidden under something hot.",
    assets: [
      { id: 'desert', type: 'text', content: '🌵', initialX: 50, initialY: 50, width: 150, height: 150, draggable: true, zIndex: 2 },
      { id: 'ice', type: 'text', content: '🧊', initialX: 50, initialY: 50, width: 50, height: 50, draggable: false, isCorrect: true, zIndex: 1 },
    ]
  },
  {
    id: 13,
    question: "Which egg is real?",
    type: InteractionType.CLICK,
    hint: "Tap them to test their shell.",
    assets: [
      { id: 'e1', type: 'text', content: '🥚', initialX: 30, initialY: 50, width: 60, height: 60, draggable: false },
      { id: 'e2', type: 'text', content: '🥚', initialX: 50, initialY: 50, width: 60, height: 60, draggable: false },
      { id: 'e3', type: 'text', content: '🥚', initialX: 70, initialY: 50, width: 60, height: 60, draggable: false },
    ]
  },
  {
    id: 14,
    question: "Wake him up!",
    type: InteractionType.DRAG,
    hint: "Take away his comfort.",
    assets: [
      { id: 'man', type: 'text', content: '😴', initialX: 50, initialY: 60, width: 100, height: 100, draggable: false, zIndex: 1 },
      { id: 'pillow', type: 'text', content: '⬜', initialX: 50, initialY: 60, width: 80, height: 50, draggable: true, zIndex: 0 },
    ]
  },
  {
    id: 15,
    question: "Open the treasure box.",
    type: InteractionType.DRAG,
    hint: "You have coins in your UI, don't you?",
    assets: [
      { id: 'box', type: 'text', content: '📦', initialX: 50, initialY: 60, width: 120, height: 120, draggable: false },
      { id: 'fake_coin', type: 'text', content: '🪙', initialX: 85, initialY: 8, width: 30, height: 30, draggable: true, targetId: 'box', zIndex: 100 },
    ]
  },
  {
    id: 16,
    question: "Break the rock.",
    type: InteractionType.DRAG,
    hint: "Tools are weak when cold. Heat it up!",
    assets: [
      { id: 'hammer', type: 'text', content: '🔨', initialX: 20, initialY: 70, width: 80, height: 80, draggable: true },
      { id: 'fire', type: 'text', content: '🔥', initialX: 80, initialY: 70, width: 80, height: 80, draggable: false },
      { id: 'rock', type: 'text', content: '🪨', initialX: 50, initialY: 40, width: 100, height: 100, draggable: false },
    ]
  },
  {
    id: 17,
    question: "Find the largest number.",
    type: InteractionType.DRAG,
    hint: "It's hidden behind another number.",
    assets: [
      { id: '200', type: 'text', content: '200', initialX: 30, initialY: 50, width: 80, height: 50, draggable: true },
      { id: '50', type: 'text', content: '50', initialX: 70, initialY: 50, width: 60, height: 50, draggable: true, zIndex: 5 },
      { id: '1000', type: 'text', content: '1000', initialX: 70, initialY: 50, width: 100, height: 50, draggable: true, isCorrect: true, zIndex: 1 },
    ]
  },
  {
    id: 18,
    question: "Which bucket fills faster?",
    type: InteractionType.CLICK,
    hint: "Look at the pipes carefully.",
    assets: [
      { id: 'pipes', type: 'text', content: '🚰', initialX: 50, initialY: 20, width: 100, height: 100, draggable: false },
      { id: 'b1', type: 'text', content: '🗑️', initialX: 30, initialY: 70, width: 60, height: 60, draggable: false },
      { id: 'b2', type: 'text', content: '🗑️', initialX: 50, initialY: 70, width: 60, height: 60, draggable: false, isCorrect: true },
      { id: 'b3', type: 'text', content: '🗑️', initialX: 70, initialY: 70, width: 60, height: 60, draggable: false },
    ]
  },
  {
    id: 19,
    question: "Make the baby stop crying.",
    type: InteractionType.DRAG,
    hint: "Give him the moon.",
    assets: [
      { id: 'baby', type: 'text', content: '😭', initialX: 50, initialY: 70, width: 100, height: 100, draggable: false },
      { id: 'moon', type: 'text', content: '🌙', initialX: 85, initialY: 15, width: 50, height: 50, draggable: true, targetId: 'baby' },
    ]
  },
  {
    id: 20,
    question: "Who is lying?",
    type: InteractionType.DRAG,
    hint: "Check under the hat.",
    assets: [
      { id: 'p1', type: 'text', content: '👨', initialX: 30, initialY: 60, width: 100, height: 100, draggable: false },
      { id: 'p2', type: 'text', content: '🧔', initialX: 70, initialY: 60, width: 100, height: 100, draggable: false, isCorrect: true },
      { id: 'hat', type: 'text', content: '🎩', initialX: 70, initialY: 55, width: 80, height: 80, draggable: true, zIndex: 10 },
      { id: 'horns', type: 'text', content: '😈', initialX: 70, initialY: 55, width: 40, height: 40, draggable: false, zIndex: 1 },
    ]
  }
];