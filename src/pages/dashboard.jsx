import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import {
  Layout, Table,
} from 'antd';

import SiderComponent from '../components/sider';
import HeaderComponent from '../components/header';

const {
  Footer, Content,
} = Layout;

const DashboardPage = ({ history, user }) => {
  const [state, setState] = useState({
    submitting: false,
    collapsed: false,
  });

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
    },
    {
      title: 'Organization',
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
      robot: 'CourtRobot',
      organization: 'NP',
      ready: 'Yes',
      inUse: 'No',
    },
  ];

  return (
    <Layout style={{ textAlign: 'center', minHeight: '100vh' }}>
      <SiderComponent onCollapse={collapseOnClick} collapsed={state.collapsed} />
      <Layout>
        <Content style={{ margin: '0 50px' }}>

          <div style={{ marginTop: '64px' }}>
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
};

DashboardPage.defaultProps = {
  user: {},
  history: {},
};

export default connect(({ user }) => ({ user }))(DashboardPage);
