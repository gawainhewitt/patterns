<script>

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
        <i class="material-icons">{icon}</i>
      </button>
    {/if}
    <slot {isFull} />
  </div>
  
  <style>
    @font-face {
        font-family: 'Material Icons';
        font-style: normal;
        font-weight: 400;
        src: url(material-icons.woff2) format('woff2');
    }

    .material-icons {
        font-family: 'Material Icons';
        font-weight: normal;
        font-style: normal;
        font-size: 24px;
        line-height: 1;
        letter-spacing: normal;
        text-transform: none;
        display: inline-block;
        white-space: nowrap;
        word-wrap: normal;
        direction: ltr;
        font-feature-settings: "liga";
        -webkit-font-feature-settings: 'liga';
        -webkit-font-smoothing: antialiased;
    }
  </style>