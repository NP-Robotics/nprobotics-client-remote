import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import { Button } from 'antd';
import Link from 'umi/link';
import style from './index.css';
import bb8 from '../assets/bb8.jpg';
import vader from '../assets/vader.jpg';
import stormtrooper from '../assets/stormtrooper.jpg';

const IndexPage = ({ user, history }) => (
  <div className={style.main}>
    <div className={style.background}>
      <ul className={style.options}>
        <li>Fleet</li>
        <li>Technology</li>
        <li>Calling</li>
        <li>Team</li>
      </ul>
      <div className={style.header}>Ngee Ann Service Robots</div>
      <div className={style.branding}>
        Lorem ipsum dolor sit amet consectetur, adipisicing elit. Commodi nobis molestias soluta
        fugiat id adipisci omnis, quos accusamus perferendis. Aliquam cumque quis adipisci omnis in
        nisi, doloremque id cum eos!
      </div>
    </div>
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
