<script>
    import * as Tone from "tone";
	import SequencerStep from "../components/SequencerStep.svelte";
	import TransportButton from "../components/TransportButton.svelte";
    import { onMount } from "svelte";

    let bpm = 99;
    let beat = -1;
    let isPlaying = false;
    let length = 8;
    let sequencerVisible = true;
    let scales = [ 
        {label: "cMajor", value: ["C4", "D4", "E4", "F4", "G4", "A4", "B4"]},
        {label: "gMinor", value: ["G3", "A3", "Bb3", "C4", "D4", "Eb4", "F4"]},
        {label: "daft", value: ["C4", "D4", "E4", "G3", "A3", "Bb3", "E4"]}
    ];
    let selectedScale = scales[0];

    let scaleOfNotes = scales[0].value;

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

    const handleSettingsClick = (e) => {
        if(sequencerVisible){
            sequencerVisible = false;
        } else {
            sequencerVisible = true;
        }
        harpRows = harpRows;
    }

    const changeScale = (scale) => {
        console.log(scale.label);
        let whichNote = harpRows.length-1;
            harpRows.forEach((row, index) => {
                row.forEach((note) => note.note = scale.value[whichNote])
                whichNote = whichNote -1;
            })
    }

    $: changeScale(selectedScale);

    const handleSave = () => {
        console.log("save");
    }

    $: if (isPlaying) {
        myTransport.bpm.value = bpm;
    }

    const fullscreenSupport = !!(
      document.fullscreenEnabled ||
      document.webkitFullscreenEnabled ||
      document.mozFullScreenEnabled ||
      document.msFullscreenEnabled ||
      false
    );

    
  
    const requestFullscreen = () => {
      const requestFS = (
        fsContainer.requestFullscreen ||
        fsContainer.mozRequestFullScreen ||
        fsContainer.webkitRequestFullscreen ||
        fsContainer.msRequestFullscreen ||
        noop
      ).bind(fsContainer);
      requestFS();
    };

    onMount(() => {
    // Add the icon stylesheet dynamically
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/icon?family=Material+Icons";
    document.head.appendChild(link);

    // remove the link when component is unmounted
    return () => {
      link.parentNode.removeChild(link);
    };
  });


  let isFull = false;
  let fsContainer = null;

  const noop = () => {};

  const fsToggle = () => {
      if (!fullscreenSupport) return;
  
      if (isFull) {
        exitFullscreen();
      } else {
        requestFullscreen(fsContainer);
      }
    };

    const exitFullscreen = (
      document.exitFullscreen ||
      document.mozCancelFullScreen ||
      document.webkitExitFullscreen ||
      document.msExitFullscreen ||
      noop
    ).bind(document);

  $: icon = isFull ? "fullscreen_exit" : "fullscreen";

  function fullscreenchanged() {
        if (document.fullscreenElement) {
            isFull = true;
        } else {
            isFull = false;
        }
    }

    addEventListener("fullscreenchange", fullscreenchanged)


</script>

<div class="fs" class:isFull bind:this={fsContainer}>

    <div class="container">
        <div class="bpm-controls">
            
            {#if fullscreenSupport}
                <button on:click={fsToggle}>
                    <i class="material-icons md-36">{icon}</i>
                </button>
            {/if}

            {#if sequencerVisible}
                <TransportButton 
                on:clicked={handleSettingsClick}
                buttonName = "{{name: "Settings", colour: "powderblue"}}"
                />
            {:else}
                <TransportButton 
                on:clicked={handleSettingsClick}
                buttonName = "{{name: "Back", colour: "grey"}}"
                />
            {/if}

            {#if isPlaying}
                <TransportButton 
                on:clicked={handleStopClick}
                buttonName = "{{name: "Stop", colour: "Red"}}"
                />
            {:else}
                <TransportButton 
                on:clicked={handlePlayClick}
                buttonName = "{{name: "Play", colour: "green"}}"
                />
            {/if}

            <TransportButton 
            on:clicked={handleSave}
            buttonName = "{{name: "Save", colour: "orange"}}"
            />

        </div>
        
        {#if sequencerVisible}
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
        {:else}
        
            <select class="scale-menu" bind:value={selectedScale}>
                {#each scales as option}
                    <option value={option}>{option.label}</option>
                {/each}	
            </select>
     
        {/if}

        <div class="bpm-controls">
            <label class="bpm-value" for="bpm" >{bpm} BPM</label>
            <input class="bpm-slider" type="range" id="bpm" min="40" max="170" bind:value={bpm} />
        </div>

    
    </div>
</div>


<style>

    :global(body) {
        background: #222;
    }

    .container {
        max-width: 600px;
        height: 95vh;
        margin-inline: auto;  
    }
    
    
    @media (min-width: 2000px) {
        .container {
                max-width: 900px;
                height: 95vh;
                margin-inline: auto;  
            }
    }
    
    @media (orientation: portrait) {
        .container {
            max-width: 700px;
            height: 95vh;
            margin-inline: auto;  
        } 
    }

    button {
        margin: 0 1em;
    }

    .sequencer {
        display: grid;
        grid-template-columns: repeat(8, 1fr);
        gap: 5px;
        margin: auto;
        justify-content: center;
    }

    .scale-menu {
        display: grid;
        grid-template-columns: repeat(8, 1fr);
        gap: 5px;
        margin: auto;
        justify-content: center;
    }

    .bpm-controls {
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 1em 0;
        height: 10%;
    }

    .bpm-controls label {
        color: #fff;
    }

    .bpm-value {
        width: 20%;
        background-size: 8vw; 
        margin: 0 1em 1em 0;
        font-family: 'Courier New', Courier, monospace;
        font-weight: bold;
        font-size: 1em;
        color: white;
        text-align: center;
    }

    .bpm-slider {
        width: 150%;
        margin: 0 1em 1em 0;
    }

    :global(.lively) {
        background: #05f18f;;
    }
</style>