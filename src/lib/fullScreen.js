export class FullScreen {
    #noop = () => {};
    constructor(isFull, fsContainer) {
        this.isFull = isFull;
        this.fsContainer = fsContainer;
        this.exitFullscreen = (
            document.exitFullscreen ||
            document.mozCancelFullScreen ||
            document.webkitExitFullscreen ||
            document.msExitFullscreen ||
            this.#noop
        ).bind(document);
        this.fullscreenSupport = !!(
            document.fullscreenEnabled ||
            document.webkitFullscreenEnabled ||
            document.mozFullScreenEnabled ||
            document.msFullscreenEnabled ||
            false
          );      
    }

    fsToggle = () => {

        if (!this.fullscreenSupport) return;

        if (this.isFull) {
            this.exitFullscreen();
        } else {
            this.requestFullscreen(this.fsContainer);
        }
        };

    requestFullscreen() {
        const requestFS = (
        this.fsContainer.requestFullscreen ||
        this.fsContainer.mozRequestFullScreen ||
        this.fsContainer.webkitRequestFullscreen ||
        this.fsContainer.msRequestFullscreen ||
        this.#noop
        ).bind(this.fsContainer);
        requestFS();
    };
}

