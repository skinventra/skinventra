import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import * as path from 'path';
import * as fs from 'fs';

const logsDir = path.join(process.cwd(), 'logs');
const logFilePath = path.join(logsDir, 'app.log');

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

if (fs.existsSync(logFilePath)) {
  fs.unlinkSync(logFilePath);
}

// Custom timestamp function for local time
const localTimestamp = winston.format((info) => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  info.timestamp = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  return info;
});

@Module({
  imports: [
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            localTimestamp(),
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message, context }) => {
              return `[${timestamp}] ${level} ${context ? `[${context}]` : ''}: ${message}`;
            }),
          ),
        }),
        new winston.transports.File({
          filename: logFilePath,
          format: winston.format.combine(
            localTimestamp(),
            winston.format.printf(({ timestamp, level, message, context }) => {
              return `[${timestamp}] ${level.toUpperCase()} ${context ? `[${context}]` : ''}: ${message}`;
            }),
          ),
        }),
      ],
    }),
  ],
})
export class LoggerModule {}


