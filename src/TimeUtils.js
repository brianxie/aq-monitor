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
    return "state: " + this.timerState + " time: " + this.remainingTimeMillis;
  }
}
