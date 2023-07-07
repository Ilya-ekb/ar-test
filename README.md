# [MindAR](https://github.com/hiukim/mind-ar-js) with Unity

### yarn install - устновить зависимости


необходимо сбилдить image для доставки его в ржд nexus

```shell
docker build -t live_art-front:0.1 .
```

если у себя запустить в докере

```shell
docker-compose up -d - для запуска 
docker-compose down -  для остановки 
```
* не забудьте поменять имя и тег image в docker-compose вс секции image
* если надо поменять порт на котором запушен фронт надо поменять в docker-compose в секции port 3001 изменить на нужный

Открыть локальный порт 3001 и там смотреть (http://localhost:3001/)

This project is impemented by [IlyaPolo](https://t.me/IlyaPolo).\
[MindAR](https://github.com/hiukim/mind-ar-js) integration with Unity.
