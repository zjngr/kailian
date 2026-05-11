import axios  from "axios";
import {ElMessage} from "element-plus";

const request =axios.create({//创建
    baseURL: "http://localhost:9090",//请求地址
})

//request 拦截器
//可以自动请求发送前对请求做一些处理
request.interceptors.request.use(config => {
    // 如果是 FormData 上传，不覆盖 Content-Type（让浏览器自动设置 boundary）
    if (!(config.data instanceof FormData)) {
        config.headers['Content-Type'] = 'application/json;charset=UTF-8';
    }
    return config;
},error=>{
    return Promise.reject(error);
});

//response拦截器
//可以在接口响应后统一处理结果
request.interceptors.response.use(
    response => {
     let res = response.data;//拿到数据
     //兼容服务端返回的字符串数据
    if(typeof res ==='string'){//判断数据类型是否是字符串,是字符串则转成jason
        res = res ? JSON.parse(res) : res;
    }
    return res;
},
    error => {
        if (error.response.status === 404) {
            ElMessage.error("未找到请求接口")
        }else if(error.response.status === 500){
            ElMessage.error('系统异常,请查看后端控制台报错')
        }else{
            console.error(error.message);
        }
        return Promise.reject(error);
    }
)

export default request;//导出