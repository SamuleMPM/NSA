import { ApiError, badRequest } from './validation.js';

const JSON_CONTENT_TYPE = 'application/json; charset=utf-8';

export function applyCors(req, res, origin = '*') {
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Max-Age', '86400');
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return true;
  }
  return false;
}

export function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.statusCode = status;
  res.setHeader('Content-Type', JSON_CONTENT_TYPE);
  res.setHeader('Content-Length', Buffer.byteLength(body));
  res.setHeader('Cache-Control', 'no-store');
  res.end(body);
}

export function sendNoContent(res) {
  res.statusCode = 204;
  res.end();
}

export function sendError(res, error) {
  if (error instanceof ApiError) {
    sendJson(res, error.status, {
      error: {
        code: error.code,
        message: error.message,
        ...(error.details ? { details: error.details } : {}),
      },
    });
    return;
  }
  console.error('[aerohealth-api] Error no controlado:', error);
  sendJson(res, 500, {
    error: {
      code: 'internal_error',
      message: 'Error interno del servidor.',
    },
  });
}

export async function readJsonBody(req, limitBytes = 2 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0;
    let tooLarge = false;
    const chunks = [];

    req.on('data', (chunk) => {
      if (tooLarge) return;
      size += chunk.length;
      if (size > limitBytes) {
        tooLarge = true;
        chunks.length = 0;
        reject(new ApiError(413, 'payload_too_large', `El cuerpo supera el límite de ${limitBytes} bytes.`));
        return;
      }
      chunks.push(chunk);
    });

    req.on('end', () => {
      if (!chunks.length) {
        resolve({});
        return;
      }
      const raw = Buffer.concat(chunks).toString('utf8');
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(badRequest('El cuerpo de la petición no es JSON válido.'));
      }
    });

    req.on('error', (error) => reject(error));
  });
}

export function requireArray(value, field, maxLength = 500) {
  if (!Array.isArray(value)) throw badRequest(`El campo "${field}" debe ser un arreglo.`);
  if (value.length > maxLength) {
    throw badRequest(`El campo "${field}" supera el máximo de ${maxLength} elementos.`);
  }
  return value;
}
