export default {
  config: {
    auth: {
      logo: '/logo.jpg'
    },
    menu: {
      logo: '/logo.jpg'
    },
    locales: [
      'hi', 'kn'
    ],
    notifications: {
      releases: false
    }
  },
  bootstrap(app: any) {
    console.log(app);
  },
};
