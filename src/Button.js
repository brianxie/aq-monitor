import React from 'react';

// props::handleClick
// props::text
class Button extends React.Component {
  render() {
    return (
      <button
        className="btn btn-outline-dark btn-sm"
        type="button"
        onClick={() => this.props.handleClick()}
      >
        {this.props.text}
      </button>
    );
  }
}

export default Button;
