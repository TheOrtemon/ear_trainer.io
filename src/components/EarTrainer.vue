<template>
  <div>
    <h1 class="flex justify-center scroll-m-20 text-6xl font-bold tracking-tight pb-2">
      Ear Trainer
    </h1>
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
          :disabled="isfirstTry"
          :fraction="guessedInversionsFractions[chord]"
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
    <Select v-model="currrentChordsOption" @update:model-value="isfirstTry = true">
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
import { computed, ref, watch, type Ref } from 'vue'
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
  notationToChordName,
  chordsToPart,
  newTonic,
} from '@/services/theoryToFq'
import { playChords, createInstrument, loadedInstruments, getToneLib } from '@/services/fqToSound'
import { chord as newChord } from 'teoria'

const isfirstTry = ref(true)
const isTraining = ref(false)
const isLoading = ref(false)
const isHardDifficulty = ref(false)

const extendedInstrumentList = instrumentList.concat(['synth'])
const currentInstrumentName = ref('synth')

const currrentChordsOption = ref('major')
const chordScale = computed(() => chordsOptions[currrentChordsOption.value])

const tonicNote = ref('C')
const tonicChordName = computed(
  () => `${tonicNote.value}${relativeChordMap[chordScale.value[0]].chordQuality}`,
)
const tonicChord = computed(() => newChord(tonicChordName.value))

const secondChordRomanNotation = ref('')
const secondChordName = computed(() =>
  notationToChordName(tonicNote.value, secondChordRomanNotation.value),
)

const inversion = ref(0)
const inversions = computed(() => {
  const notesNum = tonicChord.value.voicing().length
  return Array(notesNum + 1)
    .fill(null)
    .map((_, i) => i)
})

interface InversionMap {
  [key: number]: boolean | undefined
}

const guessedInversions: Ref<Record<string, InversionMap>> = ref(
  Object.fromEntries(chordScale.value.map((chord) => [chord, inversionGuessesBasis()])),
)

const guessedInversionsFractions: Ref<Record<string, number>> = computed(() => {
  return Object.fromEntries(
    Object.entries(guessedInversions.value).map(([key, inversionMap]) => {
      const correctNum = Object.values(inversionMap).reduce((acc, curVal) => acc + curVal)
      const keysNum = Object.keys(inversionMap).length
      const fraction = correctNum / keysNum
      return [key, fraction]
    }),
  )
})

const hasBeenSelected = ref(new Set())

function newTonicTraining() {
  tonicNote.value = newTonic()
  isfirstTry.value = true
}

function newChordPair() {
  if (isHardDifficulty.value) {
    inversion.value = Math.floor(Math.random() * 4)
  } else {
    inversion.value = Math.random() > 0.5 ? 0 : 3
  }
  tonicNote.value = newTonic()
  secondChordRomanNotation.value =
    chordScale.value[Math.floor(Math.random() * chordScale.value.length)]
  isfirstTry.value = false
}

async function replayChords(chordToPlay?: string): Promise<void> {
  if (isfirstTry.value && !isTraining.value) {
    isLoading.value = true
    newChordPair()
    await getToneLib()
    isLoading.value = false
  }
  const comparedChordName = chordToPlay || secondChordName.value
  const chordsPart = chordsToPart(tonicChord.value, comparedChordName, inversion.value)
  playChords(chordsPart, currentInstrumentName.value)
}

function checkGuess(userGuess: string) {
  hasBeenSelected.value.add(userGuess)
  const resFlag = userGuess === secondChordRomanNotation.value
  if (resFlag) {
    const guessedWithOneTry = hasBeenSelected.value.size === 1
    guessedInversions.value[secondChordRomanNotation.value][inversion.value] = guessedWithOneTry
    setTimeout(() => {
      hasBeenSelected.value.clear()
      newChordPair()
      replayChords()
    }, 300)
  }
}

function practiseChord(chord: string) {
  replayChords(notationToChordName(tonicNote.value, chord))
}

async function onInstrumentChange(instrumentName: string) {
  if (!loadedInstruments[instrumentName]) {
    isLoading.value = true
    loadedInstruments[instrumentName] = await createInstrument(instrumentName)
    isLoading.value = false
  }
}

function inversionGuessesBasis() {
  if (isHardDifficulty.value) {
    return Object.fromEntries(inversions.value.map((inversion) => [inversion, false]))
  } else {
    return { 0: false, [inversions.value[inversions.value.length - 1]]: false }
  }
}

function dropInversionGuesses() {
  guessedInversions.value = Object.fromEntries(
    chordScale.value.map((chord) => [chord, inversionGuessesBasis()]),
  )
}

watch(currentInstrumentName, onInstrumentChange)
watch(isHardDifficulty, () => {
  inversion.value = 0
  dropInversionGuesses()
})
watch(chordScale, () => {
  dropInversionGuesses()
})
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
