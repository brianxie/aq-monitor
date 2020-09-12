import React from 'react';

// handleClick
// TODO: add the text
class Button extends React.Component {
  render() {
    return (
      <button
        className="Button"
        type="button"
        class="btn btn-outline-secondary btn-lg"
        onClick={() => this.props.handleClick()}
      >
        {"Placeholder text expand/collapse"}
      </button>
    );
  }
}

export default Button;
