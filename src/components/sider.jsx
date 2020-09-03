/* eslint-disable linebreak-style */
import React from 'react';
import PropTypes from 'prop-types';

import {
  Layout, Menu,
} from 'antd';
import {
  MenuOutlined,
  ClusterOutlined,
  SettingOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

const SiderComponent = ({ collapsed, onCollapse }) => (
  <Sider collapsible collapsed={collapsed} onCollapse={onCollapse}>

    <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
      <Menu.Item key="title" icon={<MenuOutlined />}>Dashboard</Menu.Item>
    </Menu>
  </Sider>
);

SiderComponent.propTypes = {
  collapsed: PropTypes.bool,
  onCollapse: PropTypes.func,
};

SiderComponent.defaultProps = {
  collapsed: false,
  onCollapse: null,
};

export default SiderComponent;
