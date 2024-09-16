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
        width: 8vw;
        height: 8vw;
        border: 1px solid #ccc;
        border-radius: 7px;
        background-image: url("/images/harp-pink.png");
        background-size: 8vw;
        /* display: flex; */
        /* justify-content: center; */
        /* align-items: center; */
    }

    .active {
        background: #600889;
        border: 1px solid #600889;
        background-image: url("/images/harp-pink.png");
        background-size: 8vw;
    }

    .live {
        background: #05f18f;
        background-image: url("/images/harp-pink.png");
        background-size: 8vw;
    }

    .active.live {
        background: yellow;
        background-image: url("/images/harp-pink.png");
        background-size: 8vw;
    }


</style>