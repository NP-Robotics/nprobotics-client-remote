import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import { Button } from 'antd';
import jeremy from '../assets/jeremy.jpeg';

const IndexPage = ({
  user, history,
}) => (
  <div style={{ textAlign: 'center' }}>
    <h1>welcome to NP Robotics</h1>
    <img src={jeremy} style={{ width: '20%', height: '20%' }} alt="jeremy" />
  </div>
);

IndexPage.propTypes = {
  user: PropTypes.shape({}),
  history: PropTypes.shape({
    push: PropTypes.func,
  }),
};

IndexPage.defaultProps = {
  user: {},
  history: {},
};

export default connect(({ user }) => ({ user }))(IndexPage);
