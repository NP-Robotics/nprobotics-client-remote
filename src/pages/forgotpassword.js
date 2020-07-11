import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import {
  Form, Input, Button, Checkbox, message,
} from 'antd';
import Link from 'umi/link';

const resetPassword = () => 'Hello';

export default connect(({ global }) => ({ global }))(resetPassword);
