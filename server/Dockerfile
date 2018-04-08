FROM node:latest

WORKDIR /push-text

RUN apt-get update && apt-get install -y nginx

COPY . /push-text
RUN npm install && npm ls
RUN mv /push-text/node_modules /node_modules

RUN echo 'ln -s /ssl-conf/ssl.conf /etc/nginx/conf.d/ssl.conf\n/etc/init.d/nginx restart\nsed -n -e "/<your_access_key>/$QINIU_ACCESS_KEY/" -e "/<your_bucket_name>/$QINIU_BUCKET_NAME/" -e "/<your_secret_key>/$QINIU_SECRET_KEY/" -e "%\"mongodb:[^\"]*\"%$QINIU_ACCESS_KEY%"\nnode app.js' >> startup.sh
RUN chmod +x startup.sh

EXPOSE 443

CMD [ "sh","startup.sh" ]