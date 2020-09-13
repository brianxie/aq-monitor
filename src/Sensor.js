import React from 'react';

function computeAQI() {
  return 0;
}

class Sensor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sensorModel: this.props.sensorModel,
    };
  };

  render() {
    return (
        <div
          class="card-body"
        >
          {this.state.sensorModel.toString()}
        </div>);
  }
}

export default Sensor;
