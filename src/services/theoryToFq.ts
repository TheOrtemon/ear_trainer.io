import { note as Note, chord as Chord } from 'teoria'
import type { ComputedRef, Ref } from 'vue'

interface ChordInterval {
  interval: string
  chordQuality: string
}

interface RelativeChordMap {
  [key: string]: ChordInterval
}

export const relativeChordMap: RelativeChordMap = {
  I: { interval: 'P1', chordQuality: 'M' },
  Imaj7: { interval: 'P1', chordQuality: 'maj7' },
  i: { interval: 'P1', chordQuality: 'm' },
  im7: { interval: 'P1', chordQuality: 'm7' },
  ii: { interval: 'M2', chordQuality: 'm' },
  iim7: { interval: 'M2', chordQuality: 'm7' },
  'ii°': { interval: 'M2', chordQuality: 'dim' },
  iiø7: { interval: 'M2', chordQuality: 'm7b5' },
  iii: { interval: 'M3', chordQuality: 'm' },
  iiim7: { interval: 'M3', chordQuality: 'm7' },
  III: { interval: 'M3', chordQuality: 'M' },
  bIII: { interval: 'm3', chordQuality: 'M' },
  bIIImaj7: { interval: 'm3', chordQuality: 'maj7' },
  biii: { interval: 'm3', chordQuality: 'm' },
  IVmaj7: { interval: 'P4', chordQuality: 'maj7' },
  iv: { interval: 'P4', chordQuality: 'm' },
  ivm7: { interval: 'P4', chordQuality: 'm7' },
  V: { interval: 'P5', chordQuality: 'M' },
  V7: { interval: 'P5', chordQuality: 'dom7' },
  v: { interval: 'P5', chordQuality: 'm' },
  vm7: { interval: 'P5', chordQuality: 'm7' },
  vi: { interval: 'M6', chordQuality: 'm' },
  vim7: { interval: 'M6', chordQuality: 'm7' },
  VI: { interval: 'M6', chordQuality: 'M' },
  bVI: { interval: 'm6', chordQuality: 'M' },
  bVImaj7: { interval: 'm6', chordQuality: 'maj7' },
  bvi: { interval: 'm6', chordQuality: 'm' },
  'vii°': { interval: 'M7', chordQuality: 'dim' },
  viiø7: { interval: 'M7', chordQuality: 'm7b5' },
  bVII: { interval: 'm7', chordQuality: 'M' },
  bVII7: { interval: 'm7', chordQuality: 'dom7' },
}

export const chromaticScaleNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

export function getChordTones(
  tonicChord: ComputedRef<string>,
  chordSymbol: string,
  octave?: 1 | -1,
): string[] {
  let chord = Chord(chordSymbol)
  if (chordSymbol !== tonicChord.value && octave) {
    const tonicChordObject = Chord(tonicChord.value)
    const tonicChordRoot = tonicChordObject.root
    if (tonicChordRoot.fq() > chord.root.fq()) {
      if (octave === 1) {
        chord = chord.interval('P8')
      }
    } else {
      if (octave === -1) {
        chord = chord.interval('P-8')
      }
    }
  }
  const chordNotes = chord.notes()
  const notesStringed = chordNotes.map((note) => note.toString())
  return notesStringed
}

export function notationToChord(tonic: Ref<string>, romanNotation: string) {
  const { interval, chordQuality } = relativeChordMap[romanNotation]
  const intervalTonic = Note(tonic.value).interval(interval)
  return intervalTonic.chord(chordQuality).name
}
