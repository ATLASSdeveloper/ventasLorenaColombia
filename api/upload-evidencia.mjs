import { put } from '@vercel/blob';

const MAX_FILE_SIZE = 4 * 1024 * 1024;
const ALLOWED_CONTENT_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

function sanitizeSegment(value, fallback = 'sin-dato') {
  const cleaned = String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .toLowerCase();

  return cleaned || fallback;
}

function extensionFromContentType(contentType) {
  if (contentType === 'image/png') return 'png';
  if (contentType === 'image/webp') return 'webp';
  return 'jpg';
}

function json(data, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}

export default {
  async fetch(request) {
    if (request.method !== 'POST') {
      return json({ error: 'Método no permitido.' }, 405);
    }

    const hasReadWriteToken = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
    const hasOidc = Boolean(process.env.VERCEL_OIDC_TOKEN && process.env.BLOB_STORE_ID);

    if (!hasReadWriteToken && !hasOidc) {
      return json({ error: 'Vercel Blob no está configurado en este entorno.' }, 500);
    }

    if (!request.body) {
      return json({ error: 'No se recibió la evidencia.' }, 400);
    }

    const contentType = (request.headers.get('content-type') || '')
      .split(';')[0]
      .trim()
      .toLowerCase();

    if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
      return json({ error: 'La evidencia debe ser JPG, PNG o WEBP.' }, 415);
    }

    const contentLength = Number(request.headers.get('content-length') || 0);
    if (contentLength > MAX_FILE_SIZE) {
      return json({ error: 'La evidencia supera el límite de 4 MB.' }, 413);
    }

    const url = new URL(request.url);
    const vendedor = sanitizeSegment(url.searchParams.get('vendedor'), 'sin-vendedor');
    const cliente = sanitizeSegment(url.searchParams.get('cliente'), 'sin-cliente');
    const extension = extensionFromContentType(contentType);

    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const day = String(now.getUTCDate()).padStart(2, '0');
    const timestamp = now.toISOString().replace(/[:.]/g, '-');

    const pathname = [
      'evidencias',
      'cross-selling-cliente-propio',
      `${year}-${month}-${day}`,
      vendedor,
      `${timestamp}-${cliente}.${extension}`,
    ].join('/');

    try {
      const blob = await put(pathname, request.body, {
        access: 'public',
        addRandomSuffix: true,
        contentType,
      });

      return json({
        url: blob.url,
        pathname: blob.pathname,
      });
    } catch (error) {
      console.error('Error subiendo evidencia a Vercel Blob:', error);
      return json({ error: 'No se pudo almacenar la evidencia en Vercel Blob.' }, 500);
    }
  },
};
