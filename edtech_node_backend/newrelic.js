'use strict';

/**
 * New Relic APM configuration for the EdTech Node.js backend.
 *
 * Secrets are read exclusively from environment variables. The license key is
 * never hardcoded and never committed to Git. The agent initializes only when
 * NEW_RELIC_LICENSE_KEY is provided, keeping local/dev environments untouched.
 */

exports.config = {
  // Application name shown in New Relic. Override via NEW_RELIC_APP_NAME.
  app_name: process.env.NEW_RELIC_APP_NAME || 'EdTech Backend',

  // License key read from environment. Never hardcode this value.
  license_key: process.env.NEW_RELIC_LICENSE_KEY || '',

  // Only enable the agent when a license key is explicitly supplied.
  agent_enabled: Boolean(process.env.NEW_RELIC_LICENSE_KEY),

  distributed_tracing: {
    enabled: true
  },

  // Transaction traces capture slow requests and slow DB queries.
  transaction_tracer: {
    enabled: true,
    threshold: 'apdex_f',
    explain_threshold: 500,
    slow_sql: {
      enabled: true,
      obfuscate: true
    }
  },

  // Error collector reports captured exceptions and unhandled errors.
  error_collector: {
    enabled: true,
    capture_events: true
  },

  // Span events for distributed tracing / external service dependencies.
  span_events: {
    enabled: true
  },

  // Do NOT capture request bodies, headers, or query parameters indiscriminately.
  capture_params: false,

  attributes: {
    include: [
      'request.method',
      'request.url',
      'request.headers.host',
      'response.status',
      'response.headers.content-type'
    ],
    exclude: [
      'request.headers.cookie',
      'request.headers.authorization',
      'request.headers.*',
      'response.headers.*'
    ]
  },

  // Keep logging minimal; errors go to the existing application logger.
  logging: {
    level: 'info',
    filepath: process.env.VERCEL ? '/tmp/newrelic_agent.log' : './logs/newrelic_agent.log',
    libpath: process.env.VERCEL ? '/tmp/newrelic_agent_lib.log' : './logs/newrelic_agent_lib.log'
  }
};
