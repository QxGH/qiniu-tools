import requestUrl from '@/request/requestUrl';
import axios from '@/request/';

const url = window.toolConfig.server.qiniu;
const qiniu = {
  getToken(data) {
    return axios.post(`${requestUrl.baseUrl}${url.token}`, data);
  },
  getBucket() {
    return axios.post(`${requestUrl.baseUrl}${url.bucket}`);
  }
}

export default qiniu;
