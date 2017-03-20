import React, { PureComponent } from 'react';


/*
|--------------------------------------------------------------------------
| Header - PlayingBar
|--------------------------------------------------------------------------
*/

class TrackCover extends PureComponent {

    static propTypes = {
        cover: React.PropTypes.string
    }

    constructor(props) {
        super(props);
    }

    render = () => {
        if (this.props.cover) {
            const styles = { backgroundImage: `url('${this.props.cover}')` };

            return <div className='cover' style={ styles } />;
        }

        return(
            <div className='cover empty'>
                <div className='note'>♪</div>
            </div>
        );
    }
}

export default TrackCover;
