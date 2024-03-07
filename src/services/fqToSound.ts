import { SampleLibrary } from '@/services/Tonejs-Instruments'
import { Transport, Part, start, context, Sampler, PolySynth } from 'tone'
import type { Ref } from 'vue'

type ChordScore = Array<{ time: string; chord: Array<string> }>
export type Instrument = PolySynth | Sampler
export type InstrumentMap = { [key: string]: Instrument }

export async function playChords(
  chordScore: ChordScore,
  instrumentName: Ref<string>,
  instruments: InstrumentMap,
  needToLoadInstrument: Ref<boolean>,
) {
  if (context.state !== 'running') {
    context.resume()
    start()
  }
  let instrument: Instrument | undefined = instruments[instrumentName.value]

  if (!instrument) {
    instrument = createInstrument(instrumentName.value, needToLoadInstrument)
    instruments[instrumentName.value] = instrument
  }

  const chordDuration = '4n'

  instrument.releaseAll()
  Transport.stop()
  Transport.cancel()
  const part = new Part((time, value) => {
    instrument.triggerAttackRelease(value.chord, chordDuration, time)
  }, chordScore)
  part.stop()
  await start()
  part.start(0)
  Transport.position = 0
  Transport.start()
}

export function createInstrument(
  instrumentName: string,
  needToLoadInstrument: Ref<boolean>,
): Instrument {
  let instrument: Instrument
  if (instrumentName == 'synth') {
    instrument = new PolySynth()
  } else {
    needToLoadInstrument.value = true
    const sampleLibrary = new SampleLibrary()
    instrument = sampleLibrary.load({
      list: instrumentName,
      onload: () => (needToLoadInstrument.value = false),
    })
  }
  return instrument.toDestination()
}
