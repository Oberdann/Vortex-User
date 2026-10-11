import { Params } from 'nestjs-pino';

export const loggerConfig: Params = {
  pinoHttp: {
    level: 'info',
    autoLogging: true,
    redact: {
      paths: [
        'password',
        '*.password',
        'passwordHash',
        '*.passwordHash',
        'email',
        '*.email',
        'req.body.password',
        'req.body.passwordHash',
        'req.body.email',
        'res.body.password',
        'res.body.passwordHash',
        'res.body.email',
      ],
      censor: '[REDACTED]',
    },

    base: {
      service: 'users-service',
    },

    serializers: {
      req: (req) => ({
        id: req.id,
        method: req.method,
        url: req.url?.replace(
          /(\/users\/by-email\/)[^/?]+/i,
          '$1[REDACTED]',
        ),
      }),
      res: (res) => ({
        statusCode: res.statusCode,
      }),
    },

    customLogLevel: (req, res, err) => {
      if (req.url?.includes('/metrics')) return 'silent';

      if (res.statusCode >= 500 || err) return 'error';

      if (res.statusCode >= 400) return 'warn';

      return 'info';
    },

    customProps: () => {
      return {};
    },
  },
};
