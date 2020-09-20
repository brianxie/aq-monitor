import React from 'react';

export function wrapInCardBody(text) {
  return (
    <div className="card-body">
      {text}
    </div >
  );
}

export function wrapInContainer(text) {
  return (
    <div className="container">
      {text}
    </div >
  );
}
