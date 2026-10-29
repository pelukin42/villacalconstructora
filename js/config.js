/* ============================================================
   DATOS DEL NEGOCIO — lo único que hay que editar para completar el sitio.
   Lo que esté en null se muestra como «Por confirmar» mientras demo sea true.
   Con demo en false, lo vacío simplemente se oculta y desaparecen las notas de propuesta.
   ============================================================ */
(function () {
  var base = (document.currentScript && document.currentScript.src || '').replace(/js\/config\.js.*$/, '');

  window.VILLACAL = {
    demo: true,

    nombre: "Remodelaciones y Constructora Villacal S.R.L.",
    corto: "Villacal",

    /* ---- Datos públicos de la página de Facebook ---- */
    ciudad: "Liberia, Guanacaste",
    facebookNombre: "Remodelaciones y Constructora Villacal",
    facebook: "https://www.facebook.com/p/Remodelaciones-y-Constructora-Villacal-SRL-100083190467857/",
    messenger: "https://m.me/100083190467857", // se usa mientras no haya número de WhatsApp

    /* ---- Pendientes de confirmar con el negocio ---- */
    telefono: null,      // ej. "8888 8888"
    telefonoIntl: null,  // ej. "+506 8888 8888"
    whatsapp: null,      // sin signos ni espacios, ej. "50688888888"
    instagramUsuario: null,
    instagram: null,
    correo: null,
    direccion: null,
    horario: null,
    zona: null,          // ej. "Liberia y todo Guanacaste"
    cedulaJuridica: null,

    /* ---- Tipos de obra ----
       foto: imagen de la tarjeta y de la órbita de la portada. */
    servicios: [
      { id: "casa", nombre: "Casa nueva", corto: "Casas nuevas", icono: "casa", foto: "img/obras/casa-blanca-piscina.jpg",
        desc: "Casas de habitación desde los cimientos hasta los acabados, pensadas para el clima de Guanacaste.",
        incluye: ["Cimientos, columnas y obra gris", "Estructura de techo y cubierta", "Instalación eléctrica y fontanería", "Acabados, pintura y entrega"] },
      { id: "remodelacion", nombre: "Remodelación", corto: "Remodelaciones", icono: "remodelacion", foto: "img/obras/remodelacion-en-proceso.jpg",
        desc: "Renovamos espacios completos: cambios de distribución, pisos, repellos, cielos y pintura.",
        incluye: ["Demoliciones controladas", "Cambio de distribución", "Pisos, repellos y cielos", "Pintura interior y exterior"] },
      { id: "cocina", nombre: "Cocinas y baños", corto: "Cocinas y baños", icono: "cocina", foto: "img/obras/cocina-isla.jpg",
        desc: "Muebles, enchapes, sobres y grifería para los espacios que más se usan en la casa.",
        incluye: ["Enchapes y porcelanato", "Muebles y sobres", "Fontanería y grifería", "Iluminación y extracción"] },
      { id: "ampliacion", nombre: "Ampliación", corto: "Ampliaciones", icono: "ampliacion", foto: "img/obras/estructura-columnas.jpg",
        desc: "Un cuarto más, un segundo nivel, una cochera o un local anexo a la casa que ya tenés.",
        incluye: ["Cuartos y segundos niveles", "Columnas, vigas y entrepisos", "Cocheras y corredores", "Unión limpia con lo existente"] },
      { id: "techos", nombre: "Techos y cielos", corto: "Techos y cielos", icono: "techos", foto: "img/obras/techo-reparacion.jpg",
        desc: "Cambio de cubierta, canoas, estructura metálica y cielos rasos para que la lluvia no sea un problema.",
        incluye: ["Cambio de láminas y estructura", "Canoas y bajantes", "Cielos de gypsum o PVC", "Impermeabilización"] },
      { id: "exterior", nombre: "Terrazas y exteriores", corto: "Terrazas y exteriores", icono: "exterior", foto: "img/obras/terraza-piscina.jpg",
        desc: "Terrazas, pérgolas, tapias, aceras y piscinas para disfrutar el sol de Guanacaste.",
        incluye: ["Terrazas y pérgolas", "Tapias y muros", "Aceras, cocheras y entradas", "Piscinas y ranchos"] }
    ],

    /* ---- Fotos de obras ----
       Hoy son FOTOS REFERENCIALES de bancos de imágenes libres (Unsplash), marcadas como «Referencial»
       en el sitio. Reemplazarlas por las fotos reales de Villacal (por ejemplo, las publicadas en Facebook):
       copiar la foto en img/obras/, cambiar la ruta y poner referencial: false y el estado real.
       foco (opcional): el punto de la foto que no debe cortarse, por ejemplo "50% 30%". */
    obras: [
      { tipo: "casa", titulo: "Casa de dos niveles con piscina", foto: "img/obras/casa-blanca-piscina.jpg", foco: "50% 60%", referencial: true },
      { tipo: "cocina", titulo: "Cocina abierta con isla", foto: "img/obras/cocina-isla.jpg", referencial: true },
      { tipo: "exterior", titulo: "Terraza techada frente a la piscina", foto: "img/obras/terraza-piscina.jpg", referencial: true },
      { tipo: "remodelacion", titulo: "Remodelación: apertura de muros", foto: "img/obras/remodelacion-en-proceso.jpg", referencial: true },
      { tipo: "casa", titulo: "Casa con jardín tropical", foto: "img/obras/casa-tropical-piscina.jpg", foco: "40% 50%", referencial: true },
      { tipo: "cocina", titulo: "Baño con ducha de vidrio", foto: "img/obras/bano-ducha-vidrio.jpg", referencial: true },
      { tipo: "ampliacion", titulo: "Columnas para segundo nivel", foto: "img/obras/estructura-columnas.jpg", foco: "50% 30%", referencial: true },
      { tipo: "remodelacion", titulo: "Sala de doble altura", foto: "img/obras/sala-escalera.jpg", referencial: true },
      { tipo: "techos", titulo: "Cambio de cubierta", foto: "img/obras/techo-reparacion.jpg", referencial: true },
      { tipo: "casa", titulo: "Fachada moderna con jardín", foto: "img/obras/casa-moderna-jardin.jpg", referencial: true },
      { tipo: "cocina", titulo: "Baño moderno en gris", foto: "img/obras/bano-moderno.jpg", referencial: true },
      { tipo: "remodelacion", titulo: "Pintura y acabados", foto: "img/obras/pintura-acabados.jpg", foco: "40% 50%", referencial: true }
    ],

    /* convierte una ruta relativa a la raíz del sitio en una ruta que funciona desde cualquier página */
    ruta: function (p) { return p ? (/^([a-z][a-z0-9+.\-]*:|\/)/i.test(p) ? p : base + p) : null; }
  };
})();
