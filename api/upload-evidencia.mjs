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
 * Genera un identificador compuesto exclusivamente por números.
 *
 * Esto es intencional:
 * la URL del Blob no debe contener caracteres sensibles a
 * mayúsculas/minúsculas en el pathname.
 */
function generarIdNumerico() {
  const randomValues = new Uint32Array(2);
  crypto.getRandomValues(randomValues);

  const random1 = String(randomValues[0]).padStart(10, '0');
  const random2 = String(randomValues[1]).padStart(10, '0');

  return `${Date.now()}-${random1}${random2}`;
}

export default {
  async fetch(request) {

    /*
     * ============================================================
     * VALIDAR MÉTODO
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
     * VALIDAR CONFIGURACIÓN DE VERCEL BLOB
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
        'Vercel Blob no está configurado. ' +
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
     * VALIDAR QUE EXISTA EL ARCHIVO
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
     * VALIDAR CONTENT-TYPE
     * ============================================================
     */
    const contentType = (
      request.headers.get('content-type') || ''
    )
      .split(';')[0]
      .trim()
      .toLowerCase();

    if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
      return json(
        {
          error:
            'La evidencia debe ser una imagen JPG, PNG o WEBP.',
        },
        415
      );
    }

    /*
     * ============================================================
     * VALIDAR TAMAÑO
     * ============================================================
     */
    const contentLength = Number(
      request.headers.get('content-length') || 0
    );

    if (
      Number.isFinite(contentLength) &&
      contentLength > MAX_FILE_SIZE
    ) {
      return json(
        {
          error:
            'La evidencia supera el límite máximo permitido de 4 MB.',
        },
        413
      );
    }

    /*
     * ============================================================
     * GENERAR PATHNAME SEGURO
     * ============================================================
     *
     * MUY IMPORTANTE:
     *
     * NO usamos:
     *
     *   evidencias/
     *   cross-selling-cliente-propio/
     *   virna/
     *   eric/
     *   cliente/
     *   .jpg
     *
     * porque cualquier conversión a mayúsculas/minúsculas
     * realizada posteriormente podría romper la URL.
     *
     * El pathname generado contiene SOLAMENTE:
     *
     *   números
     *   /
     *   -
     *
     * Ejemplo:
     *
     *   20260902/1788366708123-12345678909876543210
     *
     * Por tanto:
     *
     *   toUpperCase()
     *   toLowerCase()
     *
     * no pueden modificarlo.
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

    const pathname = [
      fecha,
      identificador,
    ].join('/');

    /*
     * ============================================================
     * SUBIR A VERCEL BLOB
     * ============================================================
     */
    try {

      console.log(
        'Subiendo evidencia a Vercel Blob:',
        {
          pathname,
          contentType,
          contentLength,
        }
      );

      const blob = await put(
        pathname,
        request.body,
        {
          access: 'public',

          /*
           * MUY IMPORTANTE.
           *
           * Vercel por defecto puede agregar un sufijo aleatorio
           * alfanumérico que contiene mayúsculas y minúsculas.
           *
           * Lo desactivamos porque queremos que el pathname sea
           * completamente inmune a conversiones de casing.
           */
          addRandomSuffix: false,

          /*
           * Aunque el pathname no tenga ".jpg", ".png", etc.,
           * Vercel responderá con el MIME correcto.
           *
           * Ej:
           * Content-Type: image/jpeg
           */
          contentType,
        }
      );

      console.log(
        'Evidencia almacenada correctamente:',
        blob.url
      );

      /*
       * IMPORTANTE:
       *
       * El frontend debe enviar EXACTAMENTE blob.url
       * a Google Apps Script.
       */
      return json({
        ok: true,
        url: blob.url,
        pathname: blob.pathname,
        contentType,
      });

    } catch (error) {

      console.error(
        'Error subiendo evidencia a Vercel Blob:',
        error
      );

      return json(
        {
          error:
            'No se pudo almacenar la evidencia en Vercel Blob.',
        },
        500
      );
    }
  },
};
