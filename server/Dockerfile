FROM node:latest

WORKDIR /push-text

RUN apt-get update && apt-get install -y nginx

COPY . /push-text
RUN npm install && npm ls
RUN mv /push-text/node_modules /node_modules

RUN echo "ln -s /ssl-conf/ssl.conf /etc/nginx/conf.d/ssl.conf\n/etc/init.d/nginx restart\nnode app.js" >> startup.sh
RUN chmod +x startup.sh

EXPOSE 443

CMD [ "sh","startup.sh" ]