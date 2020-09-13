import React from 'react';
import ReactDOM from 'react-dom';
import {CSSTransition} from 'react-transition-group';
import './index.css';
import Button from './Button';
import Status from './Status';

class Monitor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      statusActive: false,
    };
  }

  renderButton() {
    return(
      <div class="container p-3">
        <Button
          handleClick={() => this.toggleStatus()}
        />
      </div>);
  }

  toggleStatus() {
    this.setState({statusActive: !this.state.statusActive});
  }

  renderStatusPlaceholder(statusActive, appearFn) {
    // Exit animations wouldn't work, because of the immediate unrendering.
    return(
      <CSSTransition
        in={statusActive}
        appear={true}
        timeout={300}
        classNames="StatusTransition"
      >
        <div>
          {statusActive && appearFn}
        </div>
      </CSSTransition>
    );
  }

  renderStatus() {
    const pollIntervalMillis =  300000; // 5 minutes
    return(
      <div class="container p-3">
        <Status
          pollIntervalMillis={pollIntervalMillis}
        />
      </div>);
  }

  render() {
    return(
      <div
        className="Monitor"
        class="container m-5"
      >
        {this.renderButton()}
        {this.renderStatusPlaceholder(
          this.state.statusActive,
          this.renderStatus())}
      </div>
    );
  }
}

ReactDOM.render(
  <Monitor />,
  document.getElementById('root')
);
