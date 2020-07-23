import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import {
  Form, Input, Button, message, Modal,
} from 'antd';
import bignoob from '../assets/bignoob.jpg';

const ForgotPasswordPage = ({ dispatch, history }) => {
  const [state, setState] = useState({
    submitting: false,
    buttonState: true,
  });
  const [modalState, setModalState] = useState({
    visible: false,
  });

  const handleModal = () => {
    setModalState({ visible: false });
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
        setModalState({ visible: true });
        // history.push('/resetpassword');
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
          <Button type="primary" htmlType="submit" disabled={state.submitting}>
            Submit
          </Button>
        </Form.Item>
      </Form>
      <Modal
        title="Verification Code"
        visible={modalState.visible}
        onOk={handleModal}
        onCancel={handleModal}
      >
        <p>Please check your email for the verification code to reset your password!</p>
      </Modal>
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
