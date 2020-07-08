const dva = {
  config: {
    onError(err) {
      err.preventDefault();
      console.error(err.message);
    },
    initialState: {
      state: {
        text: 'hi umi + dva',
      },
    },
  },
};

export default dva;
