import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import {
  Form, Input, Button, Checkbox, message,
} from 'antd';
import { EyeFilled } from '@ant-design/icons';
import Link from 'umi/link';
import style from './login.css';
import NPLogo from '../assets/np_logo.png';

const LoginPage = ({ dispatch, history }) => {
  const [state, setState] = useState({
    submitting: false,
  });

  const onFinish = (values) => {
    setState({ submitting: true });
    dispatch({
      type: 'user/signIn',
      payload: {
        username: values.username,
        password: values.password,
      },
      callback: (user) => {
        console.log('Login Success');
        console.log(user);
        history.push('/dashboard');
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

  const togglePasswordVisiblity = () => {
    setPasswordShown(!passwordShown);
  };

  return (
    <div>
      <div className={style.background}>
        <div className={style.box}>
          <img src={NPLogo} alt="Ngee Ann Logo" className={style.image} />
          <div className={style.header}>Sign in to your account</div>
          <Form
            name="basic"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: 'Please input your username' }]}
            >
              <Input className={style.username} placeholder="Username" type="text" />
            </Form.Item>

            <div>
              <Form.Item
                name="password"
                rules={[{ required: true, message: 'Please input your password' }]}
              >
                <Input
                  className={style.password}
                  placeholder="Password"
                  type={passwordShown ? 'text' : 'password'}
                />
              </Form.Item>
              <EyeFilled className={style.icon} onClick={togglePasswordVisiblity} />
            </div>

            <div className={style.remember}>
              <Form.Item name="remember" valuePropName="checked">
                <Checkbox>Remember me</Checkbox>
              </Form.Item>
            </div>

            <div>
              <Form.Item>
                <Button
                  className={style.button}
                  type="primary"
                  htmlType="submit"
                  disabled={state.submitting}
                >
                  Sign in
                </Button>
              </Form.Item>
            </div>

            <Link to="/forgotpassword">
              <div className={style.forgotpassword}>Forgot Password?</div>
            </Link>
          </Form>
        </div>
      </div>
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
