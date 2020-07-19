import React from 'react';
import PropTypes from 'prop-types';

import { Layout, Menu } from 'antd';

import {
  UserOutlined,
} from '@ant-design/icons';
import NPLogo from '../assets/np_logo.png';

const { Header } = Layout;
const { SubMenu } = Menu;

const HeaderComponent = ({ user }) => (
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
);

HeaderComponent.propTypes = {
  user: PropTypes.shape({
    username: PropTypes.string,

  }),
};

HeaderComponent.defaultProps = {
  user: {
    username: '',
  },
};

export default HeaderComponent;
