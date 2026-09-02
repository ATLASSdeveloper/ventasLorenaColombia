import { put } from '@vercel/blob';

const VERSION = 'BLOB-NUMERICO-V2';
const MAX_FILE_SIZE = 4 * 1024 * 1024;

const ALLOWED_CONTENT_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

function json(data, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'X-Upload-Version': VERSION,
    },
  });
}

/**
 * Identificador que contiene únicamente números y guiones.
 * Así el pathname del Blob no cambia aunque otro sistema
 * convierta accidentalmente el texto a mayúsculas/minúsculas.
 */
function generarIdNumerico() {
  const timestamp = Date.now();

  const random1 = String(
    Math.floor(Math.random() * 1000000000)
  ).padStart(9, '0');

  const random2 = String(
    Math.floor(Math.random() * 1000000000)
  ).padStart(9, '0');

  return `${timestamp}-${random1}-${random2}`;
}

export default {
  async fetch(request) {
    // Permite comprobar directamente qué versión está desplegada.
    if (request.method === 'GET') {
      return json({
        ok: true,
        version: VERSION,
        endpoint: '/api/upload-evidencia-v2',
        pathnameMode: 'solo-numeros',
      });
    }

    if (request.method !== 'POST') {
      return json({ error: 'Método no permitido.', version: VERSION }, 405);
    }

    const hasReadWriteToken = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
    const hasOidc = Boolean(
      process.env.VERCEL_OIDC_TOKEN &&
      process.env.BLOB_STORE_ID
    );

    if (!hasReadWriteToken && !hasOidc) {
      console.error(`[${VERSION}] Vercel Blob no está configurado.`);
      return json(
        {
          error: 'Vercel Blob no está configurado en este entorno.',
          version: VERSION,
        },
        500
      );
    }

    if (!request.body) {
      return json(
        { error: 'No se recibió la evidencia.', version: VERSION },
        400
      );
    }

    const contentType = (
      request.headers.get('content-type') || ''
    )
      .split(';')[0]
      .trim()
      .toLowerCase();

    if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
      return json(
        {
          error: 'La evidencia debe ser JPG, PNG o WEBP.',
          version: VERSION,
        },
        415
      );
    }

    const contentLengthHeader = request.headers.get('content-length');
    const contentLength = contentLengthHeader
      ? Number(contentLengthHeader)
      : 0;

    if (
      Number.isFinite(contentLength) &&
      contentLength > MAX_FILE_SIZE
    ) {
      return json(
        {
          error: 'La evidencia supera el límite de 4 MB.',
          version: VERSION,
        },
        413
      );
    }

    const now = new Date();
    const year = String(now.getUTCFullYear());
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const day = String(now.getUTCDate()).padStart(2, '0');

    const fecha = `${year}${month}${day}`;
    const identificador = generarIdNumerico();
    const pathname = `${fecha}/${identificador}`;

    console.log(`[${VERSION}] Subiendo evidencia`);
    console.log(`[${VERSION}] pathname: ${pathname}`);
    console.log(`[${VERSION}] contentType: ${contentType}`);

    try {
      const blob = await put(pathname, request.body, {
        access: 'public',
        addRandomSuffix: false,
        contentType,
      });

      console.log(`[${VERSION}] Blob guardado: ${blob.url}`);

      return json(
        {
          ok: true,
          version: VERSION,
          url: blob.url,
          pathname: blob.pathname,
          contentType: blob.contentType || contentType,
        },
        200
      );
    } catch (error) {
      console.error(`[${VERSION}] Error subiendo Blob:`, error);

      return json(
        {
          error: 'No se pudo almacenar la evidencia en Vercel Blob.',
          detail: error?.message || String(error),
          version: VERSION,
        },
        500
      );
    }
  },
};
