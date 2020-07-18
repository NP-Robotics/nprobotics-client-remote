import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import {
  Layout, Typography, Avatar, Menu, Breadcrumb, Button, Space, Row, Col,
} from 'antd';
import NPLogo from '../assets/np_logo.png';
import scoutPlaceholder from '../assets/scout_placeholder.png';
import eaibotPlaceholder from '../assets/eaibot_smart_placeholder.jpg';

const { SubMenu } = Menu;
const {
  Header, Footer, Sider, Content,
} = Layout;
const { Title } = Typography;

const DashboardPage = ({ history }) => {
  const [state, setState] = useState({
    submitting: false,
  });

  return (
    <Layout>
      <Header style={{ position: 'fixed', width: '100%', padding: '0px 25px' }}>
        <Avatar style={{ float: 'right', marginTop: 15 }}>USER</Avatar>
        <img
          src={NPLogo}
          style={{
            maxHeight: '50px',
            float: 'left',
            padding: '0',
            margin: '5px 20px',
          }}
          alt="NPLogo"
        />
        {/* <Menu theme="dark" mode="horizontal">
          <Menu.Item key="1">nav 1</Menu.Item>
          <Menu.Item key="2">nav 2</Menu.Item>
          <Menu.Item key="3">nav 3</Menu.Item>
        </Menu> */}
      </Header>
      {/* <Sider style={{ padding: '0 20px', marginTop: 64 }}>
          <Menu theme="dark" mode="vertical">
            <Menu.Item key="1">nav 1</Menu.Item>
            <Menu.Item key="2">nav 2</Menu.Item>
            <Menu.Item key="3">nav 3</Menu.Item>
          </Menu>
          <Menu />
        </Sider> */}
      <Content style={{ padding: '0 50px', marginTop: 64 }}>
        <div style={{ marginTop: 64 }}>
          <Space>
            <widget>
              <img
                src={scoutPlaceholder}
                style={{ height: '30%', width: '30%' }}
                alt="scoutPlaceholder"
              />
              <Button type="primary" style={{ padding: '20', alignSelf: 'left', flex: 1 }}>
                Scout
              </Button>
            </widget>
            <widget>
              {' '}
              <img
                src={eaibotPlaceholder}
                style={{ height: '25%', width: '25%' }}
                alt="eaibotPlaceholder"
              />
              <Button type="primary" style={{ padding: '20', alignSelf: 'left', flex: 1 }}>
                eaibot
              </Button>
            </widget>
          </Space>
        </div>
        <div className="site-layout-background" style={{ padding: 24, minHeight: 380 }} />
      </Content>
      <Footer style={{ textAlign: 'center' }}>Powered by Ngee Ann Robotics</Footer>
    </Layout>
  ); // end return
}; // end DashboardPage

DashboardPage.propTypes = {
  global: PropTypes.shape({}),
  history: PropTypes.shape({
    push: PropTypes.func,
  }),
};

DashboardPage.defaultProps = {
  global: {},
  history: {},
};

export default connect(({ global }) => ({ global }))(DashboardPage);
