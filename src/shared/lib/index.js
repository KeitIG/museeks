import api from '../api/accessors';
import actions from '../redux/actions';

const library = (lib) => {
    return {
        actions: actions(lib),
        api: api(lib)
    };
};

export default library;