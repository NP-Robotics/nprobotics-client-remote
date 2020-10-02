import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import Pickachu from '../assets/pickachu.png';

const IndexPage = ({ user, history }) => (
  <div>
    <p style={{
      fontSize: '50px',
      fontWeight: 'bold',
    }}
    >
      SGRobotCloud
    </p>
    <p>Landing Page coming soon!</p>
    <img style={{ width: '25%', height: 'auto' }} src={Pickachu} alt="pickachu" />
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
