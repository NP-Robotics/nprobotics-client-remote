/* eslint-disable linebreak-style */
/* eslint-disable react/self-closing-comp */
/* eslint-disable jsx-quotes */
/* eslint-disable react/jsx-indent */
/* eslint-disable linebreak-style */
/* eslint-disable import/no-unresolved */
/* eslint-disable linebreak-style */
/* eslint-disable no-unused-vars */
/* eslint-disable linebreak-style */
import React from 'react';
import { connect } from 'dva';
import PropTypes from 'prop-types';
import { Spin, Layout } from 'antd';
import HeaderComponent from '../components/header';
import style from './index.css';

const {
  Content,
} = Layout;

const IndexLayout = ({ children, history, user }) => {
  if (user.authenticated === null
    || (user.authenticated === true && user.secretAccessKey === null)) {
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
  if (history.location.pathname === '/robotface') {
    return (
      children
    );
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
