# kapace-testing

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

# PLAN
## System
1. [ ] Нужно добавить всплывашки на все REST-запросы с ошибками и на все кнопочки с всплывашкой
2. [ ] Авторизация
   1. [X] Нужна модераторская авторизация чисто для меня чтобы только я мог апрувнуть добавленную редактуру
      1. [X] Авторизация на беке 
         1. [ ] Нужно сделать апрувацию профиля, чтобы не плодили новые аккаунты
         2. [ ] Сделать восстановление пароля через почту
         3. [ ] (?) Как должна работать кнопка RememberMe на логине
         4. [ ] (?) Нада подумать про авто-продление куки на фронте
      2. [IN PROGRESS] Прикрутить авторизацию на фронт
      3. [ ] Прикрутить регистрацию на фронт
      
3. [ ] Написать тесты на бек

## План по достижению МВП
1. [X] [BUG] Скрывается хедер после перелистывания одного полного экрана
2. [X] [BUG] Не работает сортировка и выбор переводчика в TranslationsListComponent.vue
   1. [X] EpisodeView.cs
   2. [X] TheaterView.cs
3. [X] [BUG] При добавлении дорамы, строка часов и минут в графе длительность объединяются (12:30, превращаются в 1230 минут)
4. [X] [FEATURE] Добавить кнопку перелистывания эпизода под театр
5. [ ] [FEATURE] Все ошибки полученные из бека нужно транслировать в пользователя

# Ideas
1. [ ] [FEATURE] Добавить сбоку слева или справа кнопку перелистывания экрана полностью наверх
2. [ ] [FEATURE] Добавить лоадинг на страницы 
   1. [ ] Главная
   2. [ ] Поиск
   3. [ ] Список редактуры
3. [ ] [BIG | STORY] Кнопка авторизации и регистрации в хедере
4. [ ] [BUG] После двойного наведения на уведомление, ото моментально скрывается спустя пару секунд 
5. [ ] [FEATURE] Добавить поле с хедером отдельно от реквеста как тут https://stackoverflow.com/questions/41493130/web-api-how-to-add-a-header-parameter-for-all-api-in-swagger

## Content
1. [ ] Python - bot который спарсит группы в которых есть переводы множества дорам и сериалов
2. [ ] ChatGPT - api который сможет предоставить мне множество инфы о сериалах и дорамах

