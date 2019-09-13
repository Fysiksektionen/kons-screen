FROM petrosagg/resin-wpe:raspberrypi3-30c7465

COPY wpe-init /wpe-init

ENV WPE_URL="http://frontend:3000"
RUN chmod +x /wpe-init

CMD [ "/wpe-init" ]
