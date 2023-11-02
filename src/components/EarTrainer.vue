<template>
  <div>
    <FwbHeading class="flex justify-center">Ear Trainer</FwbHeading>
    <div v-if="!isTraining">
      <div class="flex justify-center items-center my-1">
        <FwbButton color="light" class="mx-1 focus:ring-transparent" @click="playRandomChord()">Play Chord</FwbButton>
        <FwbButton color="light" class="mx-1 focus:ring-transparent" @click="replayChords()">Repeat Chord</FwbButton>
      </div>
      <div class="my-2">
        <FwbButton v-for="chord in chords" :key="chord" @click="checkGuess(chord)" :class="{
          'correct-answer': (chord === correctChordNotation) && hasBeenSelectedList[chords.indexOf(chord)],
          'wrong-answer': (chord !== correctChordNotation) && hasBeenSelectedList[chords.indexOf(chord)]
        }"
          pill color="alternative" size="xl" class="mx-1 focus:ring-transparent">{{ chord }}</FwbButton>
      </div>
    </div>
    <div v-else>
      <div class="flex justify-center items-center my-1">
        <FwbButton color="light" class="mx-1 focus:ring-transparent" @click="newTonic">Change the tonic</FwbButton>
      </div>
      <div class="my-2">
        <FwbButton v-for="chord in chords.slice(1)" :key="chord" @click="practiseChord(chord, -1)"
          pill color="alternative" size="xl" class="mx-1 focus:ring-transparent">- {{ chord }}</FwbButton>
        <FwbButton v-for="chord in chords" :key="chord" @click="practiseChord(chord, 1)"
          pill color="alternative" size="xl" class="mx-1 focus:ring-transparent">{{ chord }}</FwbButton>
      </div>
    </div>
    <FwbSelect v-model="currrentChordsOption" :options="chordOptionsModels" class="my-2"></FwbSelect>
    <label class="flex items-center justify-center relative cursor-pointer">
      <FwbToggle v-model="isTraining" label="Test/Learn" class="my-2"></FwbToggle>
    </label>
  </div>
</template>
  
<script setup lang="ts">
import { FwbButton, FwbHeading, FwbSelect, FwbToggle } from 'flowbite-vue'
import { ref, reactive, computed } from "vue";
import * as Tone from 'tone';
import * as teoria from 'teoria';

interface RelativeChordMap {
  [key: string]: [string, string]
}
const relative_chord_map = {
  'I': ['P1', 'M'],
  'i': ['P1', 'm'],
  'ii': ['M2', 'm'],
  'ii°': ['M2', 'dim'],
  'iii': ['M3', 'm'],
  'III': ['M3', 'M'],
  'bIII': ['m3', 'M'],
  'biii': ['m3', 'm'],
  'IV': ['P4', 'M'],
  'iv': ['P4', 'm'],
  'V': ['P5', 'M'],
  'v': ['P5', 'm'],
  'vi': ['M6', 'm'],
  'VI': ['M6', 'M'],
  'bVI': ['m6', 'M'],
  'bvi': ['m6', 'm'],
  'vii°': ['M7', 'dim'],
  'bVII': ['m7', 'M'],
} as RelativeChordMap;

const chromatic_scale_notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const chords = computed(() => 
  currrentChordsOption.value ? 
  chordsOptions[currrentChordsOption.value] : 
  chordsOptions['major']);
interface ChordOption {
  [key: string]: string[]
};
const chordsOptions: ChordOption = {
  'major': ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'], 
  'minor': ['i', 'ii°', 'bIII', 'iv', 'v', 'bVI', 'bVII'],
  'chromediants_major': ['I', 'bIII', 'III', 'bVI', 'VI'],
  'chromediants_minor': ['i', 'biii', 'iii', 'bvi', 'vi'],
};
const chordOptionsKeys = Object.keys(chordsOptions);
const chordOptionsModels = chordOptionsKeys.map(chord => {return {name: chord, value: chord}});
const currrentChordsOption = ref();
const tonic = ref('C');
const tonicChord = computed(() => 
  tonic.value && chords.value ?
  `${tonic.value}${relative_chord_map[chords.value[0]][1]}` :
  '');
const hasBeenSelectedList = computed(() => reactive(chords.value.map(() => false)));
const correctChordNotation = ref('');

function newTonic() {
  tonic.value = chromatic_scale_notes[Math.floor(Math.random() * chromatic_scale_notes.length)];
};

function playRandomChord() {
  newTonic();
  correctChordNotation.value = chords.value[Math.floor(Math.random() * chords.value.length)];
  replayChords();
};

function notationToChord(notation: string){
  let [intervalFromTonic, chordQuality] = relative_chord_map[notation];
  const intervalTonic = teoria.note(tonic.value).interval(intervalFromTonic);
  return intervalTonic.chord(chordQuality).name;
}

const correctChord = computed(() => notationToChord(correctChordNotation.value));

function replayChords(chordToPlay?: string, octave?: 1 | -1) {
  const secondChord = chordToPlay || correctChord.value
  const chordNames = [tonicChord.value, secondChord];
  const chordsList = chordNames.map(chord => getChordTones(chord, octave));
  const mapped = chordsList.map((chord, id) => { return { time: `0:${id * 2}`, chord: chord } });
  playChords(mapped);
};


function checkGuess(userGuess: string) {
  hasBeenSelectedList.value[chords.value.indexOf(userGuess)] = true;
  if (userGuess === correctChordNotation.value) {
    setTimeout(() => {
      hasBeenSelectedList.value.forEach((_, id) => hasBeenSelectedList.value[id] = false);
      playRandomChord();
    }, 300);
  }
};

function getChordTones(chordSymbol: string, octave?: 1 | -1): string[] {
  let chord = teoria.chord(chordSymbol);
  if (chordSymbol !== tonicChord.value && octave) {
    const tonicChordObject = teoria.chord(tonicChord.value)
    const tonicChordRoot = tonicChordObject.root;
    if (tonicChordRoot.fq() > chord.root.fq()) {
      if (octave === 1) {
        chord = chord.interval('P8');
      }
    } else {
      if (octave === -1) {
        chord = chord.interval('P-8');
      }
    }
  }
  const chordNotes = chord.notes();
  const notesStringed = chordNotes.map(note => note.toString());
  return notesStringed;
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
  const chordDuration = '4n'

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
  replayChords(notationToChord(chord), octave);
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