import React from 'react';
import ReactDOM from 'react-dom';
import {CSSTransition} from 'react-transition-group';
import Button from './Button';
import Status from './Status';
import './index.css';

class Monitor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      statusActive: false,
    };
  }

  renderButton() {
    return(
      <div className="container">
        <Button
          text={"What's my AQI?"}
          handleClick={() => this.toggleStatus()} />
      </div>
    );
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
        <div className="container">
          {statusActive && appearFn}
        </div>
      </CSSTransition>
    );
  }

  renderStatus() {
    const pollIntervalMillis = 120000; // 2 minutes
    return(
      <Status pollIntervalMillis={pollIntervalMillis} />
    );
  }

  render() {
    return(
      <div className="container">
        {this.renderButton()}
        {this.renderStatusPlaceholder(
          this.state.statusActive,
          this.renderStatus())}
      </div>
    );
  }
}

// TODO: Maybe render an alert.
ReactDOM.render(
  <Monitor />,
  document.getElementById('root')
);
