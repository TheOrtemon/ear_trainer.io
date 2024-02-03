interface ChordsOptions {
  [key: string]: string[]
};

export const chordsOptions: ChordsOptions = {
  'major': ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'], 
  'minor': ['i', 'ii°', 'bIII', 'iv', 'v', 'bVI', 'bVII'],
  'chromediants_major': ['I', 'bIII', 'III', 'bVI', 'VI'],
  'chromediants_minor': ['i', 'biii', 'iii', 'bvi', 'vi'],
};