<script>
    import { createEventDispatcher } from 'svelte';
    export let rowIndex;
    export let noteIndex;
    export let noteActive;
    export let noteLive;
    // export let instrument;


    const dispatch = createEventDispatcher()

    const handleButton = () => {
        dispatch("clicked", {rowIndex, noteIndex});
        // console.log(rowIndex, noteIndex);
    }

</script>


<button 
    on:click={handleButton}
    id="row{rowIndex}note{noteIndex}"
    class="note {noteActive ? 'active' : ''} {noteIndex % 4 === 0 ? 'first-beat-of-the-bar': ''}" class:live={noteLive}>
</button>

<style>
    .note{
        background: #ccc;
        width: 4vw;
        height: 4vw;
        border: 1px solid #ccc;
        border-radius: 7px;
        background-image: url("/images/harp-pink.png");
        background-size: 4vw;
        /* display: flex; */
        /* justify-content: center; */
        /* align-items: center; */
    }

    .active {
        background: #600889;
        border: 1px solid #600889;
    }

    .live {
        background: #05f18f;
    }

    .active.live {
        background: yellow;
    }


</style>