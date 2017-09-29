# Push-Text-Server
Push Text (Chrome extension) 的服务器端程序.

### 使用方法

* 修改`config.json`:
  ```json
  {
      "db": "mongodb://localhost/push_text",
      "server_port": 3000,
      "qiniu_access_key": "<your_access_key>",
      "qiniu_secret_key": "<your_secret_key>",
      "qiniu_bucket": "<your_bucket_name>"
  }
  ```
  *其中`<your_access_key>`处填写你的七牛云对象存储的access key,*
  *`<your_secret_key>`处填写你的七牛云对象存储的secret key,*
  *`<your_bucket_name>`处填写你的七牛云对象存储的bucket名称.*
* 启动:
  ```nodejs
  node app.js
  ```
