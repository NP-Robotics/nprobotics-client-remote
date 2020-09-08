import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import {
  Form, Input, Button, message,
} from 'antd';
import Link from 'umi/link';
import { EyeFilled } from '@ant-design/icons';
import style from './resetpassword.css';
import NPLogo from '../assets/np_logo.png';

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
        message.success('Password has successfully been reset');
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

  const [passwordShown, setPasswordShown] = useState(false);
  const [confirmPasswordShown, setConfirmPasswordShown] = useState(false);

  const togglePasswordVisiblity = () => {
    setPasswordShown(!passwordShown);
  };

  const toggleConfirmPasswordVisiblity = () => {
    setConfirmPasswordShown(!confirmPasswordShown);
  };

  return (
    <div className={style.background}>
      <Link to="/">
        <img src={NPLogo} alt="Ngee Ann Logo" className={style.image} />
      </Link>
      <div className={style.box}>
        <h1 className={style.header}>Password Reset</h1>

        <Form name="basic" onFinish={onFinish} onFinishFailed={onFinishFailed}>
          <div className={style.text}>Username</div>
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please input your username' }]}
          >
            <Input className={style.textbox} />
          </Form.Item>

          <div className={style.text}>Verification code</div>
          <Form.Item
            name="code"
            rules={[{ required: true, message: 'Please input the code sent to your email' }]}
          >
            <Input className={style.textbox} />
          </Form.Item>

          <div className={style.text}>New password</div>
          <div>
            <Form.Item
              name="newPassword"
              rules={[{ required: true, message: 'Please input your new password' }]}
            >
              <Input className={style.textbox} type={passwordShown ? 'text' : 'password'} />
            </Form.Item>
            <EyeFilled className={style.icon} onClick={togglePasswordVisiblity} />
          </div>

          <div className={style.text}>Confirm new password</div>
          <div>
            <Form.Item
              name="confirmNewPassword"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Please input your password again' },

                ({ getFieldValue }) => ({
                  validator(rule, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(Error('The two passwords do not match'));
                  },
                }),
              ]}
            >
              <Input className={style.textbox} type={confirmPasswordShown ? 'text' : 'password'} />
            </Form.Item>
            <EyeFilled className={style.icon} onClick={toggleConfirmPasswordVisiblity} />
          </div>

          <Form.Item>
            <Button
              className={style.button}
              type="primary"
              htmlType="submit"
              disabled={state.submitting}
            >
              Submit
            </Button>
          </Form.Item>
        </Form>
      </div>
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
