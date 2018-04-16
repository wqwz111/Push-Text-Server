# Push-Text-Server
[Push Text](https://github.com/wqwz111/Push-Text) (Chrome extension) 的服务器端程序.

### 使用方法
#### 使用Docker环境
* 安装`Docker`[安装方法](https://docs.docker.com/install/linux/docker-ce/ubuntu/#install-using-the-convenience-script)
* 安装`Docker Compose`[安装方法](https://docs.docker.com/compose/install/#install-compose)
* 修改`server_config.env`
* 如需配置nginx将https请求反向代理给nodejs，则需要新建配置目录，并将ssl证书的`.cert`文件和`.key`文件以及nginx的代理https配置文件`ssl.conf`放入其中
* 新建配置目录的方法，在终端输入:
    ```shell
    sudo mkdir /ssl-conf
    ```
* 在终端执行:
    ```shell
    sudo docker-compose up -d
    ```
* 访问方式：
    * 如果配置了https则使用对应域名访问
    * 如果未配置https则使用默认端口`3000`进行访问
#### 手动安装环境和配置
* 安装`nodejs`和`mongodb`
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
* 访问方式：
    * 使用默认端口`3000`进行访问
