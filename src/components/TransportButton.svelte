<script>
    import { createEventDispatcher } from 'svelte';

    export let buttonName;

    const dispatch = createEventDispatcher()

    const handleButton = () => {
        dispatch("clicked", buttonName);
    }

</script>


<button 
    on:click|preventDefault|stopPropagation={handleButton}
        class="transport"
        style={`background-color:${buttonName.colour};`}
    >{buttonName.name}
</button>

<style>
    .transport{
        width: 14vw;
        height: 8vw;
        border: 1px solid #ccc;
        border-radius: 7px;
        background-size: 8vw; 
        margin: 0 1em 1em 0;
        font-family: 'Courier New', Courier, monospace;
        font-weight: bold;
        font-size: 3vw;
        color: white;
        text-align: center;
    }

</style>