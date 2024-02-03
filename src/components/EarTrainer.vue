<template>
  <div>
    <FwbHeading class="flex justify-center">Ear Trainer</FwbHeading>
    <div v-if="!isTraining">
      <div class="flex justify-center items-center my-1">
        <FwbButton color="light" class="mx-1 focus:ring-transparent" @click="replayChords()">
          <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
            <path fill-rule="evenodd" d="M18.5 3.1c.3.2.5.5.5.9v16a1 1 0 0 1-1.6.8L12 17V7.1l5.4-4a1 1 0 0 1 1 0ZM22 12a4 4 0 0 1-2 3.5v-7c1.2.7 2 2 2 3.5ZM10 8H4a1 1 0 0 0-1 1v6c0 .6.4 1 1 1h6V8Zm0 9H5v3c0 .6.4 1 1 1h3c.6 0 1-.4 1-1v-3Z" clip-rule="evenodd"/>
          </svg>
        </FwbButton>
      </div>
      <div class="my-2">
        <FwbButton v-for="chord in chordScale" :key="chord" @click="checkGuess(chord)" :class="{
          'correct-answer': (chord === secondChordRomanNotation) && hasBeenSelectedList[chordScale.indexOf(chord)],
          'wrong-answer': (chord !== secondChordRomanNotation) && hasBeenSelectedList[chordScale.indexOf(chord)],
        }"
          pill color="alternative" size="xl" class="mx-1 focus:ring-transparent" :disabled="firstTry">{{ chord }}</FwbButton>
      </div>
    </div>
    <div v-else>
      <div class="flex justify-center items-center my-1">
        <FwbButton color="light" class="mx-1 focus:ring-transparent" @click="newTonicTraining">Change the tonic</FwbButton>
      </div>
      <div class="my-2">
        <FwbButton v-for="chord in chordScale.slice(1)" :key="chord" @click="practiseChord(chord, -1)"
          pill color="alternative" size="xl" class="mx-1 focus:ring-transparent">- {{ chord }}</FwbButton>
        <FwbButton v-for="chord in chordScale" :key="chord" @click="practiseChord(chord, 1)"
          pill color="alternative" size="xl" class="mx-1 focus:ring-transparent">{{ chord }}</FwbButton>
      </div>
    </div>
    <FwbSelect v-model="currrentChordsOption" :options="chordOptionsModels" class="my-2" placeholder="Please select chords option" @update:model-value="firstTry = true"/>
    <label class="flex items-center justify-center relative cursor-pointer">
      <FwbToggle v-model="isTraining" label="Test/Learn" class="my-2"></FwbToggle>
    </label>
  </div>
</template>
  
<script setup lang="ts">
import { FwbButton, FwbHeading, FwbSelect, FwbToggle } from "flowbite-vue";
import * as Tone from "tone";
import { computed, reactive, ref } from "vue";
import { chordsOptions } from "@/services/settings"
import { relativeChordMap, chromaticScaleNotes, getChordTones, notationToChord } from "@/services/theoryToFq";

let firstTry = ref(true);
const chordScale = computed(() => chordsOptions[currrentChordsOption.value]);

const chordOptionsModels = Object.keys(chordsOptions).map(
  chord => {return {name: chord, value: chord}}
);

const currrentChordsOption = ref("major");
const tonicNote = ref("C");
const tonicChord = computed(() => 
  `${tonicNote.value}${relativeChordMap[chordScale.value[0]].chordQuality}`
);
const hasBeenSelectedList = computed(() => reactive(chordScale.value.map(() => false)));
const secondChordRomanNotation = ref("");

function newTonic() {
  tonicNote.value = chromaticScaleNotes[Math.floor(Math.random() * chromaticScaleNotes.length)];
}

function newTonicTraining() {
  newTonic();
  firstTry.value = true;
}

function newChordPair() {
  newTonic();
  secondChordRomanNotation.value = chordScale.value[Math.floor(Math.random() * chordScale.value.length)];
  firstTry.value = false;
};

const correctChord = computed(() => notationToChord(tonicNote, secondChordRomanNotation.value));

function replayChords(chordToPlay?: string, octave?: 1 | -1) {
  if (firstTry.value && !isTraining.value) {
    newChordPair();
  }
  const secondChord = chordToPlay || correctChord.value
  const chordNames = [tonicChord.value, secondChord];
  const chordsList = chordNames.map(chord => getChordTones(tonicChord, chord, octave));
  const mapped = chordsList.map((chord, id) => { return { time: `0:${id * 2}`, chord: chord } });
  playChords(mapped);
};

function checkGuess(userGuess: string) {
  hasBeenSelectedList.value[chordScale.value.indexOf(userGuess)] = true;
  if (userGuess === secondChordRomanNotation.value) {
    setTimeout(() => {
      hasBeenSelectedList.value.forEach((_, id) => hasBeenSelectedList.value[id] = false);
      newChordPair();
      replayChords();
    }, 300);
  }
};

let synth: Tone.PolySynth;
type ChordScore = Array<{ time: string, chord: Array<string>}>

function playChords(chordScore: ChordScore): void {
  if (Tone.context.state !== "running") {
    Tone.context.resume();
    Tone.start();
  }
  if (!synth) {
    synth = new Tone.PolySynth().toDestination();
  }
  const chordDuration = "4n"

  synth.releaseAll();
  Tone.Transport.stop();
  Tone.Transport.cancel();
  const part = new Tone.Part((time, value) => {
    synth.triggerAttackRelease(value.chord, chordDuration, time);
  }, chordScore);
  part.stop();
  Tone.start();
  part.start(0);
  Tone.Transport.position = 0;
  Tone.Transport.start();
};

const isTraining = ref(false);

function practiseChord(chord: string, octave?: -1 | 1) {
  replayChords(notationToChord(tonicNote, chord), octave);
}
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