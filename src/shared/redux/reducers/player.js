import i from 'icepick';

export default (state = {}, action) => {
    switch (action.type) {
        case('PLAYER/START'): {
            const queue = [...state.tracks[state.tracks.tracksCursor].sub];
            const id = action.payload._id;

            let queueCursor = action.payload.queuePosition; // Clean that variable mess later

            // Check if we have to shuffle the queue
            if (state.shuffle) {
                // need to check that later
                const index = queue.findIndex((track) => track._id === id);

                const firstTrack = queue[index];

                queue.splice(id, 1);

                let m = queue.length;
                let t;
                let i;
                while (m) {
                    // Pick a remaining element…
                    i = Math.floor(Math.random() * m--);

                    // And swap it with the current element.
                    t = queue[m];
                    queue[m] = queue[i];
                    queue[i] = t;
                }

                queue.unshift(firstTrack);

                // Let's set the cursor to 0
                queueCursor = 0;
            }

            // Backup that and change the UI
            return {
                ...state,
                queue,
                queueCursor,
                oldQueue: queue,
                oldQueueCursor: queueCursor,
                player: {
                    ...state.player,
                    playerStatus: 'play'
                }
            };
        }

        case('PLAYER/PLAY'): {
            return i.assocIn(state, ['player', 'playStatus'], 'play');
        }

        case('PLAYER/PAUSE'): {
            return i.assocIn(state, ['player', 'playStatus'], 'pause');
        }

        case('PLAYER/STOP'): {
            return i.chain(state)
                .assoc('queue', [])
                .assoc('queueCursor', null)
                .assocIn(['player', 'playStatus'], 'stop')
                .value();
        }

        case('PLAYER/NEXT'): {
            return i.assoc(state, 'queueCursor', action.payload.newQueueCursor);
        }

        case('PLAYER/PREVIOUS'): {
            return i.assoc(state, 'queueCursor', action.payload.newQueueCursor);
        }

        case('PLAYER/JUMP_TO'): {
            return state;
        }

        case('PLAYER/SHUFFLE'): {
            if (action.payload.shuffle) {
                // Let's shuffle that
                const queueCursor = state.queueCursor;
                let queue = [...state.queue];

                // Get the current track
                const firstTrack  = queue[queueCursor];

                // now get only what we want
                queue = queue.splice(queueCursor + 1, state.queue.length - (queueCursor + 1));

                let m = queue.length;
                let t;
                let i;
                while (m) {
                    // Pick a remaining element…
                    i = Math.floor(Math.random() * m--);

                    // And swap it with the current element.
                    t = queue[m];
                    queue[m] = queue[i];
                    queue[i] = t;
                }

                queue.unshift(firstTrack); // Add the current track at the first position

                return {
                    ...state,
                    queue,
                    shuffle: true,
                    queueCursor: 0,
                    oldQueue: state.queue,
                };
            }

            const currentTrackIndex = state.player.oldQueue.findIndex((track) => {
                return action.payload.currentSrc === `file://${encodeURI(track.path)}`;
            });

            // Roll back to the old but update queueCursor
            return {
                ...state,
                queue: [...state.player.oldQueue],
                queueCursor: currentTrackIndex,
                shuffle: false
            };
        }

        case('PLAYER/REPEAT'): {
            return i.assocIn(state, ['player', 'repeat'], action.payload.repeat);
        }

        case('PLAYER/FETCHED_COVER'): {
            return i.assocIn(state, ['player', 'cover'], action.payload.cover || null);
        }

        default: {
            return state;
        }
    }
};
