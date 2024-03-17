<template>
  <div>
    <h1 class="flex justify-center scroll-m-20 text-6xl font-bold tracking-tight">Ear Trainer</h1>
    <div v-if="!isTraining">
      <div class="flex justify-center items-center my-1">
        <Button variant="outline" class="focus:ring-transparent" @click="replayChords()">
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
        <Button variant="outline" class="focus:ring-transparent" @click="newTonicTraining">
          Change the tonic
        </Button>
      </div>
      <div class="my-2">
        <ChordButton v-for="chord in chordScale" :key="chord" @click="practiseChord(chord)">
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
          <SelectItem v-for="option in Object.keys(chordsOptions)" :key="option" :value="option">
            {{ option }}
          </SelectItem>
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
          <SelectItem v-for="option in extendedInstrumentList" :key="option" :value="option">
            {{ option }}
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
    <div class="flex items-center justify-center space-x-2 my-2">
      <Switch id="is-training" v-model:checked="isTraining" />
      <Label for="is-training">Test/Learn</Label>
    </div>
    <div v-if="!isTraining" class="flex items-center justify-center space-x-2 my-2">
      <Switch id="is-training" v-model:checked="isHardDifficulty" />
      <Label for="is-training">Easy/Hard</Label>
    </div>
    <div v-if="isTraining" class="my-2">
      <h2 class="text-lg text-center font-semibold my-1">Choose inversion</h2>
      <div class="flex justify-center items-center">
        <Button
          v-for="option in inversions"
          :key="option"
          class="mx-1"
          :class="{ 'bg-green-400': option == inversion }"
          @click="inversion = option"
          >{{ option }}</Button
        >
      </div>
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
import { chordsOptions, instrumentList } from '@/services/settings'
import {
  relativeChordMap,
  chromaticScaleNotes,
  getChordTones,
  notationToChord,
  getChord,
  inverseChord,
  transposeChord,
} from '@/services/theoryToFq'
import { playChords, createInstrument, loadedInstruments } from '@/services/fqToSound'
import { chord as newChord } from 'teoria'

const extendedInstrumentList = instrumentList.concat(['synth'])
const currentInstrumentName = ref('synth')

const currrentChordsOption = ref('major')
const tonicNote = ref('C')
const tonicChordName = computed(
  () => `${tonicNote.value}${relativeChordMap[chordScale.value[0]].chordQuality}`,
)
const tonicChord = computed(() => newChord(tonicChordName.value))

const secondChordRomanNotation = ref('')
const correctChordName = computed(() => notationToChord(tonicNote, secondChordRomanNotation.value))

const inversion = ref(0)
const inversions = [0, 1, 2, 3]

const chordScale = computed(() => chordsOptions[currrentChordsOption.value])

const hasBeenSelected = ref(new Set())

const firstTry = ref(true)
const isTraining = ref(false)
const isLoading = ref(false)
const isHardDifficulty = ref(false)

function newTonic() {
  tonicNote.value = chromaticScaleNotes[Math.floor(Math.random() * chromaticScaleNotes.length)]
}

function newTonicTraining() {
  newTonic()
  firstTry.value = true
}

function newChordPair() {
  if (isHardDifficulty.value) {
    inversion.value = Math.floor(Math.random() * 4)
  } else {
    inversion.value = Math.random() > 0.5 ? 0 : 3
  }
  newTonic()
  secondChordRomanNotation.value =
    chordScale.value[Math.floor(Math.random() * chordScale.value.length)]
  firstTry.value = false
}

function replayChords(chordToPlay?: string): void {
  if (firstTry.value && !isTraining.value) {
    newChordPair()
  }
  const secondChordName = chordToPlay || correctChordName.value
  const secondChord = getChord(secondChordName)
  const transposedSecondChord = transposeChord(tonicChord.value, secondChord)
  const inversedSecondChord = inverseChord(transposedSecondChord, inversion.value)
  const chordsToPlay = [tonicChord.value, inversedSecondChord]
  const chordArpeggios = chordsToPlay.map(getChordTones)
  const mapped = chordArpeggios.map((chord, id) => {
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

function practiseChord(chord: string) {
  replayChords(notationToChord(tonicNote, chord))
}

async function onInstrumentChange(instrumentName: string) {
  if (!loadedInstruments[instrumentName]) {
    isLoading.value = true
    loadedInstruments[instrumentName] = await createInstrument(instrumentName)
    isLoading.value = false
  }
}

watch(currentInstrumentName, onInstrumentChange)
watch(isHardDifficulty, () => (inversion.value = 0))
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
  background-color: #4ade80;
  color: white;
}
@keyframes correct-answer-anim {
  0% {
    background-color: #4ade80;
  }

  50% {
    background-color: #86efac;
  }

  100% {
    background-color: #4ade80;
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
