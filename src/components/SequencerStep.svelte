<script>
    import { createEventDispatcher } from 'svelte';

    export let rowIndex;
    export let noteIndex;
    export let noteActive;
    export let noteLive;
    export let instrumentName;

    const dispatch = createEventDispatcher()

    const handleButton = () => {
        dispatch("clicked", {rowIndex, noteIndex});
    }

</script>


<button     
    type="button"
    on:click|preventDefault|stopPropagation={handleButton}
    id="row{rowIndex}note{noteIndex}"
    class=" note {noteActive ? 'active' : ''}" class:live={noteLive}
    style="background-image: url('{instrumentName}-pink.png')"
    >
    <div class="screen-reader-description">
        {instrumentName + ": row " + rowIndex + ": step " + noteIndex} 
    </div>
</button>

<style>
    .note{
        background-color: #ccc;
        width: 100%;
        height: 0;
        padding-bottom: 95%; /* this combined with above is allowing me to set height relative to width*/
        border: 1px solid #ccc;
        border-radius: 7px;
        background-size: 100%;  
        background-repeat: no-repeat;
    }

    .active {
        background-color: #600889;
        border: 1px solid #600889;
    }

    .live {
        background-color: #05f18f;
        border: 1px solid #05f18f;
    }

    .active.live {
        background-color: yellow;
        border: 1px solid yellow;
    }

    .screen-reader-description {
        clip: rect(0 0 0 0);
        clip-path: inset(50%);
        height: 1px;
        overflow: hidden;
        position: absolute;
        white-space: nowrap;
        width: 1px;
    }

</style>