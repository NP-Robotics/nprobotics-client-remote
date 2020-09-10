import React from 'react';
import { connect } from 'dva';
import PropTypes from 'prop-types';
import { Spin, Layout } from 'antd';
import HeaderComponent from '../components/header';

const { Content } = Layout;

const IndexLayout = ({ children, history, user }) => {
  // loading screen
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
  if (history.location.pathname === '/robotface') {
    return children;
  }
  if (history.location.pathname === '/login') {
    return children;
  }
  if (history.location.pathname === '/forgotpassword') {
    return children;
  }
  if (history.location.pathname === '/resetpassword') {
    return children;
  }
  if (history.location.pathname === '/robot/') {
    return children;
  }
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <HeaderComponent />

      <Layout style={{ textAlign: 'center' }}>
        <Content>
          {children}

        </Content>
      </Layout>
    </Layout>
  );
};

IndexLayout.propTypes = {
  user: PropTypes.shape({
    identityLoaded: PropTypes.bool,
    robotsLoaded: PropTypes.bool,

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
  },
  history: {},
  children: {},
};

export default connect(({ user }) => ({ user }))(IndexLayout);
