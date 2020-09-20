import React from 'react';
import * as ResponseUtils from './ResponseUtils';
import * as Sensor from './Sensor';

// haha
function computeAQIPM25(C) {
  var C_low;
  var C_high;
  var I_low;
  var I_high;

  if (C <= 12.0) {
    C_low = 0.0;
    C_high = 12.0;
    I_low = 0;
    I_high = 50;
  } else if (C <= 35.4) {
    C_low = 12.1;
    C_high = 35.4;
    I_low = 51;
    I_high = 100;
  } else if (C <= 55.4) {
    C_low = 35.5;
    C_high = 55.4;
    I_low = 101;
    I_high = 150;
  } else if (C <= 150.4) {
    C_low = 55.5;
    C_high = 150.4;
    I_low = 151;
    I_high = 200;
  } else if (C <= 250.4) {
    C_low = 150.5;
    C_high = 250.4;
    I_low = 201;
    I_high = 300;
  } else if (C <= 350.4) {
    C_low = 250.5;
    C_high = 350.4;
    I_low = 301;
    I_high = 400;
  } else if (C <= 500.4) {
    C_low = 350.5;
    C_high = 500.4;
    I_low = 401;
    I_high = 500;
  } else {
    throw new Error(
      "AQI is _literally incapable_ of measuring such a large concentration");
  }

  return ((C - C_low) * (I_high - I_low) / (C_high - C_low)) + I_low;
}

// Computes distance between a single result and the provided position using
// the Euclidean metric.
function distanceFromCurrentPosition(sensorModel, position) {
  var deltaLatitude =
    sensorModel.positionData[Sensor.PositionKeys.LATITUDE]
    - position[Sensor.PositionKeys.LATITUDE];
  var deltaLongitude =
    sensorModel.positionData[Sensor.PositionKeys.LONGITUDE]
    - position[Sensor.PositionKeys.LONGITUDE];
  return Math.sqrt(Math.pow(deltaLatitude, 2) + Math.pow(deltaLongitude, 2));
}

const MAX_SENSORS = 6;

// props::sensorModelsResult
// props::positionResult
// aqi, raw pm, drilldowns. maybe maps?
class SensorsComponent extends React.Component {
  render() {
    return (
      <div class="card-body">
        {this.getClosestSensorsText(MAX_SENSORS)}
      </div>
    );
  }

  // Not very generic
  getClosestSensorsText(limit) {
    var positionResult = this.props.positionResult;
    var sensorModelsResult = this.props.sensorModelsResult;
    if (positionResult == null || sensorModelsResult == null) {
      return "No sensor data";
    }

    var positionTag = positionResult[ResponseUtils.ResponseProperties.TAG];
    var sensorModelsTag = sensorModelsResult[ResponseUtils.ResponseProperties.TAG];

    if (positionTag === ResponseUtils.ResponseStates.ERR
      && sensorModelsTag === ResponseUtils.ResponseStates.ERR) {
      // Double failure.
      return "Error: "
        + positionResult[ResponseUtils.ResponseProperties.ERR]
        + " | "
        + sensorModelsResult[ResponseUtils.ResponseProperties.ERR];
    } else if (positionTag === ResponseUtils.ResponseStates.ERR
      || sensorModelsTag === ResponseUtils.ResponseStates.ERR) {
      // Single failure.
      var oneOfErrorString = (positionTag === ResponseUtils.ResponseStates.ERR)
        ? positionResult[ResponseUtils.ResponseProperties.ERR]
        : sensorModelsResult[ResponseUtils.ResponseProperties.ERR];
      return "Error: " + oneOfErrorString;
    } else if (positionTag === ResponseUtils.ResponseStates.PENDING
      || sensorModelsTag === ResponseUtils.ResponseStates.PENDING) {
      // Pending.
      return "Fetching sensor data...";
    } else if (positionTag === ResponseUtils.ResponseStates.SUCCESS
      && sensorModelsTag === ResponseUtils.ResponseStates.SUCCESS) {
      // All successful.
      var position = positionResult[ResponseUtils.ResponseProperties.VALUE];
      var sensorModels = sensorModelsResult[ResponseUtils.ResponseProperties.VALUE];
      return sensorModels
        .sort((a, b) =>
          distanceFromCurrentPosition(a, position)
          - distanceFromCurrentPosition(b, position))
        .slice(0, limit)
        .map(model => this.getSingleSensorElem(model));
    }

    throw new Error(
      "ResponseState could not be handled: "
        + positionTag.toString() + " | " + sensorModelsTag.toString());
  }

  // Can obtain more from SensorModel::toString
  getSingleSensorElem(sensorModel) {
    return (
      <div class="card-body">
        {computeAQIPM25(sensorModel.timeData[Sensor.TimeDataKeys.REALTIME])}
      </div>
    );
  }
}

export default SensorsComponent;
