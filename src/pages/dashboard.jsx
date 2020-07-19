import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import {
  Layout, Typography, Table, Menu,
} from 'antd';

import {
  MenuOutlined,
  ClusterOutlined,
  SettingOutlined,
  TeamOutlined,
  UserOutlined,
  DownOutlined,
} from '@ant-design/icons';
import NPLogo from '../assets/np_logo.png';
import scoutPlaceholder from '../assets/scout_placeholder.png';
import eaibotPlaceholder from '../assets/eaibot_smart_placeholder.jpg';

const { SubMenu } = Menu;
const {
  Header, Footer, Sider, Content,
} = Layout;
const { Title } = Typography;

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
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={state.collapsed} onCollapse={collapseOnClick}>

        <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
          <Menu.Item key="title" icon={<MenuOutlined />}>Dashboard</Menu.Item>
          <Menu.Item key="things" icon={<ClusterOutlined />}>Things</Menu.Item>
          <Menu.Item key="settings" icon={<SettingOutlined />}>Settings</Menu.Item>

        </Menu>
      </Sider>

      <Layout>

        <Header style={{ padding: '0px' }}>
          <img
            src={NPLogo}
            style={{
              maxHeight: '50px',
              margin: '10px 10px',
            }}
            alt="NPLogo"
          />
          <Menu theme="dark" mode="horizontal" style={{ float: 'right', marginRight: '50px' }}>
            <SubMenu key="user" icon={<UserOutlined />} title={user.username}>
              <Menu.Item key="1">My Account</Menu.Item>
              <Menu.Item key="2">My Organization</Menu.Item>
              <Menu.Item key="3">Sign Out</Menu.Item>
            </SubMenu>
          </Menu>
        </Header>

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
