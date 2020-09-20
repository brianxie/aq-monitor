export const TimerState = {
  RUNNING: "running",
  PAUSED: "paused",
  EXPIRED: "expired", // unused
  INACTIVE: "inactive", // unused
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

    // If the timer is already expired, execute the callback and reset the
    // timer.
    if (newRemainingTimeMillis <= 0) {
      this.callback();
      this.remainingTimeMillis = this.defaultTimeMillis;
    } else {
      this.remainingTimeMillis = newRemainingTimeMillis;
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

  reset () {
    this.remainingTimeMillis = this.defaultTimeMillis;
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

  // TODO: fix string
  toString() {
    return "Timer state: " + this.timerState + "\n"
      + "Time remaining (seconds): "
      + Math.floor(this.remainingTimeMillis / 1000);
  }
}
