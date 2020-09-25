import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'dva';

import Link from 'umi/link';
import queryString from 'query-string';
import {
  Table, Button, Space, Radio, Divider, Input, Modal, message,
} from 'antd';
import { ImportOutlined } from '@ant-design/icons';
import style from './logPage.css';

const fs = require('fs');

const { TextArea } = Input;

const LogPage = ({ dispatch, history, user }) => {
  const [state, setState] = useState({
    robotName: null,
    filteredInfo: null,
    sortedInfo: null,
    visibleDetails: false,
    visibleDelete: false,
    s3url: null,
    messagebox: null,
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
      dataIndex: 'Date',
      key: 'Date',
      sorter: (a, b) => a.Date - b.Date,
      sortOrder: sortedInfo.columnKey === 'Date' && sortedInfo.order,
      ellipsis: true,
    },
    {
      title: 'Time',
      dataIndex: 'LastModified',
      key: 'LastModified',
      sorter: (a, b) => a.LastModified - b.LastModified,
      sortOrder: sortedInfo.columnKey === 'LastModified' && sortedInfo.order,
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
      dataIndex: 'Key',
      key: 'Key',
      render: (text) => (
        <div>
          <Button type="primary" shape="round" onClick={() => showDetailsModal(text)}>
            Details
          </Button>
          <Button type="primary" shape="round" className={style.delete} onClick={() => showDeleteModal(text)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const data = user.images.map((obj, index) => ({ key: index, ...obj }));

  const showDetailsModal = (text) => {
    setState({
      visibleDetails: true,
      s3url: text,
    });
  };

  const showDeleteModal = (text) => {
    setState({
      visibleDelete: true,
      s3url: text,
    });
  };

  const handleSave = (e) => {
    console.log(e);
    setState({
      visibleDetails: false,
    });
    const text = state.messagebox;
    let fileName = state.s3url;
    if (fileName.includes('.jpg')) {
      fileName = fileName.replace('.jpg', 'desc.txt');
    } else if (fileName.includes('.jpeg')) {
      fileName = fileName.replace('.jpeg', 'desc.txt');
    } else if (fileName.includes('.png')) {
      fileName = fileName.replace('.png', 'desc.txt');
    }
    // var element = document.createElement("a");
    // const file = new Blob([text], { type: 'text/plain' });
    // element.href = URL.createObjectURL(file);
    // document.body.appendChild(element); // Required for this to work in FireFox
    /* dispatch({
      type: 'user/writeImgDesc',
      payload:{
        fileName: fileName,
        file: file,
      },
      error: (err) => {
        message.info(err.message);
        console.log(err);
      }
    }); */
  };

  const handleCancelDetails = (e) => {
    console.log(e);
    setState({
      visibleDetails: false,
    });
  };

  const handleDelete = (e) => {
    console.log(e);
    setState({
      visibleDelete: false,
    });
    dispatch({
      type: 'user/deleteImage',
      payload: {
        key: state.s3url,
      },
      error: (err) => {
        message.info(err.message);
        console.log(err);
      },
    });
  };

  const handleCancelDelete = (e) => {
    console.log(e);
    setState({
      visibleDelete: false,
    });
  };

  const handleDescChange = (event) => {
    setState({
      messagebox: event.target.value,
      visibleDetails: true,
      s3url: state.s3url,
    });
  };

  return (
    <div>
      <Modal
        title="Case Details"
        visible={state.visibleDetails}
        onOk={handleSave}
        onCancel={handleCancelDetails}
        width="60%"
        footer={[
          <Button key="back" onClick={handleCancelDetails}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleSave}>
            Save
          </Button>,
        ]}
      >
        <div>
          <img src={`https://nprobotics-images.s3.amazonaws.com/${state.s3url}`} alt="Case" className={style.caseImg} />
          <div className={style.caseInfo}>
            <div className={style.caseDesc}>
              <h3>Add Description To Case:</h3>
              <TextArea
                value={state.messagebox}
                onChange={handleDescChange}
                placeholder="Enter additional description to this case"
                autoSize={{ minRows: 3, maxRows: 3 }}
              />
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        title="Case Details"
        visible={state.visibleDelete}
        onOk={handleDelete}
        onCancel={handleCancelDelete}
        width="60%"
        footer={[
          <Button key="back" onClick={handleCancelDelete}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleDelete}>
            Delete
          </Button>,
        ]}
      >
        <div>
          <img src={`https://nprobotics-images.s3.amazonaws.com/${state.s3url}`} alt="Case" className={style.caseImg} />
          <div className={style.caseInfo}>
            <div className={style.caseDesc}>
              <h3>Case Description:</h3>
              <TextArea
                value={state.messagebox}
                onChange={handleDescChange}
                placeholder=""
                autoSize={{ minRows: 3, maxRows: 3 }}
              >
                {state.messagebox}
              </TextArea>
            </div>
          </div>
        </div>
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
    images: PropTypes.arrayOf(PropTypes.shape({})),
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
