import mutate from 'xtend/mutable';
import sharedLib from '../../shared/lib';

import app from './app';
import config from './config';
import network from './network';
import player from './player';
import playlist from './playlist';
import shell from './shell';
import track from './track';

const library = {
    app,
    config,
    models: {}, // models attached after database initialisation
    player,
    shell,
    // Other libs added via mutation
    // tray
};

// attach libraries which must be invoked
library.network = network(library);
library.playlist = playlist(library);
library.track = track(library);

export const initLib = (store) => {
    library.store = store;

    // attach the shared libraries after the store has been supplied
    const shared = sharedLib(library);

    // attach the shared libraries to our internal library
    mutate(library, shared);
};

export default library;