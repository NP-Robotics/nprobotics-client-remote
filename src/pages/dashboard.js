import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import './dashboard.css';
import 'antd/dist/antd.css';
import {
  Layout, Typography, Avatar, Menu, Breadcrumb, Button, Space, Row, Col,
} from 'antd';
import { AiOutlineSetting } from 'react-icons/ai';
import { FaReact } from 'react-icons/fa';
import np_logo from '../assets/np_logo.png';
import scout_placeholder from '../assets/scout_placeholder.png';
import eaibot_smart_placeholder from '../assets/eaibot_smart_placeholder.jpg';

const { SubMenu } = Menu;
const {
  Header, Footer, Sider, Content,
} = Layout;
const { Title } = Typography;

const DashboardPage = ({ history, dispatch }) => {
  const [state, setState] = useState({
    submitting: false,
  });

  return (
    <Layout>
      <Header style={{ position: 'fixed', zIndex: 1, width: '100%' }}>
        <AiOutlineSetting
          style={{ float: 'right', marginTop: 13, marginRight: 15 }}
          color="white"
        />
        <Avatar style={{ float: 'right', marginTop: 15 }}>USER</Avatar>

        <Row style={{ textAlign: 'left', maxHeight: '100px' }}>
          <Col span={4}>
            <img
              src={np_logo}
              style={{
                maxHeight: '50px',
                float: 'left',
                padding: '0',
              }}
              alt="np_logo"
            />
          </Col>
          <Col span={20}>
            <Menu theme="dark" mode="horizontal">
              <Menu.Item key="1">nav 1</Menu.Item>
              <Menu.Item key="2">nav 2</Menu.Item>
              <Menu.Item key="3">nav 3</Menu.Item>
            </Menu>
          </Col>
        </Row>
      </Header>
      <Layout>
        <Sider style={{ padding: '0 20px', marginTop: 64 }}>
          <Menu theme="dark" mode="vertical">
            <Menu.Item key="1">nav 1</Menu.Item>
            <Menu.Item key="2">nav 2</Menu.Item>
            <Menu.Item key="3">nav 3</Menu.Item>
          </Menu>
          <Menu />
        </Sider>
        <Layout>
          <Content className="site-layout" style={{ padding: '0 50px', marginTop: 64 }}>
            <div style={{ marginTop: 64 }}>
              <Space>
                <widget>
                  <img
                    src={scout_placeholder}
                    style={{ height: '30%', width: '30%' }}
                    alt="scout_placeholder"
                  />
                  <button type="primary" style={{ padding: '20', alignSelf: 'left', flex: 1 }}>
                    Scout
                  </button>
                </widget>
                <widget>
                  {' '}
                  <img
                    src={eaibot_smart_placeholder}
                    style={{ height: '25%', width: '25%' }}
                    alt="eaibot_smart_placeholder"
                  />
                  <button type="primary" style={{ padding: '20', alignSelf: 'left', flex: 1 }}>
                    eaibot
                  </button>
                </widget>
              </Space>
            </div>
            <div className="site-layout-background" style={{ padding: 24, minHeight: 380 }} />
          </Content>
          <Footer style={{ textAlign: 'center' }}>Powered by Ngee Ann Robotics</Footer>
        </Layout>
      </Layout>
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
