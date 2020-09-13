import React from 'react';
import * as ResponseUtils from './ResponseUtils';

function computeAQI() {
  return 0;
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

  getSingleSensorElem(sensorModel) {
    return (
      <div class="card-body">
        {sensorModel.toString()}
      </div>
    );
  }
}

export default SensorsComponent;
