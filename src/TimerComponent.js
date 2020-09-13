import React from 'react';
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
      this.props.pollIntervalMillis)}
    );

    // Every second, decrement by a second and handle side-effects.
    this.timerId = setInterval(
      () => this.updateTimer(
        tickIntervalMillis,
        this.props.pollIntervalMillis),
      tickIntervalMillis
    );
  }

  componentWillUnmount() {
    clearInterval(this.timerId);
  }

  render() {
    return (
      <div
        className="TimerComponent"
        class="card-body"
      >
        {this.renderTimer()}
      </div>
    );
  }

  updateTimer(deltaMillis, defaultDuration) {
    var newDuration = this.state.timer.remainingTimeMillis - deltaMillis;
    var timerState = newDuration <= 0
      ? TimeUtils.TimerState.EXPIRED
      : this.state.timer.timerState;
    this.setState({timer: new TimeUtils.Timer(timerState, newDuration)});
    // If the timer is already expired, execute the callback and reset the
    // timer.
    if (timerState === TimeUtils.TimerState.EXPIRED) {
      this.props.callback();
      this.setState({
        timer: new TimeUtils.Timer(
          TimeUtils.TimerState.RUNNING, defaultDuration)
      });
    }
  }

  renderTimer() {
    var timer = this.state.timer;
    if (timer == null) {
      return "No timer present";
    }
    return timer.toString();
  }
}

export default TimerComponent;
