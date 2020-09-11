import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import {
  Layout, Table, Button, Radio,
} from 'antd';

import Link from 'umi/link';
import queryString from 'query-string';
import style from './dashboard.css';
import SiderComponent from '../components/sider';

const { Footer, Content } = Layout;

const DashboardPage = ({ dispatch, history, user }) => {
  const [state, setState] = useState({
    submitting: false,
    collapsed: false,
  });

  const collapseOnClick = () => {
    setState({
      ...state,
      collapsed: !state.collapsed,
    });
  };

  const columns = [
    {
      title: 'Robot',
      dataIndex: 'robotName',
      key: 'robot',
      render: (text) => (
        /* <Link to={`/robot/?${queryString.stringify({ robotName: text })}`}>
          <p className={style.robotDetails}>{text}</p>
        </Link> */
        <p className={style.robotDetails}>{text}</p>
      ),
    },
    {
      title: 'Organisation',
      dataIndex: 'organisation',
      key: 'organisation',
      render: (text) => <p>{text}</p>,
    },
    {
      title: 'Online',
      dataIndex: 'isOnline',
      key: 'online',
      render: (val) => {
        if (val) {
          return <p>Yes</p>;
        }
        return <p>No</p>;
      },
    },
    {
      title: 'In Use',
      dataIndex: 'inUse',
      key: 'inUse',
      render: (val) => {
        if (val) {
          return <p>Yes</p>;
        }
        return <p>No</p>;
      },
    },
    {
      title: 'Action',
      dataIndex: 'robotName',
      key: 'robot',
      render: (text) => (
        /* <div>
          <Link to={`/robot/?${queryString.stringify({ robotName: text })}`}>
            <Button type="primary" shape="round">
              Connect
            </Button>
          </Link>
          <Link to={`/log/?${queryString.stringify({ robotName: text })}`}>
            <Button type="primary" shape="round" className={style.log}>
              Log
            </Button>
          </Link>
        </div> */
        <Link to={`/robot/?${queryString.stringify({ robotName: text })}`}>
          <Button type="primary" shape="round">
            Connect
          </Button>
        </Link>
      ),
    },
  ];

  const data = user.robots.map((obj, index) => ({ key: index, ...obj }));

  return (
    <Layout className={style.layout}>
      <SiderComponent onCollapse={collapseOnClick} collapsed={state.collapsed} />
      <Layout>
        <Content className={style.content}>
          <div className={style.table}>
            <Table columns={columns} dataSource={data} />
          </div>
          <div className={style.footer}>Powered by Ngee Ann Robotics</div>
        </Content>
      </Layout>
    </Layout>
  ); // end return
}; // end DashboardPage

DashboardPage.propTypes = {
  user: PropTypes.shape({
    username: PropTypes.string,
    robots: PropTypes.arrayOf(PropTypes.shape({})),
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

export default connect(({ user }) => ({ user }))(DashboardPage);
