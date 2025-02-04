interface Duration {
  value: number
  dots: number
}

declare module 'teoria' {
  export class Note {
    constructor(name: string, duration?: Duration)
    name: string
    duration: Duration
    octave(): number
    interval(interval: string | Interval): Note
    interval(interval: Note): Interval
    chord(quality: string): Chord
    fq(): number
    static fromString(name: string, duration: Duration): Note
  }
  function note(name: string, duration?: Duration): Note
  namespace note {
    function fromString(name: string, duration?: Duration): Note
  }

  export class Interval {
    constructor(coord: number[])
    coord: number[]
    name(): string
    semitones(): number
    number(): number
    value(): number
    type(): string
    base(): string
    direction(): 'up' | 'down'
    direction(dir: 'up' | 'down'): Interval
    simple(ignore?: boolean): Interval
    isCompound(): boolean
    octaves(): number
    invert(): Interval
    quality(lng?: boolean): string
    qualityValue(): number
    equal(interval: Interval): boolean
    greater(interval: Interval): boolean
    smaller(interval: Interval): boolean
    add(interval: Interval): Interval
    toString(ignore?: boolean): string
  }
  function interval(from: string): Interval
  function interval(from: Note, to: string | Interval | Note): Interval

  export class Chord {
    constructor(name: Note, symbol?: string)
    name: string
    symbol: string
    root: Note
    intervals: Interval[]
    _voicing: Interval[]
    notes(): Note[]
    simple(): string[]
    bass(): Note
    voicing(): Interval[]
    voicing(voicingToSet: string[]): Chord
    resetVoicing(): void
    dominant(): Chord
    subdominant(): Chord
    parallel(): Chord
    quality(): string | undefined
    chordType(): string
    get(interval: Interval | string): Chord | null
    interval(interval: string | Interval): Chord
    interval(interval: Note): Chord
    transpose(intervale: string | Interval): Chord
    toString(): string
  }
  function chord(name: string | Note, symbol?: string | number): Chord
}
