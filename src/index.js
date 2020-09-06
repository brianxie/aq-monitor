import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

// handleClick, count
class Button extends React.Component {
  render() {
    return (
      <button
        className="Button"
        onClick={() => this.props.handleClick()}
      >
        {"Number of times I've been clicked: "}
        {this.props.count}
      </button>
    );
  }
}

// statusText, position
class Status extends React.Component {
  render() {
    return (
      <div>
        {this.props.statusText}
        {"\nYour position: "}
        {this.props.position}
      </div>
    );
  }
}

class Monitor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      statusText: "Default status text.",
      count: 0,
      position: "Default position.",
    };
  }

  // Transforms a result into an object containing the latitude, longitude, and result itself.
  createTaggedResult(jsonResult) {
    return {lat:parseFloat(jsonResult.Lat), lon:parseFloat(jsonResult.Lon), result:jsonResult};
  }

  // Computes distance between a single result and the provided position using the Euclidean metric.
  distanceFromPosition(taggedResult, position) {
    var dLat = taggedResult.lat - position.coords.latitude;
    var dLon = taggedResult.lon - position.coords.longitude;
    return Math.sqrt(Math.pow(dLat, 2) + Math.pow(dLon, 2));
  }

  // Sorts results by distance, increasing.
  getSortedResults(taggedResults, position) {
    return taggedResults.sort((a, b) =>
      this.distanceFromPosition(a, position) - this.distanceFromPosition(b, position))
      .map(taggedResult => taggedResult.result);
  }

  // Returns the PM2.5 value for the closest result.
  // This should really do more intelligent integration of multiple results.
  handleFilteredResults(filteredResults) {
    var stats = JSON.parse(filteredResults[0].Stats);
    // Take ten-minute average.
    return stats.v1;
  }

  // Reads raw sensor results from purpleair.
  getRawResults() {
    const srcUrl = "https://www.purpleair.com/json";
    return fetch(srcUrl)
      .then(response => response.json())
      .then(jsonObj => jsonObj.results)
      .then(results => results.map(result => this.createTaggedResult(result)));
  }

  // Fetches location and sensor readings, and updates the status.
  updateStatusAndButton() {
    this.setState({count: this.state.count + 1});
    this.setState({statusText: "Request pending..."});

    // Issue requests for position and sensor readings.
    var positionPromise = function (options) {
        return new Promise(function(resolve, reject) {
          navigator.geolocation.getCurrentPosition(resolve, reject, options);
        });
    }();
    var rawResultsPromise = this.getRawResults();

    // Update position in UI.
    positionPromise
      .then(position =>
        position.coords.latitude.toString() + ", " + position.coords.longitude.toString())
      .then(positionString => this.setState({position: positionString}));

    // Compute PM2.5 and update UI.
    Promise.all([rawResultsPromise, positionPromise])
      .then(promises => this.getSortedResults(promises[0], promises[1]))
      .then(filteredResults => this.handleFilteredResults(filteredResults))
      .then(status => this.setState({statusText: status}));
  }

  renderStatus() {
    return <Status
      statusText={this.state.statusText}
      position={this.state.position}
    />;
  }

  renderButton() {
    return <Button
      count={this.state.count}
      handleClick={() => this.updateStatusAndButton()}/>;
  }

  render() {
    return(
      <div>
        {this.renderStatus()}
        {this.renderButton()}
      </div>
    );
  }
}

ReactDOM.render(
  <Monitor />,
  document.getElementById('root')
);
