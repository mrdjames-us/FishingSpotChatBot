
export interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
  groundingLinks?: GroundingLink[];
  verifiedCatches?: VerifiedCatch[];
}

export interface GroundingLink {
  title: string;
  uri: string;
}

export interface Location {
  latitude: number;
  longitude: number;
}

export interface VerifiedCatch {
  locationName: string;
  species: string;
  sourceUrl: string;
  verificationMethod: 'visual_landmark' | 'geotag' | 'social_mention';
  isWildLocation: boolean; // Must be true for water/shore catches
}
