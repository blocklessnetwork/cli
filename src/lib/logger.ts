import Chalk from "chalk"

const LOGGER_LEVELS = {
  none: -1,
  error: 0,
  warn: 1,
  info: 2,
  log: 3,
  debug: 4,
} as const

type LoggerLevel = keyof typeof LOGGER_LEVELS

const LOGGER_LEVEL_FORMAT_TYPE_MAP = {
  error: "error",
  warn: "warning",
  info: undefined,
  log: undefined,
  debug: undefined,
} as const

class Logger {
  constructor() { }

  loggerLevel: LoggerLevel = "log";

  debug = (...args: unknown[]) => this.printLog("debug", args);
  info = (...args: unknown[]) => this.printLog("info", args);
  log = (...args: unknown[]) => this.printLog("log", args);
  warn = (...args: unknown[]) => this.printLog("warn", args);
  error = (...args: unknown[]) => this.printLog("error", args);

  private printLog(messageLevel: Exclude<LoggerLevel, "none">, args: unknown[]) {
    if (LOGGER_LEVELS[this.loggerLevel] >= LOGGER_LEVELS[messageLevel]) {
      console[messageLevel](this.formatMessage(messageLevel, args.join('\n')))
    }
  }

  private formatMessage(
    level: Exclude<LoggerLevel, "none">,
    message: string
  ): string {
    let log = ''
    const kind = LOGGER_LEVEL_FORMAT_TYPE_MAP[level]

    if (kind) {
      const [firstLine, ...otherLines] = message.split("\n")

      if (kind === 'error') {
        log += Chalk.red('Error: ')

        if (otherLines.length > 0 && otherLines[0] !== '') {
          log += firstLine
          log += `\n\n${Chalk.underline('Reason:')}\n`
          otherLines.map(l => log += l)
        } else {
          log += message
        }
      } else if (kind === 'warning') {
        log += Chalk.yellow('Warning: ')
        log += message
      }

    } else {
      return message
    }

    return log
  }
}

export const logger = new Logger()