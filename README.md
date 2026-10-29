# Villacal · Remodelaciones y Constructora

Sitio web de **Remodelaciones y Constructora Villacal S.R.L.** (Liberia, Guanacaste), con la misma estructura que [idesaconstructora.netlify.app](https://idesaconstructora.netlify.app): portada con órbita de servicios, carrusel 3D de obras, tipos de obra con vista rápida, proceso animado por etapas, galería con filtros, solicitud de presupuesto en 4 pasos que arma el mensaje de WhatsApp, chat flotante y preguntas frecuentes.

Es un sitio estático (HTML, CSS y JavaScript, sin compilar). Se publica tal cual en Netlify, GitHub Pages o cualquier hosting.

## Estructura

```
index.html          página completa
css/styles.css      diseño (paleta y tipografía arriba del archivo)
js/config.js        DATOS DEL NEGOCIO: lo único que hay que editar
js/app.js           comportamiento (órbita, carrusel, solicitud, visor…)
img/marca*.svg      logo provisional (marca «V» con techo)
img/obras/          fotos
favicon.svg
netlify.toml
```

## Pendiente de completar con Villacal

La página de Facebook exige iniciar sesión, así que estos datos no se pudieron tomar de ahí. Todo se completa en `js/config.js`:

| Dato | Campo | Hoy |
| --- | --- | --- |
| Número de WhatsApp | `whatsapp` (ej. `"50688888888"`) | Sin número: los botones abren **Messenger** de la página de Facebook y copian el mensaje |
| Teléfono | `telefono`, `telefonoIntl` | «Por confirmar» |
| Correo, dirección, horario | `correo`, `direccion`, `horario` | «Por confirmar» |
| Instagram | `instagram`, `instagramUsuario` | Oculto |
| Cédula jurídica | `cedulaJuridica` | Aviso en el pie |
| **Fotos reales de obras** | `obras` | Fotos referenciales (ver abajo) |
| **Logo oficial** | `img/marca.svg`, `img/marca-blanco.svg`, `favicon.svg` | Logo provisional |
| Colores de marca | variables `:root` al inicio de `css/styles.css` | Azul petróleo + ámbar/naranja |

Cuando todo esté confirmado, poner `demo: false` en `js/config.js`: desaparecen las notas de «propuesta» y lo que siga vacío se oculta.

## Fotos

Las fotos actuales son **referenciales**, de bancos de imágenes libres ([Unsplash](https://unsplash.com/license), uso comercial permitido sin atribución). En el sitio llevan la etiqueta «Referencial» para no presentarlas como obras de Villacal.

Para usar las fotos reales (por ejemplo, las publicadas en Facebook):

1. Descargar las fotos originales (no capturas de pantalla) y guardarlas en `img/obras/` con nombres sin espacios, por ejemplo `cocina-liberia.jpg`. Lo ideal: 1400 px de ancho y menos de 300 KB.
2. En `js/config.js`, dentro de `obras`, cambiar `foto`, `titulo` y `tipo`, y poner `referencial: false`. Opcional: `estado: "Terminada"` o `"En proceso"`, y `foco: "50% 30%"` si hay una parte de la foto que no debe recortarse.
3. Para la foto de cada tipo de obra (tarjetas y órbita de la portada), cambiar `foto` dentro de `servicios`.

## Logo

El logo es provisional: un techo sobre una «V» en degradado ámbar-naranja. Para usar el logo oficial, reemplazar `img/marca.svg` (fondo claro), `img/marca-blanco.svg` (fondo oscuro) y `favicon.svg`. Si el logo viene en PNG, guardarlo en `img/` y cambiar las rutas `img/marca-blanco.svg` en `index.html`.

## Ver el sitio en la computadora

```
python3 -m http.server 8000
```

y abrir http://localhost:8000

## Publicar en Netlify

Arrastrar la carpeta del proyecto a https://app.netlify.com/drop, o conectar este repositorio en Netlify (no necesita comando de compilación; `netlify.toml` ya indica publicar la raíz).
