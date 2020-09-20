import React from 'react';
import PositionComponent from './PositionComponent';
import SensorsComponent from './SensorsComponent';
import TimerComponent from './TimerComponent';
import * as Sensor from './Sensor';
import * as ResponseUtils from './ResponseUtils';

//
// Helper methods
//

function createSensorModel(jsonResult) {
  try {
    var stats = JSON.parse(jsonResult.Stats);

    var timeData = {
      [Sensor.TimeDataKeys.REALTIME]: stats.v,
      [Sensor.TimeDataKeys.TEN_MINUTES]: stats.v1,
      [Sensor.TimeDataKeys.THIRTY_MINUTES]: stats.v2,
      [Sensor.TimeDataKeys.ONE_HOUR]: stats.v3,
      [Sensor.TimeDataKeys.SIX_HOURS]: stats.v4,
      [Sensor.TimeDataKeys.ONE_DAY]: stats.v5,
    };
    var positionData = constructPositionData(
      jsonResult.Lat, jsonResult.Lon);

    return ResponseUtils.ResponseSuccess(
      new Sensor.SensorModel(timeData, positionData));
  } catch (err) {
    // JSON parsing may fail due to absent or malformatted fields.
    return ResponseUtils.ResponseFailure(err);
  }
}

// Wrap a latitude and longitude in a PositionData object.
function constructPositionData(latitude, longitude) {
  return {
      [Sensor.PositionKeys.LATITUDE]: latitude,
      [Sensor.PositionKeys.LONGITUDE]: longitude,
    };
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
// The fetched result is JSON-formatted and contains metadata followed by a
// single "results" array.
function getSensorResults() {
  const srcUrl = "https://www.purpleair.com/json";
  return fetch(srcUrl)
    .then(response => checkResponseOk(response))
    .then(response => response.json())
    .then(jsonObj => jsonObj.results)
    .then(results => results.map(result => createSensorModel(result)))
    .then(results => results.filter(result => ResponseUtils.isSuccessful(result)))
    .then(results => results.map(result => result[ResponseUtils.ResponseProperties.VALUE]));
}

//
// React component
//

class Status extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sensorModelsResult: null,
      positionResult: null,
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
          {<SensorsComponent
            sensorModelsResult={this.state.sensorModelsResult}
            positionResult={this.state.positionResult} />}
        </div>

        <div
          className="Position"
          class="card-body"
        >
          {<PositionComponent
            positionResult={this.state.positionResult}
            updateFn={() => this.updatePositionAsync()} />}
        </div>

        <div
          className="TimerSection"
          class="card-body"
        >
          {<TimerComponent
            pollIntervalMillis={this.props.pollIntervalMillis}
            callback={() => this.updateStatusAsync(false)} />}
        </div>

      </div>
    );
  }

  // Initial update on render.
  componentDidMount() {
    this.updateStatusAsync(true);
  }

  componentWillUnmount() {
  }

  // Handles errors in position fetching.
  handlePositionError(error) {
    const positionErrorString = "Error in fetching position: " + error.message;
    this.setState({positionResult: ResponseUtils.ResponseFailure(positionErrorString)});
  }

  // Handles errors in sensor fetching.
  handleResultError(error) {
    const sensorModelsErrorString = "Error in fetching sensors: " + error.message;
    this.setState({sensorModelsResult: ResponseUtils.ResponseFailure(sensorModelsErrorString)});
  }

  // Updates positionResult.
  updatePositionAsync() {
    this.setState({positionResult: ResponseUtils.ResponsePending()});

    return function (options) {
        return new Promise(function(resolve, reject) {
          navigator.geolocation.getCurrentPosition(resolve, reject, options);
        });
    }()
      .then(position =>
        constructPositionData(
          parseFloat(position.coords.latitude),
          parseFloat(position.coords.longitude)))
      .then(position => {
        this.setState({
          positionResult: ResponseUtils.ResponseSuccess(position)
        });
        // Return the original position, so that subsequent logic can work with it.
        return position;
      })
    .catch(error => this.handlePositionError(error));
  }

  // Updates sensorModelsResult.
  updateSensorModelsAsync() {
    this.setState({sensorModelsResult: ResponseUtils.ResponsePending()});

    return getSensorResults()
      .then(sensorModels => {
        this.setState({
          sensorModelsResult: ResponseUtils.ResponseSuccess(sensorModels)
        });
        return sensorModels;
      })
      .catch(error => this.handleResultError(error));
  }

  // Fetches position and sensor readings, and updates the status.
  updateStatusAsync(refreshPosition) {
    console.log("[" + new Date() + "] updating...");

    var positionPromise;
    var hasPreviousPosition =
      (this.state.positionResult != null &&
        this.state.positionResult[ResponseUtils.ResponseProperties.TAG] ===
        ResponseUtils.ResponseStates.SUCCESS);
    if (!refreshPosition && hasPreviousPosition) {
      positionPromise = Promise.resolve(
        this.state.positionResult[ResponseUtils.ResponseProperties.VALUE]);
    } else {
      positionPromise = this.updatePositionAsync();
    }

    var sensorModelsPromise = this.updateSensorModelsAsync();

    Promise.all([positionPromise, sensorModelsPromise])
      .then(results => {
        console.log("[" + new Date() + "] finished updating.");
        console.log(results);
      });
  }
}

export default Status;
