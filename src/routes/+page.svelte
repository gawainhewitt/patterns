<script>
    import * as Tone from "tone";
	import Button from "../Button.svelte";

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

    const sampler = new Tone.Sampler({
        urls: {
            C4: "Harp-C4.mp3",
        },
        baseUrl: "/audio/",
        onload: () => {
        }
    });

    const reverb = new Tone.Reverb({
      decay: 3,
      predelay: 0,
      wet: 0.5
    }).toDestination();

    sampler.connect(reverb);

    sampler.set({
      release: 8,
      volume: -12
    });


    Tone.BaseContext.lookAhead = 0.5;


    let rows = [
        Array.from({ length: length }, (_, i) => ({ note: scaleOfNotes[6], active: false})), 
        Array.from({ length: length }, (_, i) => ({ note: scaleOfNotes[5], active: false})),
        Array.from({ length: length }, (_, i) => ({ note: scaleOfNotes[4], active: false})),
        Array.from({ length: length }, (_, i) => ({ note: scaleOfNotes[3], active: false})),
        Array.from({ length: length }, (_, i) => ({ note: scaleOfNotes[2], active: false})),
        Array.from({ length: length }, (_, i) => ({ note: scaleOfNotes[1], active: false})),
        Array.from({ length: length }, (_, i) => ({ note: scaleOfNotes[0], active: false}))
    ];


    $: beatIndicators = Array.from({ length: length }, (_, i) => i);

    const myTransport = Tone.getTransport();

    myTransport.scheduleRepeat(time => {
        rows.forEach((row, index) => {
            let note = row[beat];
            if (note.active) {
                sampler.triggerAttackRelease(note.note, "8n", time);
            }
        });
        beat = (beat+1) % length;
    }, "16n");

    const handleNoteClick = (element) => {
        const rowIndex = element.detail.rowIndex;
        const noteIndex = element.detail.noteIndex;
        rows[rowIndex][noteIndex].active = !rows[rowIndex][noteIndex].active;
        rows = rows;
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
            let whichNote = rows.length-1;
            rows.forEach((row, index) => {
                row.forEach((note) => note.note = scaleOfNotes[whichNote])
                whichNote = whichNote -1;
            })
        } else {
            cMajorSelected = true;
            scaleOfNotes = cMajor;
            let whichNote = rows.length-1;
            rows.forEach((row, index) => {
                row.forEach((note) => note.note = scaleOfNotes[whichNote])
                whichNote = whichNote -1;
            })
        }
        rows = rows;

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
    {#each beatIndicators as beatIndicator, bi}
        <div class="beat-indicator {bi === beat ? 'live' : ''}"></div>
    {/each}
    {#each rows as row, i}
        {#each row as note, j}
        <Button
            on:clicked={handleNoteClick}
            rowIndex = "{i}"
            noteIndex = "{j}"
            noteActive = "{note.active}"
            noteLive = "{j === beat}"
        />
            <!-- <button 
            on:click={() => handleNoteClick(i, j)}
            id="row{i}note{j}"
            class="note {note.active ? 'active' : ''} {j % 4 === 0 ? 'first-beat-of-the-bar': ''}" class:live={j === beat}></button> -->
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

    

    .beat-indicator {
        background: #555;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        /* display: flex; */
        /* justify-content: center; */
        /* align-items: center; */
        color: #fff;
        margin: 0 auto; 
    }

    .live {
        background: #05f18f;;
    }

    .first-beat-of-the-bar {
        background: #98c9fa;
        border: 1px solid #98c9fa;
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