import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import { Button } from 'antd';
import jeremy from '../assets/jeremy.jpeg';

const IndexPage = ({
  state, history,
}) => {
  console.log(state);
  return (
    <div style={{ textAlign: 'center' }}>
      <h1>welcome to NP Robotics</h1>
      <img src={jeremy} style={{ width: '20%', height: '20%' }} alt="jeremy" />
      <br />
      <Button onClick={() => { history.push('/login'); }}>Login</Button>
    </div>
  );
};

IndexPage.propTypes = {
  state: PropTypes.shape({}),
  history: PropTypes.shape({
    push: PropTypes.func,
  }),
};

IndexPage.defaultProps = {
  state: {},
  history: {},
};

export default connect(({ state }) => ({ state }))(IndexPage);
