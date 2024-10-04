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
    style={`background-color:${buttonName.colour};`}>
    <div class="button-name">
        {buttonName.name}
    </div>
</button>

<style>

    .transport{
        width: 100%;
        height: 6vh; /* using the 0 and padding bottom trick for dynamic sizing of this meant that the text stuck to the top*/
        /* padding-bottom: 10%; */
        border: 1px solid #ccc;
        border-radius: 7px;
        margin: 0 1em 1em 0;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .button-name {
        font-family: 'Courier New', Courier, monospace;
        font-weight: bold;
        color: white;
        text-align: center;  
        margin: auto;
        
    }

</style>