import React from 'react';
import Button from './Button';
import * as Sensor from './Sensor';
import * as ResponseUtils from './ResponseUtils';
import * as MarkupUtils from './MarkupUtils';

// props::positionResult
// props::updateFn
class PositionComponent extends React.Component {
  render() {
    return (
      <div className="card border-secondary">
        {this.renderCurrentPositionElement()}
        {this.renderButton()}
      </div>
    );
  }

  renderButton() {
    return(
      <div className="container">
        <Button
          text={"Refresh location"}
          handleClick={() => this.props.updateFn()} />
      </div>
    );
  }

  renderCurrentPositionElement() {
    var positionResult = this.props.positionResult;
    if (positionResult == null) {
      return MarkupUtils.wrapInContainer("Position unknown");
    }

    var tag = positionResult[ResponseUtils.ResponseProperties.TAG];
    switch (tag) {
      case ResponseUtils.ResponseStates.SUCCESS:
        return MarkupUtils.wrapInContainer(
          this.parsePositionValue(
            positionResult[ResponseUtils.ResponseProperties.VALUE]));
      case ResponseUtils.ResponseStates.FAILURE:
        return MarkupUtils.wrapInContainer(
          "Error: " + positionResult[ResponseUtils.ResponseProperties.ERR]);
      case ResponseUtils.ResponseStates.PENDING:
        return MarkupUtils.wrapInContainer("Fetching position...");
      default:
        throw new Error("Unrecognized tag: " + tag.toString());
    }
  }

  // TODO: fix string
  parsePositionValue(positionValue) {
    return "Latitude: "
      + positionValue[Sensor.PositionKeys.LATITUDE].toString()
      + " Longitude: "
      + positionValue[Sensor.PositionKeys.LONGITUDE].toString();
  }
}

export default PositionComponent;
