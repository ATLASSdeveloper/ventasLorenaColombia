import { put } from '@vercel/blob';

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
      'Cache-Control': 'no-store',
    },
  });
}

/**
 * Genera un identificador formado EXCLUSIVAMENTE por números y guiones.
 *
 * Ejemplo:
 * 1788366708123-428593761-9384726151
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

    /*
     * ============================================================
     * SOLO POST
     * ============================================================
     */
    if (request.method !== 'POST') {
      return json(
        {
          error: 'Método no permitido.',
        },
        405
      );
    }

    /*
     * ============================================================
     * VALIDAR VERCEL BLOB
     * ============================================================
     */
    const hasReadWriteToken = Boolean(
      process.env.BLOB_READ_WRITE_TOKEN
    );

    const hasOidc = Boolean(
      process.env.VERCEL_OIDC_TOKEN &&
      process.env.BLOB_STORE_ID
    );

    if (!hasReadWriteToken && !hasOidc) {

      console.error(
        'No existe BLOB_READ_WRITE_TOKEN ni configuración OIDC.'
      );

      return json(
        {
          error:
            'Vercel Blob no está configurado en este entorno.',
        },
        500
      );
    }

    /*
     * ============================================================
     * VALIDAR BODY
     * ============================================================
     */
    if (!request.body) {
      return json(
        {
          error: 'No se recibió la evidencia.',
        },
        400
      );
    }

    /*
     * ============================================================
     * CONTENT TYPE
     * ============================================================
     */
    const contentType = (
      request.headers.get('content-type') || ''
    )
      .split(';')[0]
      .trim()
      .toLowerCase();

    if (!ALLOWED_CONTENT_TYPES.has(contentType)) {

      console.error(
        'Content-Type rechazado:',
        contentType
      );

      return json(
        {
          error:
            'La evidencia debe ser JPG, PNG o WEBP.',
        },
        415
      );
    }

    /*
     * ============================================================
     * VALIDAR TAMAÑO
     * ============================================================
     */
    const contentLengthHeader =
      request.headers.get('content-length');

    const contentLength =
      contentLengthHeader
        ? Number(contentLengthHeader)
        : 0;

    if (
      Number.isFinite(contentLength) &&
      contentLength > MAX_FILE_SIZE
    ) {
      return json(
        {
          error:
            'La evidencia supera el límite de 4 MB.',
        },
        413
      );
    }

    /*
     * ============================================================
     * GENERAR PATHNAME
     * ============================================================
     *
     * MUY IMPORTANTE:
     *
     * El pathname tendrá SOLAMENTE:
     *
     * - números
     * - /
     * - -
     *
     * No habrá:
     *
     * evidencias
     * virna
     * eric
     * .jpg
     * letras aleatorias de Vercel
     *
     * De esta manera Google puede hacer:
     *
     * UPPERCASE
     * lowercase
     *
     * y el pathname NO cambia.
     * ============================================================
     */

    const now = new Date();

    const year = String(
      now.getUTCFullYear()
    );

    const month = String(
      now.getUTCMonth() + 1
    ).padStart(2, '0');

    const day = String(
      now.getUTCDate()
    ).padStart(2, '0');

    const fecha = `${year}${month}${day}`;

    const identificador = generarIdNumerico();

    const pathname =
      `${fecha}/${identificador}`;

    console.log('==============================');
    console.log('SUBIENDO EVIDENCIA');
    console.log('pathname:', pathname);
    console.log('contentType:', contentType);
    console.log('contentLength:', contentLength);
    console.log('==============================');

    /*
     * ============================================================
     * SUBIR A VERCEL BLOB
     * ============================================================
     */
    try {

      const blob = await put(
        pathname,
        request.body,
        {
          access: 'public',

          /*
           * FUNDAMENTAL.
           *
           * Evita que Vercel agregue algo como:
           *
           * N08KzLTzjacHU5eB4wqSruOsRJZsvJ
           *
           * porque ese sufijo sí es sensible a mayúsculas.
           */
          addRandomSuffix: false,

          /*
           * Como no usamos ".jpg", ".png", etc.
           * enviamos explícitamente el MIME.
           */
          contentType,
        }
      );

      console.log(
        'BLOB GUARDADO CORRECTAMENTE'
      );

      console.log(
        'URL:',
        blob.url
      );

      console.log(
        'PATHNAME:',
        blob.pathname
      );

      /*
       * Esta URL es la que recibe script.js
       * y posteriormente manda a Google.
       */
      return json(
        {
          ok: true,
          url: blob.url,
          pathname: blob.pathname,
          contentType: blob.contentType || contentType,
        },
        200
      );

    } catch (error) {

      console.error(
        '================================'
      );

      console.error(
        'ERROR SUBIENDO A VERCEL BLOB'
      );

      console.error(error);

      console.error(
        '================================'
      );

      return json(
        {
          error:
            'No se pudo almacenar la evidencia en Vercel Blob.',

          /*
           * Temporalmente te dejo el detalle
           * para que si vuelve a fallar sepamos
           * EXACTAMENTE qué está pasando.
           */
          detail:
            error?.message ||
            String(error),
        },
        500
      );
    }
  },
};
