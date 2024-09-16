<script>
    import * as Tone from "tone";

    let bpm = 99;
    let beat = 0;
    let isPlaying = false;
    let length = 8;

    const synths = [
        new Tone.Synth().toDestination(),
        new Tone.Synth().toDestination(),
        new Tone.Synth().toDestination(),
        new Tone.Synth().toDestination(),
        new Tone.Synth().toDestination(),
        new Tone.Synth().toDestination(),
        new Tone.Synth().toDestination()
    ]

    Tone.BaseContext.lookAhead = 0;

    const scaleOfNotes = ["C4", "D4", "Eb4", "F4", "G4", "A4", "Bb4"];

    let rows = [
        Array.from({ length: length }, (_, i) => ({ note: scaleOfNotes[6], active: false})),
        Array.from({ length: length }, (_, i) => ({ note: scaleOfNotes[5], active: false})),
        Array.from({ length: length }, (_, i) => ({ note: scaleOfNotes[4], active: false})),
        Array.from({ length: length }, (_, i) => ({ note: scaleOfNotes[3], active: false})),
        Array.from({ length: length }, (_, i) => ({ note: scaleOfNotes[2], active: false})),
        Array.from({ length: length }, (_, i) => ({ note: scaleOfNotes[1], active: false})),
        Array.from({ length: length }, (_, i) => ({ note: scaleOfNotes[0], active: false}))
    ];

    let beatIndicators = Array.from({ length: length }, (_, i) => i);

    const myTransport = Tone.getTransport();

    myTransport.scheduleRepeat(time => {
        rows.forEach((row, index) => {
            let synth = synths[index];
            let note = row[beat];
            if (note.active) {
                synth.triggerAttackRelease(note.note, "8n", time);
            }
        });
        beat = (beat+1) % length;
    }, "16n");

    const handleNoteClick = (rowIndex, noteIndex) => {
        rows[rowIndex][noteIndex].active = !rows[rowIndex][noteIndex].active;
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
</div>

<div class="sequencer">
    {#each beatIndicators as beatIndicator, bi}
        <div class="beat-indicator {bi === beat ? 'live' : ''}"></div>
    {/each}
    {#each rows as row, i}
        {#each row as note, j}
            <button 
            on:click={() => handleNoteClick(i, j)}
            id="row{i}note{j}"
            class="note {note.active ? 'active' : ''} {j % 4 === 0 ? 'first-beat-of-the-bar': ''}" class:live={j === beat}></button>
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

    .note{
        background: #ccc;
        width: 4vw;
        height: 4vw;
        border: 1px solid #ccc;
        border-radius: 7px;
        /* display: flex; */
        /* justify-content: center; */
        /* align-items: center; */
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

    .first-beat-of-the-bar {
        background: #98c9fa;
        border: 1px solid #98c9fa;
    }

    .active {
        background: #600889;
        border: 1px solid #600889;
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

    .live {
        background: #05f18f;;
    }

    :global(.lively) {
        background: #05f18f;;
    }
</style>