import React from 'react';
import cx from 'classnames';

import styles from './ProgressBar.module.css';

interface Props {
  progress?: number;
  animated?: boolean;
}

const ProgressBar: React.FC<Props> = (props) => (
  <div className={cx(styles.progress, { [styles.animated]: props.animated })}>
    <div className={styles.progressBar} style={{ width: `${props.progress}%` }}></div>
  </div>
);

ProgressBar.defaultProps = {
  progress: 100,
  animated: false,
};

export default ProgressBar;
