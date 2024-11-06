export default {
  //type: admin: internal and can be accessible only by the admin part (front-end part) of the plugin
  //type: content-api: accessible from external classical rest api, need to set access in strapi's Users & Permissions plugin
  //call: http://localhost:1337/multi-select-filter/welcome and you'll receive getWelcomeMessage()

  type: 'admin', //changed from content-api to admin
  routes: [
    {
      method: 'GET',
      path: '/welcome',
      handler: 'tagEditor.welcome',
      config: {
        policies: [],
        auth: false,
      }
    },
    {
      method: 'POST',
      path: '/all-tags',
      handler: 'tagEditor.allTags',
      config: {
        policies: [],
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/tags',
      handler: 'tagEditor.tagsByItem',
      config: {
        policies: [],
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/create',
      handler: 'tagEditor.createTag',
      config: {
        policies: [],
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/batch-create',
      handler: 'tagEditor.batchCreateTags',
      config: {
        policies: [],
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/connect-disconnect-data',
      handler: 'tagEditor.getConnectDisconnectData',
      config: {
        policies: [],
        auth: false,
      },
    },
  ]
}