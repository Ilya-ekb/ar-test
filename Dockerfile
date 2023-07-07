FROM node:18
WORKDIR /
COPY . .
RUN chmod +x ./entrypoint.sh
RUN ls -la
RUN npm cache clean --force
RUN rm -rf node_modules package-look.json
RUN yarn install
#EXPOSE 3000
#ENTRYPOINT ["./entrypoint.sh"]
