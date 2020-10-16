import React from 'react';
import PropTypes from 'prop-types';
import router from 'umi/router';

import queryString from 'query-string';

import {
  Layout, Menu,
} from 'antd';
import {
  MenuOutlined,
  DeploymentUnitOutlined,
  UserOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;
const SiderComponent = ({ collapsed, onCollapse, history }) => {
  if (history) {
    const { robotName } = history.location.query;

    if (history.location.pathname === '/configuration/') {
      return (
        <Sider collapsible collapsed={collapsed} onCollapse={onCollapse}>
          <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
            <Menu.Item key="dashboard" icon={<MenuOutlined />} onClick={() => { router.push('/dashboard'); }}>Back to dashboard</Menu.Item>
            <Menu.Item
              key="ros"
              icon={<DeploymentUnitOutlined />}
              onClick={() => {
                router.push(
                  `/configuration/?${queryString.stringify({ robotName, configPos: 'ros' })}`,
                );
              }}
            >
              ROS config
            </Menu.Item>
            <Menu.Item
              key="user"
              icon={<UserOutlined />}
              onClick={() => {
                router.push(
                  `/configuration/?${queryString.stringify({ robotName, configPos: 'user' })}`,
                );
              }}
            >
              User access control
            </Menu.Item>

          </Menu>
        </Sider>
      );
    }
  }
  return (
    <Sider collapsible collapsed={collapsed} onCollapse={onCollapse}>

      <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
        <Menu.Item key="title" icon={<MenuOutlined />} onClick={() => { router.push('/dashboard'); }}>Dashboard</Menu.Item>
      </Menu>
    </Sider>
  );
};

SiderComponent.propTypes = {
  collapsed: PropTypes.bool,
  onCollapse: PropTypes.func,
  history: PropTypes.shape({
    push: PropTypes.func,
    location: PropTypes.shape({
      pathname: PropTypes.string,
      query: PropTypes.shape({
        robotName: PropTypes.string,
      }),
    }),
    robotName: PropTypes.string,
  }),
};

SiderComponent.defaultProps = {
  collapsed: false,
  onCollapse: null,
  history: null,
};

export default SiderComponent;
