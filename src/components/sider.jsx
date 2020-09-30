import React from 'react';
import PropTypes from 'prop-types';
import router from 'umi/router';

import {
  Layout, Menu,
} from 'antd';
import {
  MenuOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

const SiderComponent = ({ collapsed, onCollapse }) => (
  <Sider collapsible collapsed={collapsed} onCollapse={onCollapse}>

    <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
      <Menu.Item key="title" icon={<MenuOutlined />} onClick={() => { router.push('/dashboard'); }}>Dashboard</Menu.Item>
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
