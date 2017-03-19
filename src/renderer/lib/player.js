import { ipcRenderer } from 'electron';
import utils from '../../shared/utils/utils';

class Player {

    constructor() {

        const mergedOptions = {
            playbackRate: 1,
            volume: 1,
            muted: false
        };

        this.audio = new Audio();

        this.audio.defaultPlaybackRate = mergedOptions.playbackRate;
        this.audio.playbackRate = mergedOptions.playbackRate;
        this.audio.volume = mergedOptions.volume;
        this.audio.muted = mergedOptions.muted;

        this.threshold = 0.75;
        this.durationThresholdReached = false;
    }

    // link player to libraries
    link(lib) {

        this.lib = lib;

        this.audio.addEventListener('ended', this.lib.actions.player.next);
        this.audio.addEventListener('error', this.lib.actions.player.audioError);
        this.audio.addEventListener('timeupdate', () => {
            if (this.isThresholdReached()) {
                this.lib.actions.library.incrementPlayCount(this.getSrc());
            }
        });

        this.audio.addEventListener('play', () => {
            ipcRenderer.send('playerAction', 'play');

            const path = decodeURIComponent(this.getSrc()).replace('file://', '');

            return utils.getMetadata(path).then((track) => {

                ipcRenderer.send('playerAction', 'trackStart', track);

                if (this.lib.app.browserWindows.main.isFocused()) return;

                return utils.fetchCover(track.path).then((cover) => {
                    return NotificationActions.add({
                        title: track.title,
                        body: `${track.artist}\n${track.album}`,
                        icon: cover
                    });
                });
            });
        });

        this.audio.addEventListener('pause', () => {
            ipcRenderer.send('playerAction', 'pause');
        });
    }

    play() {
        this.audio.play();
    }

    pause() {
        this.audio.pause();
    }

    stop() {
        this.audio.pause();
    }

    setAudioMuted(status) {
        this.audio.muted = status;
    }

    mute() {
        this.audio.muted = true;
    }

    unmute() {
        this.audio.muted = false;
    }

    getCurrentTime() {
        return this.audio.currentTime;
    }

    getVolume() {
        return this.audio.volume;
    }

    getSrc() {
        return this.audio.src;
    }

    setAudioVolume(volume) {
        this.audio.volume = volume;
    }

    setAudioPlaybackRate(playbackRate) {
        this.audio.playbackRate = playbackRate;
        this.audio.defaultPlaybackRate = playbackRate;
    }

    setAudioSrc(src) {
        // When we change song, need to update the thresholdReached indicator.
        this.durationThresholdReached = false;
        this.audio.src = src;
    }

    setAudioCurrentTime(currentTime) {
        this.audio.currentTime = currentTime;
    }

    isMuted() {
        return this.audio.muted;
    }

    isPaused() {
        return this.audio.paused;
    }

    isThresholdReached() {
        if (!this.durationThresholdReached && this.audio.currentTime >= this.audio.duration * this.threshold) {
            this.durationThresholdReached = true;
            return this.durationThresholdReached;
        }
    }
}

export default Player;