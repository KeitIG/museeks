import Promise from 'bluebird';
import os from 'os';
import { flatten, pick } from 'lodash';
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

        const getPlayerState = () => {
            const properites = [
                'player',
                'queue',
                'queueCursor'
            ];
            return {
                ...pick(state, properites),
                elapsed: lib.player.getCurrentTime(),
            }
        };

        const { network : { output: prevOutput }, network : { me } } = state;

        // Add the isLocal bool to the output object for convenience elsewhere.
        const isLocal = newOutput.hostname === me.hostname;
        const newOutputWithLocalBool = { ...newOutput, isLocal };


        // If the output has not changed, do nothing.
        if (prevOutput && prevOutput.hostname === newOutput.hostname) {
            return;
        }

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
                meta: { newOutput: newOutputWithLocalBool, prevOutput }
            })
        }
        // If output has changed to another computer
        else {
            // We ask the output device to set us as an observer.
            dispatch({
                type: 'NETWORK/SET_OUTPUT',
                payload: lib.api.actions.network.connectAsOutput(newOutput, {
                    peer: utils.getMeWithIP(me, newOutput),
                    state: getPlayerState(),
                }),
                meta: { newOutput: newOutputWithLocalBool, prevOutput }
            });
        }
    };

    const connectAsOutput = ({state, peer}) => (dispatch) => {
        // Stop the player from playing
        dispatch(lib.actions.player.stop());

        // Apply the input's state
        // Set the queue
        dispatch(lib.actions.queue.setQueue(state.queue));
        // Set the queueCursor
        dispatch(lib.actions.queue.start(state.queueCursor));
        // Set the play/pause/stop status
        if (state.player.playerStatus === 'pause') {
            dispatch(lib.actions.player.start());
        } else if (state.player.playerStatus === 'stop') {
            dispatch(lib.actions.player.stop());
        } else  if (state.player.playerStatus === 'play') {
            dispatch(lib.actions.player.play());
        }
        // Set the elapsed time.
        dispatch(lib.actions.player.jumpTo(state.elapsed));

        // Add the input computer as an observer.
        dispatch(addObserver({ip, hostname, platform}));
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
