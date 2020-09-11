import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'dva';

import Link from 'umi/link';
import queryString from 'query-string';
import {
  Table, Button, Space, Radio, Divider, Input, Modal,
} from 'antd';
import { ImportOutlined } from '@ant-design/icons';
import style from './logPage.css';

const LogPage = ({ dispatch, history, user }) => {
  const [state, setState] = useState({
    robotName: null,
    filteredInfo: null,
    sortedInfo: null,
    visible: false,
  });

  const leaveRoom = () => {
    history.push('/dashboard');
  };

  useEffect(() => {
    if (state.robotName === null) {
      const { robotName } = history.location.query;
      if (user.robots.length > 0) {
        const selectedRobot = user.robots.find((robot) => robot.robotName === robotName);
        console.log(selectedRobot);
        setState({
          ...state,
          ...selectedRobot,
        });
      }
    }
  }, [state, user.robots, history.location.query]);

  const data = [
    {
      key: '1',
      date: 'John Brown',
      time: 32,
      desc: 'New York No. 1 Lake Park',
    },
    {
      key: '2',
      date: 'Jim Green',
      time: 42,
      desc: 'London No. 1 Lake Park',
    },
    {
      key: '3',
      date: 'Joe Black',
      time: 32,
      desc: 'Sidney No. 1 Lake Park',
    },
    {
      key: '4',
      date: 'Jim Red',
      time: 32,
      desc: 'London No. 2 Lake Park',
    },
  ];

  const handleChange = (pagination, filters, sorter) => {
    console.log('Various parameters', pagination, filters, sorter);
    setState({
      filteredInfo: filters,
      sortedInfo: sorter,
    });
  };

  const clearFilters = () => {
    setState({ filteredInfo: null });
  };

  const clearAll = () => {
    setState({
      filteredInfo: null,
      sortedInfo: null,
    });
  };

  const setAgeSort = () => {
    setState({
      sortedInfo: {
        order: 'descend',
        columnKey: 'date',
      },
    });
  };

  // rowSelection object indicates the need for row selection
  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
    },
    getCheckboxProps: (record) => ({
      date: record.date,
    }),
  };

  const [selectionType] = useState('checkbox');

  let { sortedInfo, filteredInfo } = state;
  sortedInfo = sortedInfo || {};
  filteredInfo = filteredInfo || {};

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      sorter: (a, b) => a.date - b.date,
      sortOrder: sortedInfo.columnKey === 'date' && sortedInfo.order,
      ellipsis: true,
    },
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time',
      sorter: (a, b) => a.time - b.time,
      sortOrder: sortedInfo.columnKey === 'time' && sortedInfo.order,
      ellipsis: true,
    },
    {
      title: 'Description',
      dataIndex: 'desc',
      key: 'desc',
      filters: [
        { text: 'Safe Distance Violation', value: 'Safe Distance Violation' },
        { text: 'Face Mask Violation', value: 'Face Mask Violation' },
      ],
      filteredValue: filteredInfo.desc || null,
      onFilter: (value, record) => record.desc.includes(value),
      sorter: (a, b) => a.desc.length - b.desc.length,
      sortOrder: sortedInfo.columnKey === 'desc' && sortedInfo.order,
      ellipsis: true,
    },
    {
      title: 'Action',
      dataIndex: 'robotname',
      key: 'robot',
      render: (text) => (
        <div>
          <Button type="primary" shape="round" onClick={showModal}>
            Details
          </Button>
          <Link to={`/log/?${queryString.stringify({ robotName: text })}`}>
            <Button type="primary" shape="round" className={style.delete}>
              Delete
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  const showModal = () => {
    setState({
      visible: true,
    });
  };

  const handleOk = (e) => {
    console.log(e);
    setState({
      visible: false,
    });
  };

  const handleCancel = (e) => {
    console.log(e);
    setState({
      visible: false,
    });
  };

  return (
    <div>
      <Modal
        title="Basic Modal"
        visible={state.visible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
      </Modal>
      <div>
        <Button
          onClick={leaveRoom}
          type="primary"
          className={style.return}
        >
          <span>
            <ImportOutlined />
          </span>
        </Button>
      </div>
      <div className={style.table}>
        <Space style={{ marginBottom: 16 }}>
          <Button onClick={setAgeSort}>Sort age</Button>
          <Button onClick={clearFilters}>Clear filters</Button>
          <Button onClick={clearAll}>Clear filters and sorters</Button>
        </Space>
        <Table
          rowSelection={{
            type: selectionType,
            ...rowSelection,
          }}
          columns={columns}
          dataSource={data}
          onChange={handleChange}
        />
      </div>
    </div>
  );
};

LogPage.propTypes = {
  // state: PropTypes.shape({}),
  history: PropTypes.shape({
    push: PropTypes.func,
    location: PropTypes.shape({
      query: PropTypes.shape({
        robotName: null,
      }),
    }),
  }),
  dispatch: PropTypes.func,
  user: PropTypes.shape({
    username: PropTypes.string,
    accessKeyId: PropTypes.string,
    secretAccessKey: PropTypes.string,
    sessionToken: PropTypes.string,
    jwtToken: PropTypes.string,
    robots: PropTypes.arrayOf(PropTypes.shape({})),
  }),
  device: PropTypes.shape({}),
  meeting: PropTypes.shape({
    joined: PropTypes.bool,
  }),
  messagebox: PropTypes.shape({}),
};

LogPage.defaultProps = {
  // state: {},
  history: {},
  dispatch: undefined,
  device: {},
  user: {},
  meeting: {
    joined: false,
  },
  messagebox: {},
};

export default connect(({ user, device, meeting }) => ({ user, device, meeting }))(LogPage);
