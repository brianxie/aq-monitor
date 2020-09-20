import React from 'react';
import * as ResponseUtils from './ResponseUtils';
import * as Sensor from './Sensor';
import Button from './Button';

// props::positionResult
// props::updateFn
class PositionComponent extends React.Component {
  render() {
    return (
      <div
        className="card-body"
      >
        {this.getPositionString()}
        {this.renderButton()}
      </div>
    );
  }

  renderButton() {
    return(
      <div className="container p-3">
        <Button
          text={"Refresh location"}
          handleClick={() => this.props.updateFn()}
        />
      </div>
    );
  }

  getPositionString() {
    var positionResult = this.props.positionResult;
    if (positionResult == null) {
      return "Position unknown";
    }

    var tag = positionResult[ResponseUtils.ResponseProperties.TAG];
    switch (tag) {
      case ResponseUtils.ResponseStates.SUCCESS:
        return "Postion: " +
          this.parsePositionValue(
            positionResult[ResponseUtils.ResponseProperties.VALUE]);
      case ResponseUtils.ResponseStates.FAILURE:
        return "Error: " + positionResult[ResponseUtils.ResponseProperties.ERR];
      case ResponseUtils.ResponseStates.PENDING:
        return "Fetching position...";
      default:
        throw new Error("Unrecognized tag: " + tag.toString());
    }
  }

  parsePositionValue(positionValue) {
    return "Latitude: " + positionValue[Sensor.PositionKeys.LATITUDE].toString()
      + " "
      + "Longitude: " + positionValue[Sensor.PositionKeys.LONGITUDE].toString();
  }
}

export default PositionComponent;
