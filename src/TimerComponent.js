import React from 'react';
import Button from './Button';
import * as TimeUtils from './TimeUtils';

// props::callback
// props::pollIntervalMillis
class TimerComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      timer: null,
    };
  }

  componentDidMount() {
    const tickIntervalMillis = 1000;

    // Start a timer.
    this.setState({timer: new TimeUtils.Timer(
      TimeUtils.TimerState.RUNNING,
      /*remainingTimeMillis=*/ this.props.pollIntervalMillis,
      /*defaultTimeMillis=*/ this.props.pollIntervalMillis,
      () => this.props.callback())}
    );

    // Every second, decrement by a second and handle side-effects.
    this.timerId = setInterval(
      () =>
        this.setState({timer: this.state.timer.decrement(tickIntervalMillis)}),
      tickIntervalMillis);
  }

  componentWillUnmount() {
    clearInterval(this.timerId);
  }

  render() {
    return (
      <div className="card border-secondary TimerComponent">
        {this.renderTimer()}
        {this.renderButtonGroup()}
      </div>
    );
  }

  togglePauseResumeTimer() {
    if (this.state.timer.timerState === TimeUtils.TimerState.RUNNING) {
      this.setState({timer: this.state.timer.pause()});
    } else if (this.state.timer.timerState === TimeUtils.TimerState.PAUSED) {
      this.setState({timer: this.state.timer.resume()});
    }
  }

  resetTimer() {
    this.setState({timer: this.state.timer.reset()});
  }

  renderTimer() {
    var timer = this.state.timer;
    var timerText = (timer == null)
      ? "No timer present"
      : timer.getRemainingTime();

    return (
      <div className="container">
        <h2>
          <span className="badge badge-secondary">
            {timerText}
          </span>
        </h2>
      </div>
    );
  }

  renderButtonGroup() {
    return (
      <div className="buttonGroup" role="group">
        {this.renderToggleButton()}
        {this.renderResetButton()}
      </div>
    );
  }

  renderToggleButton() {
    var buttonText;
    if (this.state.timer == null) {
      buttonText = "Pause/Resume";
    } else {
      switch (this.state.timer.timerState) {
        case TimeUtils.TimerState.RUNNING:
          buttonText = "Pause";
          break;
        case TimeUtils.TimerState.PAUSED:
          buttonText = "Resume";
          break;
        default:
          throw new Error("Cannot toggle timer in state: " + this.state.timer.timerState);
      }
    }

    return(
      <Button
        text={buttonText}
        handleClick={() => this.togglePauseResumeTimer()}/>
    );
  }

  renderResetButton() {
    return(
      <Button
        text={"Reset"}
        handleClick={() => this.resetTimer()}/>
    );
  }
}

export default TimerComponent;
