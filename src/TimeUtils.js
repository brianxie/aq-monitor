export const TimerState = {
  RUNNING: "running",
  PAUSED: "paused",
  EXPIRED: "expired",
  INACTIVE: "inactive",
}

export class Timer {
  constructor(timerState, remainingTimeMillis, defaultTimeMillis, callback) {
    this.timerState = timerState;
    this.remainingTimeMillis = remainingTimeMillis;
    this.defaultTimeMillis = defaultTimeMillis;
    this.callback = callback;
  }

  decrement(deltaMillis) {
    // No-op if the timer is not running.
    if (this.timerState !== TimerState.RUNNING) {
      return this;
    }

    var newRemainingTimeMillis = this.remainingTimeMillis - deltaMillis;
    var newTimerState = (newRemainingTimeMillis <= 0)
      ? TimerState.EXPIRED
      : this.timerState;

    this.remainingTimeMillis = newRemainingTimeMillis;
    this.timerState = newTimerState;

    // If the timer is already expired, execute the callback and reset the
    // timer.
    if (newTimerState === TimerState.EXPIRED) {
      this.callback();
      this.remainingTimeMillis = this.defaultTimeMillis;
      this.timerState = TimerState.RUNNING;
    }

    return this;
  }

  pause() {
    this.timerState = TimerState.PAUSED;
    return this;
  }

  resume() {
    this.timerState = TimerState.RUNNING;
    return this;
  }

  togglePauseResumeAndReturn() {
    var timerState = this.timerState;
    if (timerState === TimerState.PAUSED) {
      this.timerState = TimerState.RUNNING;
    } else if (timerState === TimerState.RUNNING) {
      this.timerState = TimerState.PAUSED;
    } else {
      throw new Error("Cannot toggle timer in state: " + timerState);
    }
    return this;
  }

  toString() {
    return "Timer state: " + this.timerState + "\n"
      + "Time remaining (seconds): "
      + Math.floor(this.remainingTimeMillis / 1000);
  }
}
