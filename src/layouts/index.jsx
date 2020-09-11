import React from 'react';
import { connect } from 'dva';
import PropTypes from 'prop-types';
import { Spin, Layout } from 'antd';
import HeaderComponent from '../components/header';

const { Content } = Layout;

const headerless = new Set([
  '/robotface',
  '/login',
  '/forgotpassword',
  '/resetpassword',
  '/robot/',
]);

const IndexLayout = ({ children, history, user }) => {
  // loading screen to ensure authentication is loaded
  if (user.authenticated === null) {
    return (
      <div
        style={{
          textAlign: 'center',
          margin: '50vh',
        }}
      >
        <Spin size="large" />
      </div>
    );
  }
  // loading screen to ensure other user data is loaded
  if (!user.identityLoaded || !user.robotsLoaded) {
    return (
      <div
        style={{
          textAlign: 'center',
          margin: '50vh',
        }}
      >
        <Spin size="large" />
      </div>
    );
  }
  // paths that do not require header
  if (headerless.has(history.location.pathname)) {
    return children;
  }
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <HeaderComponent />

      <Layout style={{ textAlign: 'center' }}>
        <Content>{children}</Content>
      </Layout>
    </Layout>
  );
};

IndexLayout.propTypes = {
  user: PropTypes.shape({
    identityLoaded: PropTypes.bool,
    robotsLoaded: PropTypes.bool,
    authenticated: PropTypes.bool,
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
    identityLoaded: false,
    robotsLoaded: false,
    authenticated: null,
  },
  history: {},
  children: {},
};

export default connect(({ user }) => ({ user }))(IndexLayout);
