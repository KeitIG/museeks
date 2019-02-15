import * as React from 'react';
import { Button } from 'react-bootstrap';

import ExternalLink from '../../elements/ExternalLink';
import Heart from '../../elements/Heart';
import * as Setting from '../../components/Setting/Setting';

import * as app from '../../lib/app';
import * as SettingsActions from '../../actions/SettingsActions';

/*
|--------------------------------------------------------------------------
| Child - About
|--------------------------------------------------------------------------
*/

export default class SettingsAbout extends React.Component {
  render () {
    return (
      <div className='setting setting-about'>
        <Setting.Section>
          <h4>About Museeks</h4>
          <p>
            Museeks { app.version }{ ' - ' }
            <ExternalLink href='http://museeks.io'>museeks.io</ExternalLink>
            { ' - ' }
            <ExternalLink href={`https://github.com/KeitIG/Museeks/releases/tag/${app.version}`}>release notes</ExternalLink>
          </p>
          <Button
            bsSize='small' className='update-checker'
            onClick={async () => { await SettingsActions.checkForUpdate(); }}
          >Check for update</Button>
        </Setting.Section>
        <Setting.Section>
          <h4>Contributors</h4>
          <p>
            Made with <Heart /> by Pierre de la Martinière
            (<ExternalLink href='http://pierrevanmart.com'>KeitIG</ExternalLink>)
            and a bunch of <ExternalLink href='https://github.com/KeitIG/museeks/graphs/contributors'>great people</ExternalLink>.
          </p>
        </Setting.Section>
        <Setting.Section>
          <h4>Report issue / Ask for a feature</h4>
          <p>
            Although Museeks is mostly stable, a few bugs may still occur. Please, do
            not hesitate to report them or to ask for features you would like to
            see, using our <ExternalLink href='http://github.com/KeitIG/Museeks/issues'>issue tracker</ExternalLink>.
          </p>
        </Setting.Section>
      </div>
    );
  }
}