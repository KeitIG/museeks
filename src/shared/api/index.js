// This will create a bunch of function that call the API

import routes from './routes';
import createApiFunctions from './utils/createApiFunctions';

module.exports = createApiFunctions(routes);
