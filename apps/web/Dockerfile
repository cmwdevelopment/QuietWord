FROM node:22-alpine
WORKDIR /app
COPY apps/web/package.json ./package.json
RUN npm install
RUN npm install react@18.3.1 react-dom@18.3.1
COPY apps/web .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
