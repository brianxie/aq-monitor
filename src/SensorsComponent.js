import React from 'react';
import * as Sensor from './Sensor';
import * as MarkupUtils from './MarkupUtils';
import * as ResponseUtils from './ResponseUtils';

const MAX_SENSORS = 6;
const RADIANS_PER_DEGREE = Math.PI / 180;
const RADIUS = 6371; // km

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
      "AQI is _literally incapable_ of measuring this concentration");
  }

  return ((C - C_low) * (I_high - I_low) / (C_high - C_low)) + I_low;
}

function haversine(deltaRadians) {
  return Math.pow(Math.sin(deltaRadians / 2), 2);
}

// Computes distance between a single result and the provided position using
// the Haversine formula.
function distanceFromCurrentPosition(sensorModel, position) {
  var sensorLatRadians = RADIANS_PER_DEGREE
    * sensorModel.positionData[Sensor.PositionKeys.LATITUDE];
  var sensorLonRadians = RADIANS_PER_DEGREE
    * sensorModel.positionData[Sensor.PositionKeys.LONGITUDE];
  var posLatRadians = RADIANS_PER_DEGREE
    * position[Sensor.PositionKeys.LATITUDE];
  var posLonRadians = RADIANS_PER_DEGREE
    * position[Sensor.PositionKeys.LONGITUDE];

  var havLat = haversine(sensorLatRadians - posLatRadians);
  var havLon = haversine(sensorLonRadians - posLonRadians);

  var havCentralAngle =
    havLat
      + Math.cos(posLatRadians) * Math.cos(sensorLatRadians) * havLon;

  return 2 * RADIUS * Math.asin(Math.sqrt(havCentralAngle));
}

// Returns an object containing the sensor and its distance from the provided
// position in kilometers.
function wrapSensorModelWithDistance(sensorModel, position) {
  return {
    sensorModel: sensorModel,
    distance: distanceFromCurrentPosition(sensorModel, position)
  }
}

// props::sensorModelsResult
// props::positionResult
class SensorsComponent extends React.Component {
  render() {
    return (
      <div className="card border-secondary">
        {this.getClosestSensorsElements(MAX_SENSORS)}
      </div>
    );
  }

  getClosestSensorsElements(limit) {
    var positionResult = this.props.positionResult;
    var sensorModelsResult = this.props.sensorModelsResult;
    if (positionResult == null || sensorModelsResult == null) {
      return MarkupUtils.wrapInContainer("No sensor data");
    }

    var positionTag = positionResult[ResponseUtils.ResponseProperties.TAG];
    var sensorModelsTag = sensorModelsResult[ResponseUtils.ResponseProperties.TAG];

    if (positionTag === ResponseUtils.ResponseStates.FAILURE
      && sensorModelsTag === ResponseUtils.ResponseStates.FAILURE) {
      // Double failure.
      return MarkupUtils.wrapInContainer(
        "Error: "
        + positionResult[ResponseUtils.ResponseProperties.ERR]
        + " | "
        + sensorModelsResult[ResponseUtils.ResponseProperties.ERR]);
    } else if (positionTag === ResponseUtils.ResponseStates.FAILURE
      || sensorModelsTag === ResponseUtils.ResponseStates.FAILURE) {
      // Single failure.
      var oneOfErrorString = (positionTag === ResponseUtils.ResponseStates.FAILURE)
        ? positionResult[ResponseUtils.ResponseProperties.ERR]
        : sensorModelsResult[ResponseUtils.ResponseProperties.ERR];
      return MarkupUtils.wrapInContainer("Error: " + oneOfErrorString);
    } else if (positionTag === ResponseUtils.ResponseStates.PENDING
      || sensorModelsTag === ResponseUtils.ResponseStates.PENDING) {
      // Pending.
      return MarkupUtils.wrapInContainer("Fetching sensor data...");
    } else if (positionTag === ResponseUtils.ResponseStates.SUCCESS
      && sensorModelsTag === ResponseUtils.ResponseStates.SUCCESS) {
      // All successful.
      var position = positionResult[ResponseUtils.ResponseProperties.VALUE];
      var sensorModels = sensorModelsResult[ResponseUtils.ResponseProperties.VALUE];
      return sensorModels
        .map(sensorModel => wrapSensorModelWithDistance(sensorModel, position))
        .sort((a, b) => a["distance"] - b["distance"])
        .slice(0, limit)
        .map(sensorWithDistance => this.computeAndFormatScore(sensorWithDistance));
    }

    throw new Error(
      "ResponseState could not be handled: "
        + positionTag.toString() + " | " + sensorModelsTag.toString());
  }

  // TODO: leverage SensorModel::toString
  computeAndFormatScore(sensorWithDistance) {
    return (
      <div className="container">
        <div className="badge badge-secondary">
          {computeAQIPM25(sensorWithDistance["sensorModel"].timeData[Sensor.TimeDataKeys.REALTIME])}
        </div>
        <div className="badge badge-secondary">
          {sensorWithDistance["distance"]}
        </div>
      </div>
    );
  }
}

export default SensorsComponent;
