import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import { Form, Input, Button } from 'antd';
import bignoob from '../assets/bignoob.jpg';

const ResetPasswordPage = ({ history }) => {
  const proceed = () => {
    console.log('proceed');
    history.push('/');
  };
  return (
    <div style={{ textAlign: 'center' }}>
      <h2>Forgot Your Password?</h2>
      <img src={bignoob} style={{ width: '20%', height: '20%' }} alt="bignoob" />
      <br />
      <p>Enter your email address and we will send instructions to reset your password.</p>
      <Form
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 8 }}
        name="basic"
        initialValues={{ remember: true }}
        // onFinish={onFinish}
        // onFinishFailed={onFinishFailed}
      >
        <Form.Item
          label="Email address"
          name="emailaddress"
          rules={[{ required: true, message: 'Please input your email address!' }]}
        >
          <Input />
        </Form.Item>
      </Form>
      <Button onClick={proceed}>Continue</Button>
    </div>
  );
};

ResetPasswordPage.propTypes = {
  global: PropTypes.shape({}),
  history: PropTypes.shape({
    push: PropTypes.func,
  }),
};

ResetPasswordPage.defaultProps = {
  global: {},
  history: {},
};

export default connect(({ global }) => ({ global }))(ResetPasswordPage);
