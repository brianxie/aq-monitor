import React from 'react';
import * as ResponseUtils from './ResponseUtils';

// props::position
class PositionComponent extends React.Component {
  render() {
    return (
      <div
        className="PositionComponent"
        class="card text-left border-secondary"
      >
        {this.getPositionString()}
      </div>
    );
  }

  getPositionString() {
    var position = this.props.position;
    if (position == null) {
      return "Position unknown";
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
}

export default PositionComponent;
