import React from 'react';
import jeremy from '../assets/jeremy.jpeg';

const IndexPage = () => (
  <div style={{ textAlign: 'center' }}>
    <h1>welcome to NP Robotics</h1>
    <img src={jeremy} style={{ width: '20%', height: '20%' }} alt="jeremy" />
  </div>
);

export default IndexPage;
