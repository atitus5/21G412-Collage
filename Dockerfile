FROM tutum/lamp

MAINTAINER Ken Leidal version: 0.1

RUN rm -fr /app
VOLUME ["/app"]
EXPOSE 80 3306
ADD startup.sh /startup.sh
RUN chmod +x /startup.sh
CMD ["/startup.sh"]
