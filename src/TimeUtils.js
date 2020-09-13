export const TimerState = {
  RUNNING: "running",
  PAUSED: "paused",
  EXPIRED: "expired",
  INACTIVE: "inactive",
}

export class Timer {
  constructor(timerState, remainingTimeMillis) {
    this.timerState = timerState;
    this.remainingTimeMillis = remainingTimeMillis;
  }

  toString() {
    return "Timer state: " + this.timerState + "\n"
      + "Time remaining (seconds): "
      + Math.floor(this.remainingTimeMillis / 1000);
  }
}
