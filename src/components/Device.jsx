import React, { useState, useRef, useEffect } from 'react';
import { connect } from 'dva';

const Device = ({ dispatch, device }) => {
  const [state, setState] = useState({
    device: null,
  });

  useEffect(() => {

  });

  return null;
};

export default connect(({ device }) => ({ device }))(Device);
