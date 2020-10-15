import React, { useState, useEffect } from 'react';
import PropTypes, { element } from 'prop-types';
import { connect } from 'dva';

import Link from 'umi/link';
import queryString from 'query-string';
import {
  Table, Button, Space, Radio, Divider, Input, Modal, message,
} from 'antd';
import { ImportOutlined, SearchOutlined } from '@ant-design/icons';
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
    search: null,
  });

  const leaveRoom = () => {
    history.push('/dashboard');
  };

  // component onMount
  useEffect(() => {
    /*
    - variable to check if page is mounted. If page is unmounted variable
    - is set to false.
    -
    - This is to prevent memory leaks
    */
    let isMounted = true;

    // console.log(window);

    // prevent access if query string is missing
    if (!history.location.query.robotName) {
      history.push('/dashboard');
    } else {
      const { robotName } = history.location.query;
      let selectedImage = null;
      if (user.robots.length > 0) {
        // store selected robot information in local state
        selectedImage = user.images.find((image) => image.robotName === robotName);

        setState({
          ...state,
          ...selectedImage,
        });
      }
      // list images
      dispatch({
        type: 'user/listImages',
        payload: {
          variable: 'robotName',
          data: `'${robotName}'`,
        },
        error: (err) => {
          console.log(err);
        },
      });
    }
    // cleanup when unmount
    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (pagination, filters, sorter) => {
    console.log('Various parameters', pagination, filters, sorter);
    setState({
      ...state,
      filteredInfo: filters,
      sortedInfo: sorter,
    });
  };

  // rowSelection object indicates the need for row selection
  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
      setState({
        ...state,
        selectedRowsDlt: selectedRows,
      });
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
      dataIndex: 'date',
      key: 'date',
      sorter: (a, b) => a - b,
      sortOrder: sortedInfo.columnKey === 'date' && sortedInfo.order,
      ellipsis: true,
    },
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time',
      sorter: (a, b) => a - b,
      sortOrder: sortedInfo.columnKey === 'time' && sortedInfo.order,
      ellipsis: true,
    },
    {
      title: 'Description',
      dataIndex: 'caseDescription',
      key: 'caseDescription',
      filters: [
        { text: 'Safe Distance Violation', value: 'Safe Distance Violation' },
        { text: 'Face Mask Violation', value: 'Face Mask Violation' },
      ],
      filteredValue: filteredInfo.caseDescription || null,
      onFilter: (value, record) => record.caseDescription.includes(value),
    },
    {
      title: 'Action',
      dataIndex: 'imageLink',
      key: 'imageLink',
      render: (text, index) => (
        <div>
          <Button type="primary" shape="round" onClick={() => showDetailsModal(text, index)}>
            Details
          </Button>
          <Button type="primary" shape="round" className={style.delete} onClick={() => showDeleteModal(text, index)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const data = user.images.map((obj, index) => ({ key: index, ...obj }));

  const showDetailsModal = (text, index) => {
    console.log(index);
    setState({
      ...state,
      messagebox: `${index.addDescription}`,
      visibleDetails: true,
      s3url: text,
    });
  };

  const showDeleteModal = (text, index) => {
    setState({
      ...state,
      messagebox: `${index.addDescription}`,
      visibleDelete: true,
      s3url: text,
    });
  };

  const handleSave = (e) => {
    console.log(e);
    setState({
      ...state,
      visibleDetails: false,
    });
    dispatch({
      type: 'user/writeImgDesc',
      payload: {
        imageLink: `'${state.s3url}'`,
        addDescription: `'${state.messagebox}'`,
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
      ...state,
      visibleDetails: false,
    });
  };

  const handleDelete = (e) => {
    console.log(e);
    setState({
      ...state,
      visibleDelete: false,
    });
    dispatch({
      type: 'user/deleteImageByLink',
      payload: {
        imageLink: `'${state.s3url}'`,
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
      ...state,
      visibleDelete: false,
    });
  };

  const handleDescChange = (event) => {
    setState({
      ...state,
      messagebox: event.target.value,
      visibleDetails: true,
      s3url: state.s3url,
    });
  };

  const handleDeleteMultiple = (e) => {
    let i = 0;
    console.log(e);
    console.log('Log', state.selectedRowsDlt);
    for (i = 0; i < state.selectedRowsDlt.length; i += 1) {
      console.log('Log', state.selectedRowsDlt[i].imageID);
      dispatch({
        type: 'user/deleteDBData',
        payload: {
          imageID: state.selectedRowsDlt[i].imageID,
        },
        error: (err) => {
          message.info(err.message);
          console.log(err);
        },
      });
    }
  };

  const handleSearch = () => {
    console.log(state.search);
    dispatch({
      type: 'user/searchBar',
      payload: {
        searchData: state.search,
      },
      error: (err) => {
        message.info(err.message);
        console.log(err);
      },
    });
  };

  const searchChange = (event) => {
    setState({
      ...state,
      search: event.target.value,
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
          <img src={`${state.s3url}`} alt="Case" className={style.caseImg} />
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
        title="Confirm Delete Case"
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
          <img src={`${state.s3url}`} alt="Case" className={style.caseImg} />
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
          <Input
            value={state.search}
            onChange={searchChange}
            onPressEnter={handleSearch}
            className={style.search}
            placeholder="Search"
          />
          <Button onClick={handleSearch}>
            <SearchOutlined />
            Search
          </Button>
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
