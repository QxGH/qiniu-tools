import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter);

const routerPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(location) {
  return routerPush.call(this, location).catch(error=> error)
};

const routes = [
  {
    path: '/',
    component: () => import('../views/layout'),
    children: [
      {
        path: '/',
        name: 'ImageUpload',
        component: () => import('../views/imageUpload')
      }, {
        path: '/fileUpload',
        name: 'FileUpload',
        component: () => import('../views/fileUpload')
      }, {
        path: '/aes',
        name: 'Aes',
        component: () => import('../views/aes')
      }
    ]
  },
]

const router = new VueRouter({
  mode: 'hash',
  routes
})

export default router
