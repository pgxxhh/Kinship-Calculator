export type Language = 'zh' | 'en' | 'th' | 'id' | 'ms';
export type Gender = 'male' | 'female';

export interface KinshipResponse {
  title: string;        // The formal title (e.g., 姨妈)
  colloquial: string;   // What you call them (e.g., 姨姨)
  relationPath: string; // Normalized path string
  description: string;  // Brief explanation
  emoji: string;        // Emoji representing the relative (e.g., 👴)
}

export enum LoadingState {
  IDLE = 'IDLE',
  CALCULATING = 'CALCULATING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export type RelationType = 
  | 'father' | 'mother' 
  | 'husband' | 'wife' 
  | 'elder_bro' | 'younger_bro' 
  | 'elder_sis' | 'younger_sis' 
  | 'son' | 'daughter';

export interface RelationButton {
  id: RelationType;
  gender?: 'm' | 'f';
}