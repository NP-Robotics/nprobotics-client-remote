import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import {
  Form, Input, Button, message,
} from 'antd';
import Link from 'umi/link';

import bignoob from '../assets/bignoob.jpg';

const ForgotPasswordPage = ({ dispatch, history }) => {
  const [state, setState] = useState({
    submitting: false,
  });

  const proceed = () => {
    console.log('proceed');
    history.push('/resetpassword');
  };

  const onFinish = (values) => {
    setState({ submitting: true });
    dispatch({
      type: 'user/forgotPassword',
      payload: {
        username: values.username,
      },
      callback: (user) => {
        console.log('Resetting password');
        console.log(user);
        history.push('/resetpassword');
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
      <h2>Forgot Your Password?</h2>
      <img src={bignoob} style={{ width: '20%', height: '20%' }} alt="bignoob" />
      <br />
      <p>Enter your username and we will send a verification code to your email.</p>
      <Form
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 8 }}
        initialValues={{ remember: true }}
        name="basic"
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

        <Form.Item wrapperCol={{ offset: 8, span: 8 }}>
          <Button onClick={proceed} type="primary" htmlType="submit" disabled={state.submitting}>
            Submit
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

ForgotPasswordPage.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func,
  }),
  dispatch: PropTypes.func,
};

ForgotPasswordPage.defaultProps = {
  history: {},
  dispatch: undefined,
};

export default connect(({ user }) => ({ user }))(ForgotPasswordPage);
