import { note as Note, chord as Chord } from 'teoria';
import { ComputedRef, Ref } from 'vue';

interface ChordInterval {
  interval: string;
  chordQuality: string;
}

interface RelativeChordMap {
  [key: string]: ChordInterval
}

export const relativeChordMap: RelativeChordMap = {
  'I': { interval: 'P1', chordQuality: 'M' },
  'i': { interval: 'P1', chordQuality: 'm' },
  'ii': { interval: 'M2', chordQuality: 'm' },
  'ii°': { interval: 'M2', chordQuality: 'dim' },
  'iii': { interval: 'M3', chordQuality: 'm' },
  'III': { interval: 'M3', chordQuality: 'M' },
  'bIII': { interval: 'm3', chordQuality: 'M' },
  'biii': { interval: 'm3', chordQuality: 'm' },
  'IV': { interval: 'P4', chordQuality: 'M' },
  'iv': { interval: 'P4', chordQuality: 'm' },
  'V': { interval: 'P5', chordQuality: 'M' },
  'v': { interval: 'P5', chordQuality: 'm' },
  'vi': { interval: 'M6', chordQuality: 'm' },
  'VI': { interval: 'M6', chordQuality: 'M' },
  'bVI': { interval: 'm6', chordQuality: 'M' },
  'bvi': { interval: 'm6', chordQuality: 'm' },
  'vii°': { interval: 'M7', chordQuality: 'dim' },
  'bVII': { interval: 'm7', chordQuality: 'M' },
};

export const chromaticScaleNotes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export function getChordTones(tonicChord: ComputedRef<string>, chordSymbol: string, octave?: 1 | -1): string[] {
  let chord = Chord(chordSymbol);
  if (chordSymbol !== tonicChord.value && octave) {
    const tonicChordObject = Chord(tonicChord.value)
    const tonicChordRoot = tonicChordObject.root;
    if (tonicChordRoot.fq() > chord.root.fq()) {
      if (octave === 1) {
        chord = chord.interval('P8');
      }
    } else {
      if (octave === -1) {
        chord = chord.interval('P-8');
      }
    }
  }
  const chordNotes = chord.notes();
  const notesStringed = chordNotes.map(note => note.toString());
  return notesStringed;
};

export function notationToChord(tonic: Ref<string>, romanNotation: string) {
  let { interval, chordQuality } = relativeChordMap[romanNotation];
  const intervalTonic = Note(tonic.value).interval(interval);
  return intervalTonic.chord(chordQuality).name;
}
