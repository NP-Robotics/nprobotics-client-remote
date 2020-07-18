import React from 'react';
import { connect } from 'dva';
import PropTypes from 'prop-types';
import { Spin } from 'antd';

const IndexLayout = ({ children, history, user }) => {
  if (user.authenticated === null) {
    return (
      <div style={{
        textAlign: 'center',
        margin: '50vh',
      }}
      >
        <Spin size="large" />
      </div>
    );
  }
  if (user.secretAccessKey === null && history.location.pathname === '/robot') {
    return (
      <div style={{
        textAlign: 'center',
        margin: '50vh',
      }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      {children}
    </div>
  );
};

IndexLayout.propTypes = {
  user: PropTypes.shape({
    authenticated: PropTypes.bool,
    secretAccessKey: PropTypes.string,

  }),
  history: PropTypes.shape({
    location: PropTypes.shape({
      pathname: PropTypes.string,
    }),
  }),
  children: PropTypes.shape({}),
};

IndexLayout.defaultProps = {
  user: {
    authenticated: null,
    secretAccessKey: null,
  },
  history: {},
  children: {},
};

export default connect(({ user }) => ({ user }))(IndexLayout);
