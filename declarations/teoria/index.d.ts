interface Duration {
    value: number
    dots: number
}

declare module 'teoria' {
    export class Note {
        constructor(name: string , duration?: Duration);
        name: string;
        duration: Duration;
        octave(): number;
        interval(interval: string | Interval): Note;
        interval(interval: Note): Interval;
        chord(quality: string): Chord;
        fq(): number;
        static fromString(name: string, duration: Duration): Note;
    };
    function note(name: string, duration?: Duration): Note;
    namespace note{
        function fromString(name: string, duration?: Duration): Note;
    };

    export class Interval {
        constructor(coord: number[]);
        coord: number[];
    };
    function interval(from: string | Note, to: string | Note | Interval): Interval;

    export class Chord {
        constructor(name: Note, symbol?: string);
        name: string; 
        symbol: string; 
        root: Note;
        notes(): Note[];
        interval(interval: string | Interval): Chord;
        interval(interval: Note): Chord;
    };
    function chord(name: string | Note, symbol?: string | number): Chord;
}
