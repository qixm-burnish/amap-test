FROM nginx:1.17

ADD ./build /usr/share/nginx/html/dist
COPY ./deploy/nginx.conf /etc/nginx/

EXPOSE 80