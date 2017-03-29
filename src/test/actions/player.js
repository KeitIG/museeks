import Promise from 'bluebird';
import test from 'blue-tape';
import playerActions from '../../shared/redux/actions/player';
import actionTest from '../fixtures/redux/actionTest';
import lib from '../fixtures/lib';
import { range } from 'range';
import extend from 'deep-extend';

const player = playerActions(lib);

// test('player reducer shuffle', (t) => {
//     const description = 'shuffle should set the shuffle property to true';
//
//     const action = player.shuffle(true);
//
//     const delta = {
//         player: {
//             shuffle: true
//         }
//     };
//
//     return actionTest({
//         action,
//         delta
//     })
//     .then((result) => t.deepEqual(result.delta, delta, description));
// });

const numTracks = 10;
const baseState = {
    tracks: {
        library: {
            data: range(0, numTracks).reduce((data, _id) => {
                data[_id] = {
                    _id,
                    name : `song ${_id}`
                };
                return data;
            }, {})
        }
    },
    queueCursor: 5,
    queue: range(0, numTracks),
    player: {
        playStatus: 'play',
        history: []
    }
};

test('player next', (t) => {

    const description = `
        should increment the queue cursor
        should add to history
    `;

    const action = player.next();

    const initialState = extend(baseState, {
        queueCursor: 5,
        player: {
            playStatus: 'play',
        }
    });

    const nextQueueCursor = initialState.queueCursor + 1;
    const nextTrack = baseState.tracks.library.data[nextQueueCursor];

    const delta = {
        queueCursor: nextQueueCursor,
        player: {
            currentTrack: nextTrack,
            history: [nextTrack._id]
        }
    };

    return actionTest({
        initialState,
        action
    })
    .then((result) => t.deepEqual(result.delta, delta, description));
});

test('player next three times', (t) => {

    const description = `
        should increment the queue cursor
        should add to history
    `;

    const action = player.next();

    const initialState = extend(baseState, {
        queueCursor: 5,
        player: {
            playStatus: 'play'
        }
    });

    const iterations = 3;

    return Promise.reduce(range(iterations), (previous) => {

        const nextQueueCursor = previous.queueCursor + 1;
        const nextTrack = baseState.tracks.library.data[nextQueueCursor];

        const delta = {
            queueCursor: nextQueueCursor,
            player: {
                currentTrack: nextTrack,
                history: previous.player.history.concat(nextTrack._id)
            }
        };

        return actionTest({
            initialState: previous,
            action
        })
        .then((result) => {
            t.deepEqual(result.delta, delta, description);

            return result.state;
        });
    }, initialState);
});

test('player next with repeat one', (t) => {

    const description = `
        should not increment the queue cursor
        should not add to history
    `;

    const action = player.next();

    const queueCursor = 5;

    const initialState = extend(baseState, {
        queueCursor,
        player: {
            playStatus: 'play',
            currentTrack: baseState.tracks.library.data[queueCursor],
            history: [],
            repeat: 'one'
        }
    });

    const delta = {};

    return actionTest({
        initialState,
        action
    })
    .then((result) => t.deepEqual(result.delta, delta, description));
});

test('player next with repeat all', (t) => {

    const description = `
        should set the cursor to the head of the queue once the end is reached
        should add to history
    `;

    const action = player.next();

    // set the cursor to the end of the queue
    const queueCursor = baseState.queue.length - 1;

    const initialState = extend(baseState, {
        queueCursor,
        player: {
            playStatus: 'play',
            currentTrack: baseState.tracks.library.data[queueCursor],
            history: [],
            repeat: 'all'
        }
    });

    // next track should be item 0 in the queue
    const nextTrackId = baseState.queue[0];
    const nextTrack = baseState.tracks.library.data[nextTrackId];

    const delta = {
        queueCursor: 0,
        player: {
            currentTrack: nextTrack,
            history: [nextTrackId],
        }
    };

    return actionTest({
        initialState,
        action
    })
    .then((result) => t.deepEqual(result.delta, delta, description));
});

test('player next with repeat none', (t) => {

    const description = `
        should stop the player once the end of the queue is reached
        should clear the queue
    `;

    const action = player.next();

    // set the cursor to the end of the queue
    const queueCursor = baseState.queue.length - 1;

    const initialState = extend(baseState, {
        queueCursor,
        player: {
            playStatus: 'play',
            currentTrack: baseState.tracks.library.data[queueCursor],
            repeat: 'none'
        }
    });

    const delta = {
        queueCursor: null,
        queue: []
    };

    return actionTest({
        initialState,
        action
    })
    .then((result) => t.deepEqual(result.delta, delta, description));
});
