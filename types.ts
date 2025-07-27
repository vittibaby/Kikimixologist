export type Step = 'start' | 'starSign' | 'mood' | 'character' | 'generating' | 'spinning' | 'result' | 'error';

export interface UserDetails {
  starSign: string;
  mood: string;
  character: string;
}

export interface Cocktail {
  name: string;
  explanation: string;
  adjectives: string[];
  recipe: {
    ingredients: string[];
    instructions: string[];
  };
  imageUrl: string;
}