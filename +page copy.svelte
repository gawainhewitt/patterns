<script>
      
	import SequencerStep from "../components/SequencerStep.svelte";
	import TransportButton from "../components/TransportButton.svelte";
    import { onMount } from "svelte";

    
    import * as Sound from "$lib/sound.js"
    import { FullScreen } from "$lib/fullScreen.js"
	import { scale } from "svelte/transition";

    const fullScreen = new FullScreen(false, null);
  
    let bpm = 99;
    let beat = -1;
    let isPlaying = false;
    const sequenceLength = 8;
    let viewState = 2; // 0 = home, 1 = info; 2 = sequencer; 4 = save
    
    let scales = [ 
        {label: "Major", notes: [0, 2, 4, 5, 7, 9, 11, 12, 14, 16, 17, 19], index: 0},
        {label: "Minor", notes: [0, 2, 3, 5, 7, 8, 10, 12, 14, 15, 17, 19], index: 1},
        {label: "Pentatonic", notes: [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24, 26], index: 2},
        {label: "majorBlues", notes: [0, 2, 3, 4, 7, 9, 12, 14, 15, 16, 19, 21], index: 3},
        {label: "minorBlues", notes: [0, 3, 5, 6, 7, 10, 12, 15, 17, 18, 19, 22], index: 4}
    ];
    let keys = [{key: "C", index: 0}, {key: "C#", index: 1}, {key: "D", index: 2}, {key: "D#", index: 3}, {key: "E", index: 4}, {key: "F", index: 5}, {key: "F#", index: 6}, {key: "G", index: 7}, {key: "G#", index: 8}, {key: "A", index: 9}, {key: "A#", index: 10}, {key: "B", index: 11}];
    let allTheNotes = [
                        "C2", "C#2", "D2", "D#2", "E2", "F2", "F#2", "G2", "G#2", "A2", "A#2", "B2",
                        "C3", "C#3", "D3", "D#3", "E3", "F3", "F#3", "G3", "G#3", "A3", "A#3", "B3",
                        "C4", "C#4", "D4", "D#4", "E4", "F4", "F#4", "G4", "G#4", "A4", "A#4", "B4",
                        "C5", "C#5", "D5", "D#5", "E5", "F5", "F#5", "G5", "G#5", "A5", "A#5", "B5",
                        "C6", "C#6", "D6", "D#6", "E6", "F6", "F#6", "G6", "G#6", "A6", "A#6", "B6",
                        "C7", "C#7", "D7", "D#7", "E7", "F7", "F#7", "G7", "G#7", "A7", "A#7", "B7",
                        "C8", "C#8", "D8", "D#8", "E8", "F8", "F#8", "G8", "G#8", "A8", "A#8", "B8"
                    ];

    
    let octaves = [0, 1, 2, 3, 4]
    let selectedKey = keys[0];
    let selectedScale = scales[0];
    let selectedOctave = octaves[2];

    let scaleOfNotes = scales[0].notes;

    let harpRows = [
        Array.from({ length: sequenceLength }, (_, i) => ({ note: scaleOfNotes[6], active: false})), 
        Array.from({ length: sequenceLength  }, (_, i) => ({ note: scaleOfNotes[5], active: false})),
        Array.from({ length: sequenceLength  }, (_, i) => ({ note: scaleOfNotes[4], active: false})),
        Array.from({ length: sequenceLength  }, (_, i) => ({ note: scaleOfNotes[3], active: false})),
        Array.from({ length: sequenceLength  }, (_, i) => ({ note: scaleOfNotes[2], active: false})),
        Array.from({ length: sequenceLength  }, (_, i) => ({ note: scaleOfNotes[1], active: false})),
        Array.from({ length: sequenceLength  }, (_, i) => ({ note: scaleOfNotes[0], active: false}))
    ];

    let drumRows = [
        Array.from({ length: sequenceLength  }, (_, i) => ({ note: "E4", instrumentName: "woodblock", active: false})),
        Array.from({ length: sequenceLength  }, (_, i) => ({ note: "D4", instrumentName: "snare", active: false})),
        Array.from({ length: sequenceLength  }, (_, i) => ({ note: "C4", instrumentName: "kick", active: false})),
    ]

    Sound.myTransport.scheduleRepeat((time) => {
        beat = (beat+1) % sequenceLength;
        harpRows.forEach((row, index) => {
            let note = row[beat];
            if (note.active) {  
                Sound.harpSampler.triggerAttackRelease(note.note, "8n", time);
            }
        });
        drumRows.forEach((row, index) => {
            let note = row[beat];
            if (note.active) {
                Sound.drumSampler.triggerAttackRelease(note.note, "8n", time);
            }
        });
    }, "16n");

    const changeScale = (key, scale, octave) => {
        let octaveOffset = octave * 12;
        
        let whichNote = harpRows.length-1;
            harpRows.forEach((row, index) => {
                let keyOffset = key.index;
                let scaleNote = scale.notes[whichNote];
                let formattedNoted = allTheNotes[scaleNote+keyOffset+octaveOffset];
                row.forEach((note) => note.note = formattedNoted)
                whichNote = whichNote -1;
            })
    }

    changeScale(selectedKey, selectedScale, selectedOctave);

    $: changeScale(selectedKey, selectedScale, selectedOctave);

   
    $: if (isPlaying) {
        Sound.myTransport.bpm.value = bpm;
    }

    // event handlers

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
        if (!isPlaying) Sound.startSound();
        Sound.myTransport.bpm.value = bpm;
        Sound.myTransport.start();
        isPlaying = true;
    };

    const handleStopClick = (e) => {
        Sound.myTransport.stop();
        isPlaying = false;
    };

    const handleSettingsClick = (e) => {
        if(viewState === 2){
            viewState = 3;
        } else {
            viewState = 2;
        }
        harpRows = harpRows;
    }

    const handleSave = () => {
        saveSeq();
        if(viewState === 4){
            viewState = 2;
        } else {
            viewState = 4;
        }
    }

    const handleCopyURLClick = () => {
        navigator.clipboard.writeText(saveText);
        alert("Copied the text: " + saveText);
        
        viewState = 2;
    }

    

    

    // fullscreen stuff that needs to stay in the app as it effects the reactivity. If it is changed within the class then it doesn't communicate that externally

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

    const fullscreenchanged = () => {
        if (document.fullscreenElement) {
            fullScreen.isFull = true;
        } else {
            fullScreen.isFull = false;
        }
    }

    addEventListener("fullscreenchange", fullscreenchanged);

    $: icon = fullScreen.isFull ? "fullscreen_exit" : "fullscreen";


    // save functionality

    let url_ob = new URL(document.URL);
    let saveText;

    const handleClearSavedWorkClick = () => {
        document.location.href = '';
        saveText = new_url;
    }

    const handleSaveRestore = (row, step) => {
        if(row < harpRows.length){
            harpRows[row][step].active = true;
        } else {
            let drumRow = row - harpRows.length;
            drumRows[drumRow][step].active = true;
        }
    }

    function saveSeq() {
        let seqRowsArray = new Array;

        for(let i = 0; i < harpRows.length; i++) {
            seqRowsArray[i] = new Array;
            for(let j = 0; j < sequenceLength; j++) {
                seqRowsArray[i][j] = + harpRows[i][j].active;
            }
        }
        for(let i = harpRows.length; i < harpRows.length + drumRows.length; i++) {
            seqRowsArray[i] = new Array;
            for(let j = 0; j < sequenceLength; j++) {
                seqRowsArray[i][j] = + drumRows[i-harpRows.length][j].active;
            }
        }

        let simplifiedArray= new Array;

        for(let i = 0; i < seqRowsArray.length; i++) {
            simplifiedArray[i] = seqRowsArray[i].join('');
        }


        let seqHex = new Array;
        for(let i = 0; i < simplifiedArray.length; i++){
            seqHex[i] = parseInt(simplifiedArray[i], 2).toString(16);
        }

        let hexToSave = '';
        for(let i = 0; i < simplifiedArray.length; i++){
            hexToSave = `${hexToSave}${seqHex[i]}_`;
        }

        let bpmToSave = parseInt(bpm, 10).toString(16);

        hexToSave = `${hexToSave}_${bpmToSave}_${selectedKey.index}_${selectedScale.index}_${selectedOctave}`;
        url_ob.hash = `#${hexToSave}`;
        let new_url = url_ob.href;
        document.location.href = new_url;
        saveText = new_url;
        console.log(saveText);
    }

    function retrieveSavedWork() {
        if(window.location.hash){
            let savedWork = url_ob.hash; //retrieve saved work from url
            let savedWorkNoHash = savedWork.replace('#', ''); // remove the hash from it leaving only the number
            let savedWorkAsArray = savedWorkNoHash.split('_');
            let seqRows = harpRows.length + drumRows.length;
       
            let savedseqRowBinary = new Array;
            
            for(let i = 0; i < seqRows; i++){
                savedseqRowBinary[i] = (parseInt(savedWorkAsArray[i], 16).toString(2)); // convert seq row to binary
            }
            
            let savedseqRow = new Array;
            
            for(let i = 0; i < seqRows; i++){
            savedseqRow[i] = savedseqRowBinary[i].split(''); // convert to array
            }
            
            let savedTempo = (parseInt(savedWorkAsArray[seqRows+1], 16).toString(10));// convert tempo to decimal
                
            let savedKey = (parseInt(savedWorkAsArray[seqRows+2], 16).toString(10));
        
            let savedScale = (parseInt(savedWorkAsArray[seqRows+3], 16).toString(10));
        
            let savedOctave = (parseInt(savedWorkAsArray[seqRows+4], 16).toString(10));
      
            selectedKey = keys[savedKey];
            selectedScale = scales[savedScale];
            selectedOctave = octaves[savedOctave];
    
            for(let i = 0; i < seqRows; i++){
                for(let j = sequenceLength - 1; j >= 0 ; j--){
                    let a = [];
                    if(savedseqRow[i].length > 0){
                        a[j] = savedseqRow[i].pop();
                        }else{
                        a[j] = 0;
                        }
                    if(a[j] === "1"){ // you need to put "" around the number because you are comparing a number with a string
                        handleSaveRestore(i, j);
                    }
                }
            }
    
            if(isNaN(savedTempo) === false){
                bpm = savedTempo;
            }

        }

    }

    retrieveSavedWork();
</script>

<div class="fs" bind:this={fullScreen.fsContainer}>

    <div class="container">
        <div class="bpm-controls">
            
            {#if fullScreen.fullscreenSupport}
                <button on:click={fullScreen.fsToggle}>
                    <i class="material-icons md-36">{icon}</i>
                </button>
            {/if}

            {#if viewState === 3}
                <TransportButton 
                on:clicked={handleSettingsClick}
                buttonName = "{{name: "Back", colour: "powderblue"}}"
                />
            {:else}
                <TransportButton 
                on:clicked={handleSettingsClick}
                buttonName = "{{name: "Settings", colour: "grey"}}"
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

            {#if viewState === 4}
                <TransportButton 
                on:clicked={handleSave}
                buttonName = "{{name: "Back", colour: "orange"}}"
                />
            {:else}
                <TransportButton 
                on:clicked={handleSave}
                buttonName = "{{name: "Save", colour: "orange"}}"
                />
            {/if}

        </div>
        
        {#if viewState === 2}
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
        {:else if viewState === 3}
        
            <div class="select-div">
                <label class="select-label" for="keymenu">Change Key</label>

                <select id="keymenu" class="select-menu" bind:value={selectedKey}>
                    {#each keys as option}
                        <option value={option}>{option.key}</option>
                    {/each}	
                </select>
            
                <label class="select-label" for="scalemenu">Change Scale</label>

                <select id="scalemenu" class="select-menu" bind:value={selectedScale}>
                    {#each scales as option}
                        <option value={option}>{option.label}</option>
                    {/each}	
                </select>

                <label class="select-label" for="octavemenu">Change Octave</label>

                <select id="octavemenu" class="select-menu" bind:value={selectedOctave}>
                    {#each octaves as option}
                        <option value={option}>{option}</option>
                    {/each}	
                </select>

                <TransportButton 
                on:clicked={handleClearSavedWorkClick}
                buttonName = "{{name: "Clear Saved Work", colour: "Red"}}"
                />

            </div>

        {:else if viewState === 4}
            
            <div class="save-text-box">
                <h3 class="saved-text">Share this URL to share your work.</h3>

                <h3 class="saved-text" id="save-text">{saveText}</h3>
                
                {#if navigator.clipboard}
                    <TransportButton 
                    on:clicked={handleCopyURLClick}
                    buttonName = "{{name: "Copy URL To Clipboard", colour: "blue"}}"
                    />
                {:else}
                    <TransportButton 
                    on:clicked={handleSave}
                    buttonName = "{{name: "Back", colour: "blue"}}"
                    />
                {/if}
            </div>
     
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
        margin: 0 1em 0 0.5em;
        font-size: 2em;
    }

    .save-text-box {
        margin: 5%;
    }

    .saved-text {
        font-family: 'Courier New', Courier, monospace;
        font-weight: bold;
        font-size: 1em;
        color: white;
        text-align: center;
        overflow-wrap: break-word;
    }

    .sequencer {
        display: grid;
        grid-template-columns: repeat(8, 1fr);
        gap: 5px;
        margin: auto;
        justify-content: center;
    }

    .select-menu {
        margin: 2em;
        justify-content: center;
        font-family: 'Courier New', Courier, monospace;
        font-weight: bold;
        font-size: 1em;
    }

    .select-label {
        background-size: 8vw; 
        margin: 0 1em 1em 0;
        font-family: 'Courier New', Courier, monospace;
        font-weight: bold;
        font-size: 1em;
        color: white;
        text-align: center;
    }

    .select-div {
        display: grid;
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