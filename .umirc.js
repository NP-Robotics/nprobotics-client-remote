
// ref: https://umijs.org/config/
export default {
  history: 'hash',
  routes: [
    {
      path: '/',
      component: '../pages/index.jsx'
    },
    {
      path: '/login',
      component: '../pages/login.jsx',
    },
    {
      path: '/signup',
      component: '../pages/signup.jsx'
    },
    {
      path: '/robot',
      component: '../pages/robotPage.jsx'
    }
  ],
  plugins: [
    // ref: https://umijs.org/plugin/umi-plugin-react.html
    ['umi-plugin-react', {
      antd: true,
      dva: true,
      dynamicImport: { webpackChunkName: true },
      title: 'nprobotics-client-remote',
      dll: false,
      routes: {
        exclude: [
          /models\//,
          /services\//,
          /model\.(t|j)sx?$/,
          /service\.(t|j)sx?$/,
          /components\//,
        ],
      },
    }],
  ],
}
