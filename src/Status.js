import React from 'react';
import Sensor from './Sensor';
import * as ResponseUtils from './ResponseUtils';

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

class Timer {
  constructor(remainingTimeMillis, defaultIntervalMillis, callback) {
    this.remainingTimeMillis = remainingTimeMillis;
    this.defaultIntervalMillis = defaultIntervalMillis;
    this.callback = callback;
  }

  tick(duration) {
    var newRemainingTimeMillis = this.remainingTimeMillis - duration;
    this.remainingTimeMillis = newRemainingTimeMillis;
    this.checkDone(newRemainingTimeMillis);
  }

  checkDone(remaining) {
    if (remaining <= 0) {
      this.callback();
      this.reset(this.defaultIntervalMillis);
    }
  }

  reset(durationMillis) {
    this.remainingTimeMillis = durationMillis;
  }

  display() {
    return this.remainingTimeMillis;
  }
}

// Transforms a result into an object containing the latitude, longitude, and result itself.
function createTaggedResult(jsonResult) {
  return {lat:parseFloat(jsonResult.Lat), lon:parseFloat(jsonResult.Lon), result:jsonResult};
}

// Computes distance between a single result and the provided position using the Euclidean metric.
function distanceFromPosition(taggedResult, position) {
  var dLat = taggedResult.lat - position.coords.latitude;
  var dLon = taggedResult.lon - position.coords.longitude;
  return Math.sqrt(Math.pow(dLat, 2) + Math.pow(dLon, 2));
}

// Sorts results by distance, increasing.
function getSortedResults(taggedResults, position) {
  return taggedResults.sort((a, b) =>
    distanceFromPosition(a, position) - distanceFromPosition(b, position))
    .map(taggedResult => taggedResult.result);
}

function constructSensorModels(sortedResults) {
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

function checkResponseOk(response) {
  if (!response.ok) {
    throw new Error(response.status);
  }
  return response;
}

// Reads raw sensor results from purpleair.
// Future function.
function getRawResults() {
  const srcUrl = "https://www.purpleair.com/json";
  return fetch(srcUrl)
    .then(response => checkResponseOk(response))
    .then(response => response.json())
    .then(jsonObj => jsonObj.results)
    .then(results => results.map(result => createTaggedResult(result)));
}

// Maximum number of sensors from which to consider data.
const MAX_SENSORS = 3;

// aqiText, position
// keep count in here
class Status extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // The individual sensors.
      sensorModels: null,
      // Current position
      position: null,
      timer: null,
    };
  }

  // some catchall
  // results: aqi, density, drilldown
  // timer :timer
  // position
  render() {
    return (
      <div
        className="Status"
        class="card text-left border-secondary"
      >

        <div
          className="Catchall"
          class="card-body"
        >
          {"catchall"}
        </div>

        <div
          className="Sensors"
          class="card-body"
        >
          {this.renderSensors() || "no sensors"}
        </div>

        <div
          className="Position"
          class="card-body"
        >
          {this.renderPosition() || "no position"} 
        </div>

        <div
          className="TimerSection"
          class="card-body"
        >
          {"Timer section. This should include a running count on the current timer, as well as a sub-button to update it manually."} 
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
    var sensorModels = this.state.sensorModels;
    if (sensorModels == null) {
      return null;
    }
    var tag = sensorModels[ResponseUtils.ResponseProperties.TAG];
    switch (tag) {
      case ResponseUtils.ResponseStates.SUCCESS:
        return (sensorModels[ResponseUtils.ResponseProperties.VALUE].map(model =>
          <div class="container p-3">
            <Sensor sensorModel={model} />
          </div>
        ));
      case ResponseUtils.ResponseStates.FAILURE:
        return "Error: " + sensorModels[ResponseUtils.ResponseProperties.ERR];
      case ResponseUtils.ResponseStates.PENDING:
        return "Fetching sensor data...";
      default:
        throw new Error("Unrecognized tag: " + tag.toString());
    }
  }

  renderPosition() {
    var position = this.state.position;
    if (position == null) {
      return null;
    }
    var tag = position[ResponseUtils.ResponseProperties.TAG];
    switch (tag) {
      case ResponseUtils.ResponseStates.SUCCESS:
        return "Postion: " + position[ResponseUtils.ResponseProperties.VALUE];
      case ResponseUtils.ResponseStates.FAILURE:
        return "Error: " + position[ResponseUtils.ResponseProperties.ERR];
      case ResponseUtils.ResponseStates.PENDING:
        return "Fetching position...";
      default:
        throw new Error("Unrecognized tag: " + tag.toString());
    }
  }

  handleResultError(error) {
    const resultErrorString = "Error in fetching sensors: " + error.message;
    // Rethrow the error for subsequent nodes.
    throw new Error(resultErrorString);
  }

  handlePositionError(error) {
    const positionErrorString = "Error in fetching position: " + error.message;
    this.setState({position: ResponseUtils.ResponseFailure(positionErrorString)});
    // Rethrow the error for subsequent nodes.
    throw new Error(positionErrorString);
  }

  // Fetches location and sensor readings, and updates the status.
  updateStatus() {
    console.log("[" + new Date() + "] updating...");
    this.setState({sensorModels: ResponseUtils.ResponsePending()});
    this.setState({position: ResponseUtils.ResponsePending()});

    // Issue requests for position and sensor readings.
    var positionPromise = function (options) {
        return new Promise(function(resolve, reject) {
          navigator.geolocation.getCurrentPosition(resolve, reject, options);
        });
    }();
    var rawResultsPromise = getRawResults();

    // Check for errors in fetching position, and update UI immediately if possible.
    positionPromise = positionPromise
      .then(position => {
        var positionString =
          position.coords.latitude.toString()
            + ", "
            + position.coords.longitude.toString();
        this.setState({position: ResponseUtils.ResponseSuccess(positionString)});
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
      .then(promises => getSortedResults(promises[0], promises[1]))
      .then(sortedResults => sortedResults.slice(0, MAX_SENSORS))
      .then(sortedResults => constructSensorModels(sortedResults))
      .then(sensorModels => this.setState({sensorModels: ResponseUtils.ResponseSuccess(sensorModels)}))
      .catch(error => this.setState({sensorModels: ResponseUtils.ResponseFailure(error.message)}));
  }
}

export default Status;
