import React from 'react';

// props::handleClick
// props::text
class Button extends React.Component {
  render() {
    return (
      <button
        className="Button"
        type="button"
        class="btn btn-outline-secondary btn-lg"
        onClick={() => this.props.handleClick()}
      >
        {this.props.text}
      </button>
    );
  }
}

export default Button;
