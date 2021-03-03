import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Layout',
    component: () => import('../views/layout'),
    children: [
      {
        path: '/',
        redirect: '/imageUpload'
      }, {
        path: '/imageUpload',
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
  mode: 'history',
  routes
})

export default router
