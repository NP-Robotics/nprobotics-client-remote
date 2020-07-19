import React from 'react';
import router from 'umi/router';

import PropTypes from 'prop-types';
import { connect } from 'dva';
import { Layout, Menu } from 'antd';

import {
  UserOutlined,
} from '@ant-design/icons';
import NPLogo from '../assets/np_logo.png';

const { Header } = Layout;
const { SubMenu } = Menu;

const HeaderComponent = ({ user, dispatch }) => {
  const onClickSignOut = () => {
    dispatch({
      type: 'user/signOut',
      callback: () => {
        router.push('/');
      },
    });
  };

  const profileItems = () => {
    if (user.authenticated) {
      return ([
        <Menu.Item key="1">My Account</Menu.Item>,
        <Menu.Item key="2">My Organization</Menu.Item>,
        <Menu.Item key="3" onClick={onClickSignOut}>Sign Out</Menu.Item>,
      ]);
    }

    return ([
      <Menu.Item key="1" onClick={() => { router.push('/login'); }}>Sign In</Menu.Item>,
      <Menu.Item key="2" onClick={() => { router.push('/signup'); }}>Create Account</Menu.Item>,
    ]);
  };
  return (
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
          {profileItems()}
        </SubMenu>
      </Menu>
    </Header>
  );
};

HeaderComponent.propTypes = {
  user: PropTypes.shape({
    username: PropTypes.string,
    authenticated: PropTypes.bool,
  }),
  dispatch: PropTypes.func,

};

HeaderComponent.defaultProps = {
  user: {
    username: '',
    authenticated: false,
  },
  dispatch: undefined,
};

export default connect(({ user }) => ({ user }))(HeaderComponent);
