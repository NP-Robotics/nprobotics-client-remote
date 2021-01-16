import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import {
  Form, Input, Button, message,
} from 'antd';
import { EyeFilled } from '@ant-design/icons';
import Link from 'umi/link';
import NPLogo from '../assets/np_logo.png';
import style from './signup.css';

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
      type: 'user/signUp',
      payload: {
        username: values.username,
        password: values.password,
        email: values.email,
        name: values.name,
        organisation: values.organisation,
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

  const [passwordShown, setPasswordShown] = useState(false);

  const [confirmPasswordShown, setConfirmPasswordShown] = useState(false);

  const togglePasswordVisiblity = () => {
    setPasswordShown(!passwordShown);
  };

  const toggleConfirmPasswordVisiblity = () => {
    setConfirmPasswordShown(!confirmPasswordShown);
  };

  return (
    <div className={style.main}>

      <div className={style.box}>
        <h1 className={style.header}>Sign Up </h1>

        <Form name="basic" initialValues={{ remember: true }} onFinish={onFinish}>
          <div className={style.text}>Username</div>
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please input your username' }]}
          >
            <Input className={style.textbox} />
          </Form.Item>

          <div className={style.text}>Full name</div>
          <Form.Item
            name="name"
            rules={[{ required: true, message: 'Please input your full name' }]}
          >
            <Input className={style.textbox} />
          </Form.Item>

          <div className={style.text}>Password</div>
          <div>
            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Please input your password' }]}
            >
              <Input className={style.textbox} type={passwordShown ? 'text' : 'password'} />
            </Form.Item>
            <EyeFilled className={style.icon} onClick={togglePasswordVisiblity} />
          </div>

          <div className={style.text}>Confirm Password</div>
          <div>
            <Form.Item
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Please input your password again' },

                ({ getFieldValue }) => ({
                  validator(rule, value) {
                    if (!value || getFieldValue('password') === value) {
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

          <div className={style.text}>Email</div>
          <Form.Item name="email" rules={[{ required: true, message: 'Please input your email' }]}>
            <Input className={style.textbox} />
          </Form.Item>

          <div className={style.text}>Organisation</div>
          <Form.Item name="organisation" rules={[{ required: true, message: 'Please input your organisation' }]}>
            <Input className={style.textbox} />
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 8, span: 8 }}>
            <Button
              className={style.button}
              type="primary"
              htmlType="submit"
              disabled={state.submitting}
            >
              Create an account
            </Button>
          </Form.Item>
        </Form>
      </div>
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

export default connect(({ user }) => ({ user }))(SignUpPage);
