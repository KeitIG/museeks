import Promise from 'bluebird';
import os from 'os';
import extend from 'xtend';
import utils from '../../utils/utils';

const library = (lib) => {

    const peerFound = (peer) => (dispatch, getState) => {
        const me = getState().network.me;
        if (me.hostname !== peer.hostname) {
            dispatch({
                type: 'NETWORK/PEER_FOUND',
                payload: {
                    peer
                }
            });
            dispatch(lib.actions.tracks.find({ peer }));
        }
    };

    const setOutput = (newOutput) => (dispatch, getState) => {
        const state = getState();
        const { network : { output: prevOutput }, network : { me } } = state;

        // If the output has not changed, do nothing.
        if (prevOutput && prevOutput.hostname === newOutput.hostname) {
            return;
        }

        // Add the isLocal bool to the output object for convenience elsewhere.
        const isLocal = newOutput.hostname === me.hostname;
        const newOutputWithIsLocal = { ...newOutput, isLocal };

        // If output has swapped to our computer
        if (isLocal) {
            // Ask the previous output for us to be removed as an observer
            // This may fail if the other Museeks stops working.
            // If so, this is fine... Probably...
            lib.api.actions.network.disconnectAsOutput(prevOutput, {
                peer: utils.getMeWithIP(me, prevOutput)
            });

            // Dispatch the change event to update the ui
            // This has promise.resolve so we get fulfilled events
            // to match the other case.
            dispatch({
                type: 'NETWORK/SET_OUTPUT',
                payload: Promise.resolve(),
                meta: {
                    newOutput: newOutputWithIsLocal,
                    prevOutput
                }
            });

        } else { // If output has changed to another computer

            const playerState = {
                player: state.player,
                queueCursor: state.queueCursor,
                queue: utils.transformTrackPaths({
                    tracks: state.queue,
                    peer: newOutput,
                    me
                }),
                elapsed: lib.player.getCurrentTime()
            }

            // We ask the output device to set us as an observer.
            dispatch({
                type: 'NETWORK/SET_OUTPUT',
                payload: lib.api.actions.network.connectAsOutput(newOutput, {
                    peer: utils.getMeWithIP(me, newOutput),
                    state: playerState
                }),
                meta: {
                    newOutput: newOutputWithIsLocal,
                    prevOutput
                }
            });
        }
    };

    const connectAsOutput = ({ state, peer }) => (dispatch) => {
        console.log('CONNECT AS OUPUT')
        console.log(require('util').inspect(state, { depth: 12 }), peer)

        // Apply the state of the remote input to the local player

        // Stop the player from playing
        dispatch(lib.actions.player.stop());

        // Set the queue - TODO: remove when queue is on player
        dispatch(lib.actions.queue.setQueue(state.queue));

        // Set the queue cursor - TODO: remove when queueCursor is on player
        dispatch(lib.actions.queue.setQueueCursor(state.queueCursor));

        // Set the entire player state
        dispatch(lib.actions.player.setState(state.player));

        // Set audio element play state: can be play/pause/stop
        dispatch(lib.actions.player[state.player.playStatus]());

        // Set audio element repeat
        dispatch(lib.actions.player.repeat(state.player.repeat));

        // Set audio element suffle
        dispatch(lib.actions.player.shuffle(state.player.shuffle));

        // Set audio element elapsed time
        dispatch(lib.actions.player.jumpTo(state.elapsed));

        // Add the input computer as an observer
        dispatch(lib.actions.network.addObserver(peer));
    };

    const disconnectAsOutput = ({ peer }) => (dispatch) => {
        dispatch(removeObserver({ peer }));
    };

    const addObserver = ({ ip, hostname, platform }) => ({
        type: 'NETWORK/ADD_OBSERVER',
        payload: {
            peer: {
                ip,
                hostname,
                platform
            }
        }
    });

    const removeObserver = (peer) => ({
        type: 'NETWORK/REMOVE_OBSERVER',
        payload: {
            peer
        }
    });

    return {
        peerFound,
        setOutput,
        connectAsOutput,
        disconnectAsOutput,
        addObserver,
        removeObserver
    };
}

export default library;
