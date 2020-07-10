import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import { Button } from 'antd';
import jeremy from '../assets/jeremy.jpeg';

const IndexPage = ({ global, history }) => {
  console.log(global);
  return (
    <div style={{ textAlign: 'center' }}>
      <h1>Welcome to NP Robotics</h1>
      <img src={jeremy} style={{ width: '20%', height: '20%' }} alt="jeremy" />
      <br />
      <Button
        onClick={() => {
          history.push('/login');
        }}
      >
        Login
      </Button>
      <Button
        onClick={() => {
          history.push('/signup');
        }}
      >
        Sign Up
      </Button>
    </div>
  );
};

IndexPage.propTypes = {
  global: PropTypes.shape({}),
  history: PropTypes.shape({
    push: PropTypes.func,
  }),
};

IndexPage.defaultProps = {
  global: {},
  history: {},
};

export default connect(({ global }) => ({ global }))(IndexPage);
