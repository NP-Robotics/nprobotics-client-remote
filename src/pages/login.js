import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import {
  Form, Input, Button, Checkbox, message,
} from 'antd';

const LoginPage = ({ dispatch, history }) => {
  const onFinish = (values) => {
    dispatch({
      type: 'global/signIn',
      payload: {
        username: values.username,
        password: values.password,
      },
      callback: (err) => {
        console.log('TEEE');
        message.info(err.message);
      },
    });
    history.push('/');
    console.log('Success:', values);
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>login</h1>
      <Form
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 8 }}
        name="basic"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
      >
        <Form.Item
          label="Username"
          name="username"
          rules={[{ required: true, message: 'Please input your username!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: 'Please input your password!' }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 8, span: 8 }} name="remember" valuePropName="checked">
          <Checkbox>Remember me</Checkbox>
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 8, span: 8 }}>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

LoginPage.propTypes = {
  // state: PropTypes.shape({}),
  history: PropTypes.shape({
    push: PropTypes.func,
  }),
  dispatch: PropTypes.shape({}),
};

LoginPage.defaultProps = {
  // state: {},
  history: {},
  dispatch: undefined,
};

export default connect(({ global }) => ({ global }))(LoginPage);
