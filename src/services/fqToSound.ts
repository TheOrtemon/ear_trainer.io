import type { PolySynth, BaseContext, Transport, Part, Sampler, getDestination } from 'tone'
import type { SampleLibrary } from '@/services/Tonejs-Instruments'

export type PartElement = { time: string; chord: Array<string> }
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

let toneImportsContainer: ToneImports | undefined
const samplerLibraryContainer: SampleLibraryContainer = {}
export const loadedInstruments: InstrumentMap = {}

export async function getToneLib(): Promise<ToneImports> {
  if (toneImportsContainer === undefined) {
    const { context, start, PolySynth, Transport, Part, Sampler, getDestination } = await import(
      'tone'
    )
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

export async function playChords(chordScore: PartElement[], instrumentName: string) {
  const { context, start, Transport, Part, getDestination } = await getToneLib()
  if (context.state !== 'running') {
    context.resume()
    await start()
  }
  let instrument: Instrument | undefined = loadedInstruments[instrumentName]

  if (!instrument) {
    instrument = await createSynth()
    loadedInstruments[instrumentName] = instrument
  }

  getDestination().volume.value = -6
  const chordDuration = '4n'

  Transport.stop()
  Transport.cancel()
  const part = new Part((time, value) => {
    if (instrument === undefined) {
      throw new Error()
    }
    instrument.triggerAttackRelease(value.chord, chordDuration, time)
  }, chordScore)
  part.start()
  Transport.start()
}

export async function createInstrument(instrumentName: string): Promise<Instrument> {
  if (instrumentName == 'synth') {
    return await createSynth()
  }

  return await loadSampler(instrumentName)
}

async function createSynth(): Promise<PolySynth> {
  const { PolySynth } = await getToneLib()
  return new PolySynth().toDestination()
}

async function loadSampler(instrumentName: string): Promise<Sampler> {
  if (samplerLibraryContainer.SampleLibrary === undefined) {
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
