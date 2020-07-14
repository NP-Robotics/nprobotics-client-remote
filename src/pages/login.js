import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import {
  Form, Input, Button, Checkbox, message,
} from 'antd';
import Link from 'umi/link';

const LoginPage = ({ dispatch, history }) => {
  const [state, setState] = useState({
    submitting: false,
  });

  const forgotPassword = () => {
    history.push('/resetpassword');
  };

  const onFinish = (values) => {
    setState({ submitting: true });
    dispatch({
      type: 'user/signIn',
      payload: {
        username: values.username,
        password: values.password,
      },
      callback: (user) => {
        dispatch({
          type: 'user/setState',
          payload: {
            authKey: user.Session,
          },
        });

        history.push('/');
      },
      error: (err) => {
        message.info(err.message);
        setState({ submitting: false });
      },
    });
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
          <Button type="primary" htmlType="submit" disabled={state.submitting}>
            Submit
          </Button>
        </Form.Item>
        <Link to="/forgotpassword"><p>Forgot password?</p></Link>
      </Form>
    </div>
  );
};

LoginPage.propTypes = {
  // state: PropTypes.shape({}),
  history: PropTypes.shape({
    push: PropTypes.func,
  }),
  dispatch: PropTypes.func,
};

LoginPage.defaultProps = {
  // state: {},
  history: {},
  dispatch: undefined,
};

export default connect(({ user }) => ({ user }))(LoginPage);
