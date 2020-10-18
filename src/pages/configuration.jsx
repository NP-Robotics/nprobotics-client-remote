import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import {
  Layout, Button, Form, Input, Row, Col, Divider,
} from 'antd';

import {
  PlusOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons';

import Link from 'umi/link';
import queryString from 'query-string';
import style from './dashboard.css';
import SiderComponent from '../components/sider';

const { Content } = Layout;

const RosTopicForm = ({ name }) => (
  <div style={{ textAlign: 'left' }}>
    <Divider />
    <h2>ROS Publishers</h2>
    <Form.List name={name}>
      {(fields, { add, remove }) => (
        <div>
          {fields.map((field) => {
            const {
              key, isListField, fieldKey,
            } = field;
            const fieldName = field.name;
            return (
              <Row gutter={16} key={key}>
                <Col span={11}>
                  <Form.Item
                    key={key}
                    isListField={isListField}
                    name={[fieldName, 'topic']}
                    fieldKey={[fieldKey, 'topic']}
                    rules={[{ required: true, message: 'Missing topic name' }]}
                  >
                    <Input placeholder="Topic Name" style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={11}>
                  <Form.Item
                    key={key}
                    isListField={isListField}
                    name={[fieldName, 'type']}
                    fieldKey={[fieldKey, 'type']}
                    rules={[{ required: true, message: 'Missing message type' }]}
                  >
                    <Input placeholder="Message Type" />
                  </Form.Item>
                </Col>
                <Col span={2}>

                  <MinusCircleOutlined
                    onClick={() => {
                      remove(field.name);
                    }}
                  />
                </Col>
              </Row>
            );
          })}

          <Form.Item>
            <Button
              onClick={() => {
                add();
              }}
              block
            >
              <PlusOutlined />
              {' '}
              Add item
            </Button>
          </Form.Item>
        </div>
      )}
    </Form.List>

  </div>
);

const ConfigurationPage = ({ dispatch, history, user }) => {
  const { robotName, configPos } = history.location.query;

  useEffect(() => {
    if (user.robots.length > 0) {
      // store selected robot information in local state
      const selectedRobot = user.robots.find((robot) => robot.robotName === robotName);

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

  const rosFormSubmit = (values) => {
    console.log(values);
    console.log(JSON.stringify(values));
    return null;
  };

  const rosFormValues = () => {
    if (robot != null) {
      return ({
        rosbridgeUrl: robot.rosbridgeUrl,
        ...robot.rosConfig,
      });
    }
    return null;
  };

  if (configPos === 'user' && robot != null) {
    return (
      <Layout className={style.layout}>
        <SiderComponent
          onCollapse={collapseOnClick}
          collapsed={state.collapsed}
          history={history}
        />
        <Layout>
          <Content className={style.content}>
            <div className={style.footer}>Powered by Ngee Ann Robotics</div>
          </Content>
        </Layout>
      </Layout>
    );
  }
  if (configPos === 'ros' && robot != null) {
    return (
      <Layout className={style.layout}>
        <SiderComponent
          onCollapse={collapseOnClick}
          collapsed={state.collapsed}
          history={history}
        />
        <Layout>
          <Content className={style.content}>
            <h1>ROS Configuration Page</h1>
            <Divider />
            <div style={{ margin: '0 auto', width: '70%' }}>

              <div style={{ textAlign: 'left' }}>

                <Form initialValues={rosFormValues()} onFinish={rosFormSubmit}>
                  <h2>ROSbridge URL</h2>
                  <Form.Item name="rosbridgeUrl">
                    <Input placeholder="ROSBridge URL" style={{ width: '100%' }} />
                  </Form.Item>
                  <RosTopicForm name="publishers" header="ROS Publishers" />
                  <RosTopicForm name="subscribers" header="ROS Subscribers" />
                  <RosTopicForm name="services" header="ROS Services" />
                  <div style={{ textAlign: 'center' }}>
                    <Form.Item>
                      <Button type="primary" htmlType="submit">
                        Submit
                      </Button>
                    </Form.Item>
                  </div>
                </Form>
              </div>
            </div>

          </Content>
        </Layout>
      </Layout>
    );
  }

  return (
    <Layout className={style.layout}>
      <SiderComponent onCollapse={collapseOnClick} collapsed={state.collapsed} history={history} />
      <Layout>
        <Content className={style.content} />
      </Layout>
    </Layout>
  );
};

RosTopicForm.propTypes = {
  name: PropTypes.string,
};

RosTopicForm.defaultProps = {
  name: '',
};

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
        configPos: PropTypes.string,
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
