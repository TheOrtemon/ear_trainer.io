import type { PolySynth, BaseContext, Transport, Part, Sampler, getDestination } from 'tone'
import type { SampleLibrary } from '@/services/Tonejs-Instruments'

export type PartElement = { time: string, chord: Array<string> }
type Instrument = PolySynth | Sampler
type InstrumentMap = Record<string, Instrument>

interface ToneImports {
  context: BaseContext
  start: () => Promise<void>
  PolySynth: typeof PolySynth
  Transport: typeof Transport
  Part: typeof Part
  Sampler: typeof Sampler
  SampleLibrary: typeof SampleLibrary
  getDestination: typeof getDestination
}

interface SampleLibraryContainer {
  SampleLibrary?: SampleLibrary
}

const DEFAULT_VOLUME = -8
const CHORD_DURATION = '4n'
const ARPEGGIO_DELAY: string = '32n'

let toneImportsContainer: ToneImports | undefined
const samplerLibraryContainer: SampleLibraryContainer = {}
export const loadedInstruments: InstrumentMap = {}

export async function getToneLib(): Promise<ToneImports> {
  if (!toneImportsContainer) {
    const { context, start, PolySynth, Transport, Part, Sampler, getDestination } = await import('tone')
    const { SampleLibrary } = await import('@/services/Tonejs-Instruments')
    toneImportsContainer = {
      context,
      start,
      PolySynth,
      Transport,
      Part,
      Sampler,
      getDestination,
      SampleLibrary,
    }
  }
  return toneImportsContainer
}

export async function playChords(chordScore: PartElement[], instrumentName: string, toArpeggiate: boolean = true): Promise<void> {
  const { context, start, Transport, Part, getDestination } = await getToneLib()
  if (context.state !== 'running') {
    await context.resume()
    await start()
  }
  getDestination().volume.value = DEFAULT_VOLUME
  Transport.stop()
  Transport.cancel()

  let instrument = await getInstrument(instrumentName)

  if (toArpeggiate) {
    instrument.releaseAll()
    chordScore.forEach((element) => {
      const chord = element.chord
      const startTime = Transport.toSeconds(element.time)

      chord.forEach((note, index) => {
        const delayInSeconds = Transport.toSeconds(ARPEGGIO_DELAY)
        const noteTime = startTime + index * delayInSeconds

        Transport.scheduleOnce((time) => {
          instrument.triggerAttackRelease(note, CHORD_DURATION, time)
        }, noteTime)
      })
    })
  } else {
    instrument.releaseAll()
    const part = new Part((time, value) => {
      instrument.triggerAttackRelease(value.chord, CHORD_DURATION, time)
    }, chordScore)

    part.start()
  }
  // const part = new Part((time, value) => {
  //   }
  //   instrument.releaseAll()
  //   instrument.triggerAttackRelease(value.chord, CHORD_DURATION, time)
  // }, chordScore)

  // part.start()

  Transport.start()
}

async function getInstrument(instrumentName: string): Promise<Instrument> {
    let instrument = loadedInstruments[instrumentName]

    if (!instrument) {
        instrument = await createInstrument(instrumentName)
        loadedInstruments[instrumentName] = instrument
    }
    return instrument
}

export async function createInstrument(instrumentName: string): Promise<Instrument> {
  return instrumentName === 'synth' ? createSynth() : loadSampler(instrumentName)
}

async function createSynth(): Promise<PolySynth> {
  const { PolySynth } = await getToneLib()
  return new PolySynth().toDestination()
}

async function loadSampler(instrumentName: string): Promise<Sampler> {
  if (!samplerLibraryContainer.SampleLibrary) {
    const { SampleLibrary } = await getToneLib()
    samplerLibraryContainer.SampleLibrary = new SampleLibrary()
  }

  const sampleLibrary = samplerLibraryContainer.SampleLibrary
  return new Promise((resolve) => {
    const sampler: Sampler = sampleLibrary.load({
      list: instrumentName,
      onload: () => {
        sampler.toDestination()
        resolve(sampler)
      },
    })
  })
}
