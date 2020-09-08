import React from 'react';
import { connect } from 'dva';
import PropTypes from 'prop-types';
import { Spin, Layout } from 'antd';
import HeaderComponent from '../components/header';

const { Content } = Layout;

const IndexLayout = ({ children, history, user }) => {
  if (
    user.authenticated === null
    || (user.authenticated === true && user.secretAccessKey === null)
  ) {
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
  if (history.location.pathname === '/signup') {
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
