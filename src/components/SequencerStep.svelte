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
    on:click|preventDefault|stopPropagation={handleButton}
    id="row{rowIndex}note{noteIndex}"
    class=" note {noteActive ? 'active' : ''}" class:live={noteLive}
    style="background-image: url('{instrumentName}-pink.png')"
    >
</button>

<style>
    .note{
        background: #ccc;
        width: 8vw;
        height: 8vw;
        border: 1px solid #ccc;
        border-radius: 7px;
        background-size: 8vw; 
    }

    .active {
        background: #600889;
        border: 1px solid #600889;
        background-size: 8vw; 
    }

    .live {
        background: #05f18f;
        background-size: 8vw; 
    }

    .active.live {
        background: yellow;
        background-size: 8vw; 
    }


</style>