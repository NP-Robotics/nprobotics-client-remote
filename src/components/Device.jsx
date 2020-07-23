import React, { useState, useRef, useEffect } from 'react';
import { connect } from 'dva';

const Device = ({ dispatch, device }) => {
  const [state, setState] = useState({
    device: null,
  });

  return null;
};

export default connect(({ device }) => ({ device }))(Device);
