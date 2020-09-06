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
        {<br />}
        {"Your position: "}
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

  checkResponseOk(response) {
    if (!response.ok) {
      throw new Error(response.status);
    }
    return response;
  }

  // Reads raw sensor results from purpleair.
  // Future function.
  getRawResults() {
    const srcUrl = "https://www.purpleair.com/json";
    return fetch(srcUrl)
      .then(response => this.checkResponseOk(response))
      .then(response => response.json())
      .then(jsonObj => jsonObj.results)
      .then(results => results.map(result => this.createTaggedResult(result)));
  }

  handleResultError(error) {
    const resultErrorString = "Error in fetching sensors: " + error.message;
    // Rethrow the error for subsequent nodes.
    throw new Error(resultErrorString);
  }

  handlePositionError(error) {
    const positionErrorString = "Error in fetching position: " + error.message;
    this.setState({position: positionErrorString});
    // Rethrow the error for subsequent nodes.
    throw new Error(positionErrorString);
  }

  // Fetches location and sensor readings, and updates the status.
  updateStatusAndButton() {
    this.setState({count: this.state.count + 1});
    this.setState({statusText: "Request pending..."});
    this.setState({position: "Position pending..."});

    // Issue requests for position and sensor readings.
    var positionPromise = function (options) {
        return new Promise(function(resolve, reject) {
          navigator.geolocation.getCurrentPosition(resolve, reject, options);
        });
    }();
    var rawResultsPromise = this.getRawResults();

    // Check for errors in fetching position, and update UI immediately if possible.
    positionPromise = positionPromise
      .then(position => {
        var positionString =
          position.coords.latitude.toString()
            + ", "
            + position.coords.longitude.toString();
        this.setState({position: positionString});
        // Return the original position, so that subsequent logic can work with it.
        // Pretty-print is only for UI purposes.
        return position;
      })
      .catch(error => this.handlePositionError(error));

    // Check for errors with the sensor reading per se, because Promise.all fails fast.
    // The status value can't be updated until we have both position and sensor readings.
    rawResultsPromise = rawResultsPromise
      .catch(error => this.handleResultError(error));

    // Compute PM2.5 and update UI.
    Promise.all([rawResultsPromise, positionPromise])
      .then(promises => this.getSortedResults(promises[0], promises[1]))
      .then(filteredResults => this.handleFilteredResults(filteredResults))
      .then(status => this.setState({statusText: status}))
      .catch(error => this.setState({statusText: error.message}));
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
