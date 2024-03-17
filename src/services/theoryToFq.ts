import { note as newNote, chord as newChord, interval as newInterval } from 'teoria'
import type { Chord } from 'teoria'
import type { Ref } from 'vue'

interface ChordInterval {
  interval: string
  chordQuality: string
}

interface RelativeChordMap {
  [key: string]: ChordInterval
}

// stolen from stackoverflow
export function inverseChord(chord: Chord, n: number) {
  const copiedChord = newChord(chord.name)
  copiedChord.root = chord.root
  let voicing = copiedChord.voicing()
  if (n < 0) {
    voicing = voicing.reverse()
  }

  const j = Math.abs(n)
  for (let i = 0; i < j; i++) {
    const index = i % voicing.length
    if (n > 0) {
      voicing[index] = voicing[index].add(newInterval('P8'))
    } else {
      voicing[index] = voicing[index].add(newInterval('P-8'))
    }
  }
  copiedChord._voicing = voicing

  return copiedChord
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
  IV: { interval: 'P4', chordQuality: 'M' },
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

export function getChord(chordSymbol: string): Chord {
  return newChord(chordSymbol)
}

export function transposeChord(tonicChord: Chord, secondChord: Chord): Chord {
  const tonicNote = tonicChord.root
  if (tonicNote.fq() < secondChord.root.fq()) {
    secondChord = secondChord.interval('P-8')
  }
  return secondChord
}

export function getChordTones(chord: Chord): string[] {
  const chordNotes = chord.notes()
  const notesStringified = chordNotes.map((note) => note.toString())
  return notesStringified
}

export function notationToChord(tonic: Ref<string>, romanNotation: string) {
  const { interval, chordQuality } = relativeChordMap[romanNotation]
  const intervalTonic = newNote(tonic.value).interval(interval)
  return intervalTonic.chord(chordQuality).name
}