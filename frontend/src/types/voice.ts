export interface EnhancedVoice extends SpeechSynthesisVoice {
  displayName: string;
}

export const indianLanguages = {
  'hi-IN': 'Hindi',
  'te-IN': 'Telugu',
  'ta-IN': 'Tamil',
  'mr-IN': 'Marathi',
  'bn-IN': 'Bengali',
  'gu-IN': 'Gujarati',
  'kn-IN': 'Kannada',
  'ml-IN': 'Malayalam',
  'pa-IN': 'Punjabi',
  'en-IN': 'Indian English'
} as const;