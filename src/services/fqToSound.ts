import { SampleLibrary } from '@/services/Tonejs-Instruments'
import { Transport, Part, start, context, Sampler, PolySynth } from 'tone'

type PartElement = { time: string; chord: Array<string> }
type Instrument = PolySynth | Sampler
type InstrumentMap = Record<string, Instrument>

export const loadedInstruments: InstrumentMap = {}

const sampleLibrary = new SampleLibrary()

export async function playChords(chordScore: PartElement[], instrumentName: string) {
  if (context.state !== 'running') {
    context.resume()
    start()
  }
  let instrument: Instrument | undefined = loadedInstruments[instrumentName]

  if (!instrument) {
    instrument = createSynth()
    loadedInstruments[instrumentName] = instrument
  }

  const chordDuration = '4n'

  instrument.releaseAll()
  Transport.stop()
  Transport.cancel()
  const part = new Part((time, value) => {
    if (instrument === undefined) {
      throw new Error()
    }
    instrument.triggerAttackRelease(value.chord, chordDuration, time)
  }, chordScore)
  part.stop()
  await start()
  part.start(0)
  Transport.position = 0
  Transport.start()
}

export async function createInstrument(instrumentName: string): Promise<Instrument> {
  if (instrumentName == 'synth') {
    return createSynth()
  }

  return await loadSampler(instrumentName)
}

function createSynth(): PolySynth {
  return new PolySynth().toDestination()
}

function loadSampler(instrumentName: string): Promise<Sampler> {
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
