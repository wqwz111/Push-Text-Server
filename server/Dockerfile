FROM node:latest

WORKDIR /push-text

RUN apt-get update && apt-get install -y nginx

COPY . /push-text
RUN npm install && npm ls
RUN mv /push-text/node_modules /node_modules

RUN echo 'ln -s /ssl-conf/ssl.conf /etc/nginx/conf.d/ssl.conf\n/etc/init.d/nginx restart\nsed -in -e "s/<your_access_key>/$QINIU_ACCESS_KEY/" -e "s/<your_bucket_name>/$QINIU_BUCKET_NAME/" -e "s/<your_secret_key>/$QINIU_SECRET_KEY/" -e "s%\"mongodb:[^\"]*\"%\"$DATABASE_URL\"%"\nmkdir /var/log/node\nnode app.js > /var/log/node/app.log 2> /var/log/node/app_err.log' >> startup.sh
RUN chmod +x startup.sh

EXPOSE 443

CMD [ "sh","startup.sh" ]