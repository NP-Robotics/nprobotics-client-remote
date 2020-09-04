import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import { Button } from 'antd';
import style from './index.css';
import bb8 from '../assets/bb8.jpg';
import vader from '../assets/vader.jpg';
import stormtrooper from '../assets/stormtrooper.jpg';

const IndexPage = ({ user, history }) => (
  <div>
    <section>
      <header>
        <ul>
          <li>Fleet</li>
          <li>Technology</li>
          <li>Calling</li>
          <li>Team</li>
        </ul>
      </header>
      <h1 className={style.header}>Welcome to Ngee Ann Service Robots</h1>
      <div className={style.branding}>
        Lorem ipsum dolor sit amet consectetur, adipisicing elit. Deleniti, quas.
      </div>
    </section>
  </div>
);

IndexPage.propTypes = {
  user: PropTypes.shape({}),
  history: PropTypes.shape({
    push: PropTypes.func,
  }),
};

IndexPage.defaultProps = {
  user: {},
  history: {},
};

export default connect(({ user }) => ({ user }))(IndexPage);
