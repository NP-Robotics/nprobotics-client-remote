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

const ConfigurationPage = ({ dispatch, history, user }) => {
  useEffect(() => {
    const { robotName } = history.location.query;
    if (user.robots.length > 0) {
      // store selected robot information in local state
      let selectedRobot = user.robots.find((robot) => robot.robotName === robotName);

      selectedRobot = Object.keys(selectedRobot).map((key, index) => ({
        key: index,
        property: key,
        value: selectedRobot[key],
      }));

      setRobot(selectedRobot);
    }
  }, []);

  const [state, setState] = useState({
    submitting: false,
    collapsed: false,
  });

  const [robot, setRobot] = useState(null);

  const collapseOnClick = () => {
    setState({
      ...state,
      collapsed: !state.collapsed,
    });
  };

  const columns = [
    {
      title: 'Property',
      dataIndex: 'property',
      key: 'property',
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
      render: (value) => {
        if (typeof (value) === 'boolean') {
          if (value) {
            return <p>True</p>;
          }

          return <p>False</p>;
        }
        if (typeof (value) === 'object') {
          return <p>{JSON.stringify(value, null, 4)}</p>;
        }

        return <p>{value}</p>;
      },
    },
  ];

  return (
    <Layout className={style.layout}>
      <SiderComponent onCollapse={collapseOnClick} collapsed={state.collapsed} />
      <Layout>
        <Content className={style.content}>
          <div className={style.table}>
            <Table columns={columns} dataSource={robot} />
          </div>
          <div className={style.footer}>Powered by Ngee Ann Robotics</div>
        </Content>
      </Layout>
    </Layout>
  ); // end return
}; // end ConfigurationPage

ConfigurationPage.propTypes = {
  user: PropTypes.shape({
    username: PropTypes.string,
    robots: PropTypes.arrayOf(PropTypes.shape({})),
  }),
  history: PropTypes.shape({
    push: PropTypes.func,
    location: PropTypes.shape({
      query: PropTypes.shape({
        robotName: PropTypes.string,
      }),
    }),
  }),
  dispatch: PropTypes.func,
};

ConfigurationPage.defaultProps = {
  user: {},
  history: {},
  dispatch: undefined,
};

export default connect(({ user }) => ({ user }))(ConfigurationPage);
