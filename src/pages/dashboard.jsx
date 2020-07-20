import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import {
  Layout, Table, Input, Button, message,
} from 'antd';
import Link from 'umi/link';

import SiderComponent from '../components/sider';

const { Footer, Content } = Layout;

const DashboardPage = ({ dispatch, history }) => {
  const [state, setState] = useState({
    submitting: false,
    collapsed: false,
  });

  const onClick = () => {
    setState({ submitting: true });
    dispatch({
      type: 'updateData/NP',
      payload: {
        organisation: 'NP',
      },
      callback: (user) => {
        console.log('Query Success');
      },
      error: (err) => {
        message.info(err.message);
        setState({ submitting: false });
      },
    });
  };

  const collapseOnClick = () => {
    console.log(state);
    setState({
      ...state,
      collapsed: !state.collapsed,
    });
  };

  const columns = [
    {
      title: 'Robot',
      dataIndex: 'robot',
      key: 'robot',
      render: (text) => (
        <Link to="/robot">
          <p>{text}</p>
        </Link>
      ),
    },
    {
      title: 'Organisation',
      dataIndex: 'organization',
      key: 'organization',
    },
    {
      title: 'Ready',
      dataIndex: 'ready',
      key: 'ready',
    },
    {
      title: 'In Use',
      dataIndex: 'inUse',
      key: 'inUse',
    },
  ];

  const data = [
    {
      key: 1,
      robot: 'Court Robot',
      organization: 'NP',
      ready: 'No',
      inUse: 'No',
    },
    {
      key: 2,
      robot: 'Scout',
      organization: 'NP',
      ready: 'No',
      inUse: 'No',
    },
    {
      key: 3,
      robot: 'Anastasia (SRTC)',
      organization: 'NP',
      ready: 'No',
      inUse: 'No',
    },
  ];

  return (
    <Layout style={{ textAlign: 'center', minHeight: '100vh' }}>
      <SiderComponent onCollapse={collapseOnClick} collapsed={state.collapsed} />
      <Layout>
        <Content style={{ margin: '0 50px' }}>
          <div style={{ marginTop: '64px' }}>
            <Button onClick={onClick} type="primary">
              QueryData Button
            </Button>
            <Table columns={columns} dataSource={data} />
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>Powered by Ngee Ann Robotics</Footer>
      </Layout>
    </Layout>
  ); // end return
}; // end DashboardPage

DashboardPage.propTypes = {
  user: PropTypes.shape({
    username: PropTypes.string,
  }),
  history: PropTypes.shape({
    push: PropTypes.func,
  }),
  dispatch: PropTypes.func,
};

DashboardPage.defaultProps = {
  user: {},
  history: {},
  dispatch: undefined,
};

export default connect(({ user, updateData }) => ({ user }))(DashboardPage);
