import React from 'react';
import Sensor from './Sensor';

// Datatypes for constructing a sensor model.
// This is an internal, non-rendered data representation.
// The Sensor React component deals with actually using these fields.
const TimeDataKeys = {
  REALTIME: "realtime",
  TEN_MINUTES: "ten_minutes",
  THIRTY_MINUTES: "thirty_minutes",
  ONE_HOUR: "one_hour",
  SIX_HOURS: "six_hours",
  ONE_DAY: "one_day",
}

const LocationKeys = {
  LATITUDE: "latitude",
  LONGITUDE: "longitude",
}

class SensorModel {
  constructor(timeData, locationData) {
    this.timeData = timeData;
    this.locationData = locationData;
  }

  toString() {
    return this.timeData.toString() + "\n" + this.locationData.toString();
  }
}

// Maximum number of sensors from which to consider data.
const MAX_SENSORS = 3;

// aqiText, position
// keep count in here
class Status extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      aqiText: this.props.aqiText,

      pm25_10min: null,
      pm25_aqi: null,

      // The individual sensors.
      sensorModels: null,
      // Current position
      position: null,
      timer: null,
    };
  }

  render() {
    return (
      <div
        className="Status"
        class="card text-left border-secondary"
      >

        <div
          className="ResultSection"
          class="card-body"
        >
          {"Results section. This should include composite PM2.5 density, AQI, drill-down into multiple sensors."}
        </div>

        <div
          className="PositionSection"
          class="card-body"
        >
          {this.getPositionText() ||
            "Position section. This should include current position, as well as a sub-button to update it manually."} 
        </div>

        <div
          className="TimerSection"
          class="card-body"
        >
          {"Timer section. This should include a running count on the current timer, as well as a sub-button to update it manually."} 
        </div>


        <div
          className="AQI"
          class="card-body"
        >
          {this.state.aqiText}
        </div>

        <div
          className="ScrewingAround"
          class="card-body"
        >
          {this.state.sensorModels == null ? "No sensor data." : this.renderSensors()}
        </div>


        <div
          className="Position"
          class="card-body"
        >
          {"Your position: "}
          {this.state.position || "Position unknown"}
        </div>

      </div>
    );
  }

  componentDidMount() {
    this.updateStatus();
    this.timerId = setInterval(
      () => this.updateStatus(),
      this.props.pollIntervalMillis
    );
  }

  componentWillUnmount() {
    clearInterval(this.timerId);
  }

  renderSensors() {
    if (this.sensorModels == null) {
      return null;
    }
    console.log(this.sensorModels.toString());
    return (this.sensorModels.map(model =>
      <div class="container p-3">
        <Sensor sensorModel={model} />
      </div>
    ));
  }

  getPositionText() {
    return null;
  }

  // Transforms a result into an object containing the latitude, longitude, and result itself.
  createTaggedResult(jsonResult) {
    return {lat:parseFloat(jsonResult.Lat), lon:parseFloat(jsonResult.Lon), result:jsonResult};
  }

  // Computes distance between a single result and the provided position using the Euclidean metric.
  distanceFromPosition(taggedResult, position) {
    var dLat = taggedResult.lat - position.coords.latitude;
    var dLon = taggedResult.lon - position.coords.longitude;
    return Math.sqrt(Math.pow(dLat, 2) + Math.pow(dLon, 2));
  }

  // Sorts results by distance, increasing.
  getSortedResults(taggedResults, position) {
    return taggedResults.sort((a, b) =>
      this.distanceFromPosition(a, position) - this.distanceFromPosition(b, position))
      .map(taggedResult => taggedResult.result);
  }

  constructSensorModels(sortedResults) {
    return sortedResults.map(result => {
      var stats = JSON.parse(result.Stats);

      var locationData = {
        [LocationKeys.LATITUDE]: parseFloat(result.Lat),
        [LocationKeys.LONGITUDE]: parseFloat(result.Lon),
        toString: function() {
          return Object.keys(LocationKeys)
            .map(key => LocationKeys[key])
            .map(key => key + ": " + this[key].toString())
            .reduce((acc, curr) => acc + "\n" + curr);
        }
      };
      var timeData = {
        [TimeDataKeys.REALTIME]: stats.v,
        [TimeDataKeys.TEN_MINUTES]: stats.v1,
        [TimeDataKeys.THIRTY_MINUTES]: stats.v2,
        [TimeDataKeys.ONE_HOUR]: stats.v3,
        [TimeDataKeys.SIX_HOURS]: stats.v4,
        [TimeDataKeys.ONE_DAY]: stats.v5,
        toString: function() {
          return Object.keys(TimeDataKeys)
            .map(key => TimeDataKeys[key])
            .map(key => key + ": " + this[key].toString())
            .reduce((acc, curr) => acc + "\n" + curr);
        },
      };

      return new SensorModel(locationData, timeData);
    });
  }

  checkResponseOk(response) {
    if (!response.ok) {
      throw new Error(response.status);
    }
    return response;
  }

  // Reads raw sensor results from purpleair.
  // Future function.
  getRawResults() {
    const srcUrl = "https://www.purpleair.com/json";
    return fetch(srcUrl)
      .then(response => this.checkResponseOk(response))
      .then(response => response.json())
      .then(jsonObj => jsonObj.results)
      .then(results => results.map(result => this.createTaggedResult(result)));
  }

  handleResultError(error) {
    const resultErrorString = "Error in fetching sensors: " + error.message;
    // Rethrow the error for subsequent nodes.
    throw new Error(resultErrorString);
  }

  handlePositionError(error) {
    const positionErrorString = "Error in fetching position: " + error.message;
    this.setState({position: positionErrorString});
    // Rethrow the error for subsequent nodes.
    throw new Error(positionErrorString);
  }

  // Fetches location and sensor readings, and updates the status.
  updateStatus() {
    console.log("[" + new Date() + "] updating...");
    this.setState({aqiText: "Request pending..."});
    this.setState({position: "Position pending..."});

    // Issue requests for position and sensor readings.
    var positionPromise = function (options) {
        return new Promise(function(resolve, reject) {
          navigator.geolocation.getCurrentPosition(resolve, reject, options);
        });
    }();
    var rawResultsPromise = this.getRawResults();

    // Check for errors in fetching position, and update UI immediately if possible.
    positionPromise = positionPromise
      .then(position => {
        var positionString =
          position.coords.latitude.toString()
            + ", "
            + position.coords.longitude.toString();
        this.setState({position: positionString});
        // Return the original position, so that subsequent logic can work with it.
        // Pretty-print is only for UI purposes.
        return position;
      })
      .catch(error => this.handlePositionError(error));

    // Check for errors with the sensor reading per se, because Promise.all fails fast.
    // The AQI value can't be updated until we have both position and sensor readings.
    rawResultsPromise = rawResultsPromise
      .catch(error => this.handleResultError(error));

    // Compute PM2.5 and update UI.
    Promise.all([rawResultsPromise, positionPromise])
      .then(promises => this.getSortedResults(promises[0], promises[1]))
      .then(sortedResults => sortedResults.slice(0, MAX_SENSORS))
      .then(sortedResults => this.constructSensorModels(sortedResults))
      //.then(sensorModels => this.setState({aqiText: sensorModels.toString()}))
      .then(sensorModels => this.setState({sensorModels: sensorModels}))
      .catch(error => this.setState({aqiText: error.message}));
  }

}

export default Status;
