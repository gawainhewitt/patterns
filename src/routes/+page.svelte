<script>
    import * as Tone from "tone";
	import Button from "../Button.svelte";
	import { Instrument } from "tone/build/esm/instrument/Instrument";

    let bpm = 99;
    let beat = 0;
    let isPlaying = false;
    let length = 8;
    let cMajorSelected = true;
    const cMajor = ["C4", "D4", "E4", "F4", "G4", "A4", "B4"];
    const gMinor = ["C4", "D4", "Eb4", "F4", "G4", "A4", "Bb4"];

    // $: scaleOfNotes = cMajorSelected ? ["C4", "D4", "E4", "F4", "G4", "A4", "B4"] : ["G4", "A4", "Bb4", "C5", "D5", "Eb5", "F5"];

    let scaleOfNotes = cMajor;

    // $: scaleOfNotes = cMajorSelected ? cMajor : gMinor ;


    const synth = new Tone.PolySynth().toDestination();

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

    myTransport.scheduleRepeat(time => {
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
        beat = (beat+1) % length;
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

    const handlePlayClick = () => {
        if (!isPlaying) Tone.start();
        myTransport.bpm.value = bpm;
        myTransport.start();
        isPlaying = true;
    };

    const handleStopClick = () => {
        myTransport.stop();
        isPlaying = false;
    };

    const handleScaleClick = () => {
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
    <label for="bpm">{bpm} BPM</label>
    <input type="range" id="bpm" min="60" max="240" bind:value={bpm} />
    {#if isPlaying}
        <button on:click={handleStopClick}>Stop</button>
    {:else}
        <button on:click={handlePlayClick}>Play</button>
    {/if}
    {#if cMajorSelected}
        <button on:click={handleScaleClick}>C Major</button>
    {:else}
    <button on:click={handleScaleClick}>G Minor</button>
    {/if}
</div>

<div class="sequencer">
    {#each harpRows as row, i}
        {#each row as note, j}
        <Button
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
        <Button
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
        margin-bottom: 20px;
    }

    .bpm-controls label {
        color: #fff;
    }

    

    :global(.lively) {
        background: #05f18f;;
    }
</style>