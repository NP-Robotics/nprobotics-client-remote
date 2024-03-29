// ref: https://umijs.org/config/
export default {
  history: 'hash',
  routes: [
    {
      path: '/',
      component: '../layouts/index.jsx',
      routes: [
        {
          path: '/',
          component: '../pages/login.jsx',
        },
        {
          path: '/login',
          component: '../pages/login.jsx',
        },
        {
          path: '/signup',
          component: '../pages/signup.jsx',
        },
        {
          path: '/robot',
          component: '../pages/robotPage.jsx',
        },
        {
          path: '/forgotpassword',
          component: '../pages/forgotpassword.jsx',
        },
        {
          path: '/resetpassword',
          component: '../pages/resetpassword.jsx',
        },
        {
          path: '/dashboard',
          component: '../pages/dashboard.jsx',
        },
        {
          path: '/robotface',
          component: '../pages/robotFace.jsx',
        },
        {
          path: '/configuration',
          component: '../pages/configuration.jsx',
        },
      ]
    },

  ],
  plugins: [
    // ref: https://umijs.org/plugin/umi-plugin-react.html
    [
      'umi-plugin-react',
      {
        antd: true,
        dva: true,
        dynamicImport: { webpackChunkName: true },
        title: 'SGRobotCloud',
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
      },
    ],
  ],
};
