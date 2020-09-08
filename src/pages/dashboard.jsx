import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import { Layout, Table } from 'antd';
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
        <Link to={`/robot/?${queryString.stringify({ robotName: text })}`}>
          <p>{text}</p>
        </Link>
      ),
    },
    {
      title: 'Organisation',
      dataIndex: 'organisation',
      key: 'organisation',
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
  ];

  const data = user.robots.map((obj, index) => ({ key: index, ...obj }));

  return (
    <div>
      <Layout className={style.background}>
        <SiderComponent onCollapse={collapseOnClick} collapsed={state.collapsed} />
        <Layout>
          <Content className={style.table}>
            <div style={{ marginTop: '64px' }}>
              <Table columns={columns} dataSource={data} />
            </div>
          </Content>
          <Footer className={style.footer}>Powered by Ngee Ann Robotics</Footer>
        </Layout>
      </Layout>
    </div>
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
