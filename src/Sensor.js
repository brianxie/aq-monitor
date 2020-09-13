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

export const LocationKeys = {
  LATITUDE: "latitude",
  LONGITUDE: "longitude",
}

export class SensorModel {
  constructor(timeData, locationData) {
    this.timeData = timeData;
    this.locationData = locationData;
  }

  toString() {
    Object.keys(LocationKeys)
      .forEach(keyEnum => console.log(LocationKeys[keyEnum]));

    var locationString =
        Object.keys(LocationKeys)
          .map(keyEnum => LocationKeys[keyEnum])
          .map(key => key.toString() + ": " + this.locationData[key].toString())
          .reduce((acc, curr) => acc + "\n" + curr);
      
    var timeDataString =
        Object.keys(TimeDataKeys)
          .map(keyEnum => TimeDataKeys[keyEnum])
          .map(key => key.toString() + ": " + this.timeData[key].toString())
          .reduce((acc, curr) => acc + "\n" + curr);

    return locationString + "\n" + timeDataString;
  }
}
