// Datatypes for constructing a sensor model.
// This is an internal, non-rendered data representation.
// The SensorsComponent React component deals with actually using these fields.
export const TimeDataKeys = {
  REALTIME: "realtime",
  TEN_MINUTES: "ten_minutes",
  THIRTY_MINUTES: "thirty_minutes",
  ONE_HOUR: "one_hour",
  SIX_HOURS: "six_hours",
  ONE_DAY: "one_day",
}

export const PositionKeys = {
  LATITUDE: "latitude",
  LONGITUDE: "longitude",
}

export class SensorModel {
  constructor(timeData, positionData) {
    // These could be classes, but having enumerable properties is convenient.
    this.timeData = timeData;
    this.positionData = positionData;
  }

  getRealtimeConcentration() {
    return this.timeData[TimeDataKeys.REALTIME];
  }

  getLatitude() {
    return this.positionData[PositionKeys.LATITUDE];
  }

  getLongitude() {
    return this.positionData[PositionKeys.LONGITUDE];
  }
}
