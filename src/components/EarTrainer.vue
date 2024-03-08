<template>
  <div>
    <h1 class="flex justify-center scroll-m-20 text-6xl font-bold tracking-tight">Ear Trainer</h1>
    <div v-if="!isTraining">
      <div class="flex justify-center items-center my-1">
        <Button variant="outline" class="my-1 focus:ring-transparent" @click="replayChords()">
          <SoundIcon />
        </Button>
      </div>
      <div class="my-2">
        <ChordButton
          v-for="chord in chordScale"
          :key="chord"
          :class="{
            'correct-answer': chord === secondChordRomanNotation && hasBeenSelected.has(chord),
            'wrong-answer': chord !== secondChordRomanNotation && hasBeenSelected.has(chord),
          }"
          :disabled="firstTry"
          @click="checkGuess(chord)"
        >
          {{ chord }}
        </ChordButton>
      </div>
    </div>
    <div v-else>
      <div class="flex justify-center items-center my-1">
        <Button variant="outline" class="mx-1 focus:ring-transparent" @click="newTonicTraining">
          Change the tonic
        </Button>
      </div>
      <div class="my-2">
        <ChordButton
          v-for="chord in chordScale.slice(1)"
          :key="chord"
          @click="practiseChord(chord, -1)"
        >
          - {{ chord }}
        </ChordButton>
        <ChordButton v-for="chord in chordScale" :key="chord" @click="practiseChord(chord, 1)">
          {{ chord }}
        </ChordButton>
      </div>
    </div>
    <Select v-model="currrentChordsOption" @update:model-value="firstTry = true">
      <SelectTrigger class="my-2">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Chords options</SelectLabel>
          <SelectItem v-for="option in Object.keys(chordsOptions)" :key="option" :value="option">{{
            option
          }}</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
    <Select v-model="currentInstrumentName">
      <SelectTrigger class="my-2">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Instrument</SelectLabel>
          <SelectItem v-for="option in extendedInstrumentList" :key="option" :value="option">{{
            option
          }}</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
    <div class="flex items-center justify-center space-x-2">
      <Switch id="is-training" v-model:checked="isTraining" />
      <Label for="is-training">Test/Learn</Label>
    </div>
  </div>

  <LoadingBox v-model:open="isLoading" />
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Button } from './ui/button'
import ChordButton from './ui/ChordButton.vue'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectLabel,
} from './ui/select'
import { Switch } from './ui/switch'
import { Label } from './ui/label'
import SoundIcon from './icons/SoundIcon.vue'
import LoadingBox from './ui/LoadingBox.vue'
import { chordsOptions } from '@/services/settings'
import {
  relativeChordMap,
  chromaticScaleNotes,
  getChordTones,
  notationToChord,
} from '@/services/theoryToFq'
import { playChords, createInstrument, loadedInstruments } from '@/services/fqToSound'
import { instrumentList } from '@/services/Tonejs-Instruments'

const extendedInstrumentList = instrumentList.concat(['synth'])
const currentInstrumentName = ref('synth')

const currrentChordsOption = ref('major')
const tonicNote = ref('C')
const tonicChord = computed(
  () => `${tonicNote.value}${relativeChordMap[chordScale.value[0]].chordQuality}`,
)
const secondChordRomanNotation = ref('')
const correctChord = computed(() => notationToChord(tonicNote, secondChordRomanNotation.value))

const chordScale = computed(() => chordsOptions[currrentChordsOption.value])

const hasBeenSelected = ref(new Set())

const firstTry = ref(true)
const isTraining = ref(false)
const isLoading = ref(false)

function newTonic() {
  tonicNote.value = chromaticScaleNotes[Math.floor(Math.random() * chromaticScaleNotes.length)]
}

function newTonicTraining() {
  newTonic()
  firstTry.value = true
}

function newChordPair() {
  newTonic()
  secondChordRomanNotation.value =
    chordScale.value[Math.floor(Math.random() * chordScale.value.length)]
  firstTry.value = false
}

function replayChords(chordToPlay?: string, octave?: 1 | -1): void {
  if (firstTry.value && !isTraining.value) {
    newChordPair()
  }
  const secondChord = chordToPlay || correctChord.value
  const chordNames = [tonicChord.value, secondChord]
  const chordsList = chordNames.map((chord) => getChordTones(tonicChord, chord, octave))
  const mapped = chordsList.map((chord, id) => {
    return { time: `0:${id * 2}`, chord: chord }
  })
  playChords(mapped, currentInstrumentName.value)
}

function checkGuess(userGuess: string) {
  hasBeenSelected.value.add(userGuess)
  if (userGuess === secondChordRomanNotation.value) {
    setTimeout(() => {
      hasBeenSelected.value.clear()
      newChordPair()
      replayChords()
    }, 300)
  }
}

function practiseChord(chord: string, octave?: -1 | 1) {
  replayChords(notationToChord(tonicNote, chord), octave)
}

async function onInstrumentChange(instrumentName: string) {
  if (!loadedInstruments[instrumentName]) {
    isLoading.value = true
    loadedInstruments[instrumentName] = await createInstrument(instrumentName)
    isLoading.value = false
  }
}

watch(currentInstrumentName, onInstrumentChange)
</script>

<style scoped>
.correct-answer {
  animation-name: correct-answer-anim;
  animation-duration: 0.3s;
  background-color: #4ade80;
  color: white;
  animation: glow-correct 0.3s ease-in-out alternate;
}
.correct-answer:hover {
  background-color: #22c55e;
  color: white;
}
@keyframes correct-answer-anim {
  0% {
    background-color: #22c55e;
  }

  50% {
    background-color: #86efac;
  }

  100% {
    background-color: #22c55e;
  }
}
.wrong-answer {
  animation-name: wrong-answer-anim;
  animation-duration: 0.3s;
  background-color: #f87171;
  color: white;
  animation: glow-wrong 0.3s ease-in-out alternate;
}
.wrong-answer:hover {
  background-color: #ef4444;
  color: white;
}
@keyframes wrong-answer-anim {
  0% {
    background-color: #ef4444;
  }

  50% {
    background-color: #fca5a5;
  }

  100% {
    background-color: #ef4444;
  }
}
@keyframes glow-wrong {
  0% {
    box-shadow: 0 0 10px 3px rgba(0, 0, 0, 0);
  }
  100% {
    box-shadow: 0 0 10px 3px #f87171;
  }
}
@keyframes glow-correct {
  0% {
    box-shadow: 0 0 10px 3px rgba(0, 0, 0, 0);
  }
  100% {
    box-shadow: 0 0 10px 3px #4ade80;
  }
}
</style>
