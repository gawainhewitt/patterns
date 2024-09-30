<script>
    import * as Tone from "tone";
	import SequencerStep from "../components/SequencerStep.svelte";
	import { Instrument } from "tone/build/esm/instrument/Instrument";
	import TransportButton from "../components/TransportButton.svelte";

    let bpm = 99;
    let beat = 0;
    let isPlaying = false;
    let length = 8;
    let cMajorSelected = true;
    const cMajor = ["C4", "D4", "E4", "F4", "G4", "A4", "B4"];
    const gMinor = ["G3", "A3", "Bb3", "C4", "D4", "Eb4", "F4"];

    let scaleOfNotes = cMajor;

    const harpSampler = new Tone.Sampler({
        urls: {
            C4: "Harp-C4.mp3",
        },
        baseUrl: "/audio/",
        onload: () => {
        }
    });

    const drumSampler = new Tone.Sampler({
        urls: {
            C4: "kick.mp3",
            D4: "snare.mp3",
            E4: "woodblock.mp3"
        },
        baseUrl: "/audio/",
        onload: () => {
        }
    }).toDestination();

    drumSampler.set({
      volume: -12
    });

    const reverb = new Tone.Reverb({
      decay: 3,
      predelay: 0,
      wet: 0.5
    }).toDestination();

    harpSampler.connect(reverb);

    harpSampler.set({
      release: 8,
      volume: -12
    });


    Tone.BaseContext.lookAhead = 0.5;


    let harpRows = [
        Array.from({ length }, (_, i) => ({ note: scaleOfNotes[6], active: false})), 
        Array.from({ length }, (_, i) => ({ note: scaleOfNotes[5], active: false})),
        Array.from({ length }, (_, i) => ({ note: scaleOfNotes[4], active: false})),
        Array.from({ length }, (_, i) => ({ note: scaleOfNotes[3], active: false})),
        Array.from({ length }, (_, i) => ({ note: scaleOfNotes[2], active: false})),
        Array.from({ length }, (_, i) => ({ note: scaleOfNotes[1], active: false})),
        Array.from({ length }, (_, i) => ({ note: scaleOfNotes[0], active: false}))
    ];

    let drumRows = [
        Array.from({ length }, (_, i) => ({ note: "E4", instrumentName: "woodblock", active: false})),
        Array.from({ length }, (_, i) => ({ note: "D4", instrumentName: "snare", active: false})),
        Array.from({ length }, (_, i) => ({ note: "C4", instrumentName: "kick", active: false})),
    ]


    $: beatIndicators = Array.from({ length: length }, (_, i) => i);

    const myTransport = Tone.getTransport();

    myTransport.scheduleRepeat((time) => {
        beat = (beat+1) % length;
        harpRows.forEach((row, index) => {
            let note = row[beat];
            if (note.active) {  
                harpSampler.triggerAttackRelease(note.note, "8n", time);
            }
        });
        drumRows.forEach((row, index) => {
            let note = row[beat];
            if (note.active) {
                drumSampler.triggerAttackRelease(note.note, "8n", time);
            }
        });
    }, "16n");

    const handleHarpClick = (element) => {
        const rowIndex = element.detail.rowIndex;
        const noteIndex = element.detail.noteIndex;
        harpRows[rowIndex][noteIndex].active = !harpRows[rowIndex][noteIndex].active;
        harpRows = harpRows;
    };
    const handleDrumClick = (element) => {
        const rowIndex = element.detail.rowIndex;
        const noteIndex = element.detail.noteIndex;
        drumRows[rowIndex][noteIndex].active = !drumRows[rowIndex][noteIndex].active;
        drumRows = drumRows;
    };

    const handlePlayClick = (e) => {
        if (!isPlaying) Tone.start();
        myTransport.bpm.value = bpm;
        myTransport.start();
        isPlaying = true;
    };

    const handleStopClick = (e) => {
        myTransport.stop();
        isPlaying = false;
    };

    const handleScaleClick = (e) => {
        if(cMajorSelected){
            cMajorSelected = false;
            scaleOfNotes = gMinor;
            let whichNote = harpRows.length-1;
            harpRows.forEach((row, index) => {
                row.forEach((note) => note.note = scaleOfNotes[whichNote])
                whichNote = whichNote -1;
            })
        } else {
            cMajorSelected = true;
            scaleOfNotes = cMajor;
            let whichNote = harpRows.length-1;
            harpRows.forEach((row, index) => {
                row.forEach((note) => note.note = scaleOfNotes[whichNote])
                whichNote = whichNote -1;
            })
        }
        harpRows = harpRows;

    }

    $: if (isPlaying) {
        myTransport.bpm.value = bpm;
    }

    

</script>


<div class="bpm-controls">
    <label class="bpm-value" for="bpm" >{bpm} BPM</label>
    <input class="bpm-slider" type="range" id="bpm" min="40" max="170" bind:value={bpm} />
    {#if isPlaying}
        <TransportButton on:clicked={handleStopClick}
        buttonName = "{{name: "Stop", colour: "Red"}}"
        />
    {:else}
        <TransportButton on:clicked={handlePlayClick}
        buttonName = "{{name: "Play", colour: "green"}}"
        />
    {/if}
    {#if cMajorSelected}
        <TransportButton on:clicked={handleScaleClick}
        buttonName = "{{name: "C Major", colour: "powderblue"}}"
        />
    {:else}
        <TransportButton on:clicked={handleScaleClick}
        buttonName = "{{name: "G Minor", colour: "grey"}}"
        />
    {/if}
</div>

<div class="sequencer">
    {#each harpRows as row, i}
        {#each row as note, j}
        <SequencerStep
            on:clicked={handleHarpClick}
            instrumentName = "harp"
            rowIndex = "{i}"
            noteIndex = "{j}"
            noteActive = "{note.active}"
            noteLive = "{j === beat}"
        />
        {/each}
    {/each}
    {#each drumRows as row, i}
        {#each row as note, j}
        <SequencerStep
            on:clicked={handleDrumClick}
            instrumentName = {note.instrumentName}
            rowIndex = "{i}"
            noteIndex = "{j}"
            noteActive = "{note.active}"
            noteLive = "{j === beat}"
        />
        {/each}
    {/each}
</div>


<style>

    :global(body) {
        background: #222;
    }

    .sequencer {
        display: grid;
        grid-template-columns: repeat(8, 1fr);
        gap: 5px;
        width: 100%;
        max-width: 800px;
        margin: auto;
        justify-content: center;
    }

    .bpm-controls {
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 1em 0;
    }

    .bpm-controls label {
        color: #fff;
    }

    .bpm-value {
        width: 14vw;
        height: 4vw;
        border-radius: 7px;
        background-size: 8vw; 
        margin: 0 1em 1em 0;
        font-family: 'Courier New', Courier, monospace;
        font-weight: bold;
        font-size: 3vw;
        color: white;
        text-align: center;
    }

    .bpm-slider {
        width: 35vw;
        height: 4vw;
        border-radius: 7px;
        background-size: 8vw; 
        margin: 0 1em 1em 0;
        font-family: 'Courier New', Courier, monospace;
        font-weight: bold;
        font-size: 3vw;
        color: white;
        text-align: center;
    }

    :global(.lively) {
        background: #05f18f;;
    }
</style>