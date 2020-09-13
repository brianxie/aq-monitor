import React from 'react';
import PositionComponent from './PositionComponent';
import SensorsComponent from './SensorsComponent';
import TimerComponent from './TimerComponent';
import * as Sensor from './Sensor';
import * as ResponseUtils from './ResponseUtils';

//
// Helper methods
//

// Transforms a result into an object containing the latitude, longitude, and
// result itself.
function createTaggedResult(jsonResult) {
  return {
    lat: parseFloat(jsonResult.Lat),
    lon: parseFloat(jsonResult.Lon),
    result: jsonResult
  };
}

// Computes distance between a single result and the provided position using
// the Euclidean metric.
function distanceFromPosition(taggedResult, position) {
  var dLat = taggedResult.lat - position[Sensor.LocationKeys.LATITUDE];
  var dLon = taggedResult.lon - position[Sensor.LocationKeys.LONGITUDE];
  return Math.sqrt(Math.pow(dLat, 2) + Math.pow(dLon, 2));
}

// Sorts results by distance from position, increasing.
function getSortedResults(taggedResults, position) {
  return taggedResults.sort((a, b) =>
    distanceFromPosition(a, position) - distanceFromPosition(b, position))
    .map(taggedResult => taggedResult.result);
}

function constructLocationData(latitude, longitude) {
  return {
      [Sensor.LocationKeys.LATITUDE]: latitude,
      [Sensor.LocationKeys.LONGITUDE]: longitude,
    };
}

// Transforms an array of results into an array of SensorModels.
function constructSensorModels(results) {
  return results.map(result => {
    var stats = JSON.parse(result.Stats);

    var timeData = {
      [Sensor.TimeDataKeys.REALTIME]: stats.v,
      [Sensor.TimeDataKeys.TEN_MINUTES]: stats.v1,
      [Sensor.TimeDataKeys.THIRTY_MINUTES]: stats.v2,
      [Sensor.TimeDataKeys.ONE_HOUR]: stats.v3,
      [Sensor.TimeDataKeys.SIX_HOURS]: stats.v4,
      [Sensor.TimeDataKeys.ONE_DAY]: stats.v5,
    };
    var locationData = constructLocationData(
      parseFloat(result.Lat), parseFloat(result.Lon));

    return new Sensor.SensorModel(timeData, locationData);
  });
}

// Throws an error on a failed response, otherwise returns the response.
function checkResponseOk(response) {
  if (!response.ok) {
    throw new Error(response.status);
  }
  return response;
}

// Reads raw sensor results from PurpleAir.
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
const MAX_SENSORS = 5;

//
// React component
//

class Status extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sensorModels: null,
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
          className="Catchall"
          class="card-body"
        >
          {"TODO: catchall text"}
        </div>

        <div
          className="Sensors"
          class="card-body"
        >
          {<SensorsComponent sensorModels={this.state.sensorModels}/>}
        </div>

        <div
          className="Position"
          class="card-body"
        >
          {<PositionComponent position={this.state.position} />}
        </div>

        <div
          className="TimerSection"
          class="card-body"
        >
          {<TimerComponent
            pollIntervalMillis={this.props.pollIntervalMillis}
            callback={() => this.updateStatus(false)} />}
        </div>

      </div>
    );
  }

  // Initial update on render update on render.
  componentDidMount() {
    this.updateStatus(true);
  }

  componentWillUnmount() {
  }

  // Handles errors in sensor fetching.
  handleResultError(error) {
    const resultErrorString = "Error in fetching sensors: " + error.message;
    this.setState({sensorModels: ResponseUtils.ResponseFailure(resultErrorString)});
    // Rethrow the error for subsequent nodes.
    throw new Error(resultErrorString);
  }

  // Handles errors in location fetching.
  handlePositionError(error) {
    const positionErrorString = "Error in fetching position: " + error.message;
    this.setState({position: ResponseUtils.ResponseFailure(positionErrorString)});
    // Rethrow the error for subsequent nodes.
    throw new Error(positionErrorString);
  }

  // Fetches location and sensor readings, and updates the status.
  updateStatus(refreshLocation) {
    console.log("[" + new Date() + "] updating...");

    this.setState({sensorModels: ResponseUtils.ResponsePending()});

    var positionPromise;

    var hasPreviousPosition =
      (this.state.position != null &&
        this.state.position[ResponseUtils.ResponseProperties.TAG] ===
        ResponseUtils.ResponseStates.SUCCESS);

    if (!refreshLocation && hasPreviousPosition) {
      positionPromise = Promise.resolve(
        this.state.position[ResponseUtils.ResponseProperties.VALUE]);
    } else {
      this.setState({position: ResponseUtils.ResponsePending()});
      // Issue requests for position and sensor readings.
      positionPromise = function (options) {
          return new Promise(function(resolve, reject) {
            navigator.geolocation.getCurrentPosition(resolve, reject, options);
          });
      }()
        .then(position =>
          constructLocationData(
            parseFloat(position.coords.latitude),
            parseFloat(position.coords.longitude)))
        .then(position => {
          this.setState({
            position: ResponseUtils.ResponseSuccess(position)
          });
          // Return the original position, so that subsequent logic can work with it.
          return position;
        })
      .catch(error => this.handlePositionError(error));
    }

    var rawResultsPromise = getRawResults();
    // Check for errors with the sensor reading per se, because Promise.all fails
    // fast.
    // Update eagerly if there's a failure.
    // In the successful case, we can't update until we have both position and
    // sensor readings.
    rawResultsPromise = rawResultsPromise
      .catch(error => this.handleResultError(error));

    // Compute PM2.5 and update UI.
    Promise.all([rawResultsPromise, positionPromise])
      .then(promises => getSortedResults(promises[0], promises[1]))
      .then(sortedResults => sortedResults.slice(0, MAX_SENSORS))
      .then(sortedResults => constructSensorModels(sortedResults))
      .then(sensorModels =>
        this.setState({
          sensorModels: ResponseUtils.ResponseSuccess(sensorModels)
        }))
      // Either the location or the sensor promise failed (or some business
      // logic broke).
      // Since sensorModels depends on both being successful, update its state.
      .catch(error =>
        this.setState({
          sensorModels: ResponseUtils.ResponseFailure(error.message)
        }));
  }
}

export default Status;
