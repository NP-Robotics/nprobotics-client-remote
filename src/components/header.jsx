import React from 'react';
import router from 'umi/router';
import Link from 'umi/link';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import { Layout, Menu, Button } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import style from './header.css';

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
      return [
        <Menu.Item
          key="1"
          onClick={() => {
            router.push('dashboard');
          }}
        >
          Dashboard
        </Menu.Item>,
        <Menu.Item key="2">My Account</Menu.Item>,
        <Menu.Item key="3">My Organization</Menu.Item>,
        <Menu.Item key="4" onClick={onClickSignOut}>
          Sign Out
        </Menu.Item>,
      ];
    }

    return [
      <Menu.Item
        key="1"
        onClick={() => {
          router.push('/login');
        }}
      >
        Sign In
      </Menu.Item>,
      <Menu.Item
        key="2"
        onClick={() => {
          router.push('/signup');
        }}
      >
        Create Account
      </Menu.Item>,
    ];
  };
  return (
    <Header className={style.headerBar}>
      <Link to="/">
        <img src={NPLogo} className={style.logo} alt="NPLogo" />
      </Link>
      <Menu theme="dark" mode="horizontal" style={{ float: 'right', marginRight: '50px' }}>
        <SubMenu key="user" icon={<UserOutlined />} title={user.username} className={style.subMenu}>
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
