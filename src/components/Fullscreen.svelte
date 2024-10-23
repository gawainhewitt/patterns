<script>

  import { onMount } from "svelte";

    let isFull = false;
    let fsContainer = null;
  
    const noop = () => {};
  
    const fullscreenSupport = !!(
      document.fullscreenEnabled ||
      document.webkitFullscreenEnabled ||
      document.mozFullScreenEnabled ||
      document.msFullscreenEnabled ||
      false
    );
  
    const exitFullscreen = (
      document.exitFullscreen ||
      document.mozCancelFullScreen ||
      document.webkitExitFullscreen ||
      document.msExitFullscreen ||
      noop
    ).bind(document);
  
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
  
    const fsToggle = () => {
      if (!fullscreenSupport) return;
  
      if (isFull) {
        exitFullscreen();
      } else {
        requestFullscreen(fsContainer);
      }
    };

    function fullscreenchanged() {
        if (document.fullscreenElement) {
            isFull = true;
        } else {
            isFull = false;
        }
    }

    addEventListener("fullscreenchange", fullscreenchanged)
  
    $: icon = isFull ? "fullscreen_exit" : "fullscreen";
  </script>
  
  <div class="fs" class:isFull bind:this={fsContainer}>
    {#if fullscreenSupport}
      <button on:click={fsToggle}>
        <i class="material-icons md-36">{icon}</i>
      </button>
    {/if}
    <slot {isFull} />
  </div>
  