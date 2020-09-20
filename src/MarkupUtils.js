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

export function severityBadgeOf(aqi) {
  var badgeTag;
  if (aqi <= 50) {
    badgeTag = "success";
  } else if (aqi <= 150) {
    badgeTag = "warning";
  } else {
    badgeTag = "danger";
  }

  return (
    <div className={"badge badge-" + badgeTag}>
      {aqi.toString()}
    </div>
  );
}
