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

// props::sensorModels
// aqi, raw pm, drilldowns. maybe maps?
class SensorsComponent extends React.Component {
  render() {
    return (
      <div class="card-body">
        {this.getSensorsText()}
      </div>
    );
  }

  getSensorsText() {
    var sensorModels = this.props.sensorModels;
    if (sensorModels == null) {
      return "No sensor data";
    }
    var tag = sensorModels[ResponseUtils.ResponseProperties.TAG];
    switch (tag) {
      // TODO: this is gnarly
      case ResponseUtils.ResponseStates.SUCCESS:
        var parsedSensors = sensorModels[ResponseUtils.ResponseProperties.VALUE]
          .map(model => this.getSingleSensorElem(model));
        return parsedSensors;
      case ResponseUtils.ResponseStates.FAILURE:
        return "Error: " + sensorModels[ResponseUtils.ResponseProperties.ERR];
      case ResponseUtils.ResponseStates.PENDING:
        return "Fetching sensor data...";
      default:
        throw new Error("Unrecognized tag: " + tag.toString());
    }
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
