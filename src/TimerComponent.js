import React from 'react';
import * as TimeUtils from './TimeUtils';
import Button from './Button';

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
      <div
        className="card-body"
      >
        {this.renderTimer()}
        {this.renderButton()}
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
  }


  renderTimer() {
    var timer = this.state.timer;
    if (timer == null) {
      return "No timer present";
    }
    return timer.toString();
  }

  renderButton() {
    return(
      <div className="container p-3">
        <Button
          text={"pause/resume timer"}
          handleClick={() => this.togglePauseResumeTimer()}/>
      </div>
    );
  }
}

export default TimerComponent;
