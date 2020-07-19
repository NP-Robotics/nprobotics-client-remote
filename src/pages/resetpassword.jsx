import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import {
  Form, Input, Button, message,
} from 'antd';

const ResetPasswordPage = ({ dispatch, history }) => {
  const [state, setState] = useState({
    submitting: false,
  });

  const proceed = () => {
    console.log('proceed');
    history.push('/login');
  };

  const onFinish = (values) => {
    setState({ submitting: true });
    dispatch({
      type: 'user/forgotPasswordSubmit',
      payload: {
        username: values.username,
        code: values.code,
        newPassword: values.newPassword,
      },
      callback: (user) => {
        console.log('Resetting password');
        console.log(user);
        history.push('/login');
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
      <h1>Reset Password</h1>
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
          label="Verification Code"
          name="code"
          rules={[{ required: true, message: 'Please input the code sent to your email!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="New Password"
          name="newPassword"
          rules={[{ required: true, message: 'Please input your new password!' }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 8, span: 8 }}>
          <Button onClick={proceed} type="primary" htmlType="submit" disabled={state.submitting}>
            Submit
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

ResetPasswordPage.propTypes = {
  // state: PropTypes.shape({}),
  history: PropTypes.shape({
    push: PropTypes.func,
  }),
  dispatch: PropTypes.func,
};

ResetPasswordPage.defaultProps = {
  // state: {},
  history: {},
  dispatch: undefined,
};

export default connect(({ user }) => ({ user }))(ResetPasswordPage);
