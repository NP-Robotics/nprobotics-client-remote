import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import {
  Form, Input, Button, message,
} from 'antd';
import style from './resetpassword.css';

const ResetPasswordPage = ({ dispatch, history }) => {
  const [state, setState] = useState({
    submitting: false,
  });

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
        message.success('Password has successfully been reset!');
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
    <div className={style.background}>
      <h1 className={style.header}>Password Reset</h1>
      <Form
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 8 }}
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

        <Form.Item
          label="Confirm New Password"
          name="confirmNewPassword"
          dependencies={['password']}
          rules={[
            { required: true, message: 'Please input your password again!' },

            ({ getFieldValue }) => ({
              validator(rule, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(Error('The two passwords do not match!'));
              },
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 8, span: 8 }}>
          <Button type="primary" htmlType="submit" disabled={state.submitting}>
            Submit
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

ResetPasswordPage.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func,
  }),
  dispatch: PropTypes.func,
};

ResetPasswordPage.defaultProps = {
  history: {},
  dispatch: undefined,
};

export default connect(({ user }) => ({ user }))(ResetPasswordPage);
