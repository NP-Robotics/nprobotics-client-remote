import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import {
  Form, Input, Button, message,
} from 'antd';

const tailLayout = {
  wrapperCol: { offset: 8, span: 8 },
};

const SignUpPage = ({ history, dispatch }) => {
  const [state, setState] = useState({
    submitting: false,
  });
  const onFinish = (values) => {
    console.log('Success:', values);
    setState({ submitting: true });
    dispatch({
      type: 'global/signUp',
      payload: {
        username: values.username,
        password: values.password,
        email: values.email,
        name: values.name,
      },
      callback: (user) => {
        console.log('Sign Up Successful');
        console.log(user);
        history.push('/');
      },
      error: (err) => {
        message.info(err.message);
        setState({ submitting: false });
      },
    });
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>Sign Up Form</h1>
      <Form
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 8 }}
        name="basic"
        initialValues={{ remember: true }}
        onFinish={onFinish}
      >
        <Form.Item
          label="Username"
          name="username"
          rules={[{ required: true, message: 'Please input your username!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Fullname"
          name="name"
          rules={[{ required: true, message: 'Please input your full name!' }]}
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

        <Form.Item
          label="Confirm Password"
          name="confirmPassword"
          dependencies={['password']}
          rules={[{ required: true, message: 'Please input your password again!' },

            ({ getFieldValue }) => ({
              validator(rule, value) {
                if (!value || getFieldValue('password') === value) { return Promise.resolve(); }
                return Promise.reject(Error('The two passwords do not match!'));
              },
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[{ required: true, message: 'Please input your email!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          wrapperCol={{ offset: 8, span: 8 }}
        >
          <Button type="primary" htmlType="submit" disabled={state.submitting}>
            Sign Up
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

SignUpPage.propTypes = {
  // state: PropTypes.shape({}),
  history: PropTypes.shape({
    push: PropTypes.func,
  }),
  dispatch: PropTypes.func,
};

SignUpPage.defaultProps = {
  // state: {},
  history: {},
  dispatch: undefined,
};

export default connect(({ global }) => ({ global }))(SignUpPage);
