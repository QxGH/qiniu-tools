// 请求
import axios from 'axios'
// import requestUrl from './requestUrl'
import { Message } from 'element-ui'

let instance = axios.create({
  timeout: 1000 * 20
});

// if(process.env.NODE_ENV == 'development') {
//   // production 代理
//   instance.defaults.baseURL = '/api/'
// };

instance.defaults.headers.post['Content-Type'] = 'application/json; charset=UTF-8';

// instance.interceptors.request.use(config => {
//   //判断baseURL
//   if (config.source === 'base') {
//     config.baseURL = requestUrl.baseUrl
//   } else if(config.source === 'qiniu') {
//     config.baseURL = requestUrl.qiniuUrl
//   } else {
//     config.baseURL = requestUrl.baseUrl
//   };
//   return config;
// }, error => {
//   return Promise.reject(error)
// })


instance.interceptors.response.use(
  // 请求成功
  res => res.status === 200 ? Promise.resolve(res) : Promise.reject(res),
  // 请求失败
  error => {
    Message.error("服务器错误！");
    return Promise.reject(error);
  }
);

export default instance;
