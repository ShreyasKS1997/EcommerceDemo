import React from 'react';
import './loader.css';

const loader = ({style = '98vh'}) => {
  return (
    <div className="loading" style={{ height: style }}>
      <div></div>
    </div>
  );
};

export default loader;
