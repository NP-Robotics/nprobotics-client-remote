import React, { useState, useEffect } from 'react';
import PropTypes, { element } from 'prop-types';
import { connect } from 'dva';

import Link from 'umi/link';
import queryString from 'query-string';
import {
  Table, Button, Space, Radio, Divider, Input, Modal, message,
} from 'antd';
import { ImportOutlined } from '@ant-design/icons';
import style from './logPage.css';

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
    selectedRowsDlt: [],
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

  // rowSelection object indicates the need for row selection
  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
      setState({
        selectedRowsDlt: selectedRows,
      });
      console.log('Log', state.selectedRowsDlt);
    },
    getCheckboxProps: (record) => ({
      Date: record.Date,
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
      sorter: (a, b) => {
        const aDate = JSON.stringify(a.Date);
        let ayear = aDate.slice(6, 10);
        let amonth = aDate.slice(4, 5);
        let aday = aDate.slice(1, 3);
        ayear = parseInt(ayear, 10);
        amonth = parseInt(amonth, 10);
        aday = parseInt(aday, 10);

        const bDate = JSON.stringify(b.Date);
        let byear = bDate.slice(6, 10);
        let bmonth = bDate.slice(4, 5);
        let bday = bDate.slice(1, 3);
        byear = parseInt(byear, 10);
        bmonth = parseInt(bmonth, 10);
        bday = parseInt(bday, 10);

        if ((ayear - byear) === 0) {
          if ((amonth - bmonth === 0)) {
            return aday - bday;
          }

          return amonth - bmonth;
        }

        return ayear - byear;
      },
      sortOrder: sortedInfo.columnKey === 'Date' && sortedInfo.order,
      ellipsis: true,
    },
    {
      title: 'Time',
      dataIndex: 'LastModified',
      key: 'LastModified',
      sorter: (a, b) => {
        const aLM = JSON.stringify(a.LastModified);
        console.log(a);
        let ahr = aLM.slice(1, 3);
        let amin = aLM.slice(3, 5);
        const aday = aLM.slice(6, 8);
        if (ahr.includes(':')) {
          ahr = aLM.slice(1, 2);
        }
        ahr = parseInt(ahr, 10);
        amin = parseInt(amin, 10);
        console.log(ahr);
        console.log(amin);
        console.log(aday);

        const bLM = JSON.stringify(b.LastModified);
        console.log(b);
        let bhr = bLM.slice(1, 3);
        let bmin = bLM.slice(3, 5);
        const bday = bLM.slice(6, 8);
        if (bhr.includes(':')) {
          bhr = bLM.slice(1, 2);
        }
        bhr = parseInt(bhr, 10);
        bmin = parseInt(bmin, 10);

        if ((ahr - bhr) === 0) {
          return amin - bmin;
        }

        return ahr - bhr;
      },
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
    // const fileelement = document.createElement('a');
    // const file = new Blob([text], { type: 'text/plain' });
    // fileelement.href = URL.createObjectURL(file);
    // fileelement.download();
    // document.body.appendChild(fileelement); // Required for this to work in FireFox
    // fileelement.click();
    dispatch({
      type: 'user/writeImgDesc',
      payload: {
        fileName,
        // file,
      },
      error: (err) => {
        message.info(err.message);
        console.log(err);
      },
    });
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

  const handleDeleteMultiple = (e) => {
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
          <Button onClick={handleDeleteMultiple}>Search</Button>
          <Button onClick={handleDeleteMultiple}>Delete Multiple</Button>
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
