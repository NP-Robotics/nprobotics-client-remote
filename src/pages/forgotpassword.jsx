import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import {
  Form, Input, Button, message, Modal,
} from 'antd';
import Link from 'umi/link';
import style from './forgotpassword.css';
import NPLogo from '../assets/np_logo.png';

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
    <div className={style.background}>
      <Link to="/">
        <img src={NPLogo} alt="Ngee Ann Logo" className={style.image} />
      </Link>
      <div className={style.box}>
        <div className={style.header}>Password Recovery</div>
        <div className={style.secondheader}>
          Enter your username below and a code will be sent to your email.
        </div>
        <div>
          <Form
            initialValues={{ remember: true }}
            name="basic"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: 'Please input your username' }]}
            >
              <Input className={style.textbox} placeholder="Username" />
            </Form.Item>

            <Form.Item>
              <Button
                className={style.button}
                type="primary"
                htmlType="submit"
                disabled={state.submitting}
              >
                Email me
              </Button>
            </Form.Item>
          </Form>
          <Modal
            title="Verification Code"
            visible={modalState.visible}
            onOk={handleModal}
            onCancel={handleModal}
          >
            <p>Please check your email for the verification code</p>
          </Modal>
        </div>
      </div>
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
