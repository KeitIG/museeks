import url from 'url';
import utils from '../../shared/utils/utils';

class Player {

    constructor() {
        this.audio = new Audio();
        this.threshold = 0.75;
        this.durationThresholdReached = false;
    }

    init(lib) {
        this.lib = lib;

        this.audio.addEventListener('play', this.lib.actions.player.play);
        this.audio.addEventListener('pause', this.lib.actions.player.pause);
        this.audio.addEventListener('ended', this.lib.actions.player.next);
        this.audio.addEventListener('error', this.lib.actions.player.audioError);
        this.audio.addEventListener('timeupdate', () => {
            if (this.isThresholdReached()) this.lib.actions.library.incrementPlayCount(this.getSrc());
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

    setMuted(status) {
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

    setVolume(volume) {
        this.audio.volume = volume;
    }

    setPlaybackRate(playbackRate) {
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
