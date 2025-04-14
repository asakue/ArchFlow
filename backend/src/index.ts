
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import cors from 'cors';
import { config } from './config';
import './auth';
import { registerRoutes } from './routes';

const app = express();

// Настройка CORS
app.use(cors({
  origin: config.corsOrigins,
  credentials: true
}));

// Парсинг JSON
app.use(express.json());

// Настройка сессий
app.use(session({
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: config.nodeEnv === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 часа
  }
}));

// Инициализация Passport
app.use(passport.initialize());
app.use(passport.session());

// Регистрация маршрутов API
registerRoutes(app);

// Обработка ошибок
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Внутренняя ошибка сервера' });
});

// Запуск сервера
app.listen(config.port, '0.0.0.0', () => {
  console.log(`[express] serving on port ${config.port}`);
});
