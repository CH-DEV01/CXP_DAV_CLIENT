import React from 'react';

const Unauthorized = () => {
    return (
        <div className="
            min-h-screen          /* Ocupa al menos el 100% de la altura de la pantalla */
            flex                  /* Habilita Flexbox */
            flex-col              /* Organiza los elementos en columna */
            items-center          /* Centra los elementos horizontalmente */
            justify-center        /* Centra los elementos verticalmente */
            bg-red-100            /* Fondo rojo claro */
            text-red-800          /* Texto rojo oscuro */
            p-4                   /* Padding general para todos los lados (16px) */
            sm:p-6                /* Padding un poco más grande en pantallas pequeñas (24px) */
            lg:p-8                /* Padding aún mayor en pantallas grandes (32px) */
            text-center           /* Centra el texto */
            overflow-hidden       /* Evita barras de desplazamiento si el contenido excede el tamaño */
        ">
            <h1 className="
                text-4xl              /* Tamaño de texto base para móviles (48px) */
                sm:text-5xl           /* Tamaño de texto para pantallas pequeñas (60px) */
                md:text-6xl           /* Tamaño de texto para pantallas medianas (72px) */
                font-bold             /* Negrita */
                mb-4                  /* Margen inferior */
            ">
                <span role="img" aria-label="No Entry Sign" className="mr-2 text-5xl sm:text-6xl md:text-7xl">🚫</span> {/* Icono más grande y responsivo */}
                Acceso no autorizado
            </h1>
            <p className="
                text-lg               /* Tamaño de texto base para móviles (18px) */
                sm:text-xl            /* Tamaño de texto para pantallas pequeñas (20px) */
                md:text-2xl           /* Tamaño de texto para pantallas medianas (24px) */
                mb-6                  /* Margen inferior */
                max-w-xs              /* Ancho máximo para el párrafo en móviles (320px) */
                sm:max-w-sm           /* Ancho máximo en pantallas pequeñas (384px) */
                md:max-w-md           /* Ancho máximo en pantallas medianas (448px) */
                lg:max-w-lg           /* Ancho máximo en pantallas grandes (512px) */
                px-4                  /* Padding horizontal para que el texto no toque los bordes en pantallas muy pequeñas */
            ">
                Lo sentimos, no tienes permiso para acceder a esta página.
            </p>
            <a
                href="/"
                className="
                    bg-red-600            /* Fondo del botón rojo */
                    hover:bg-red-700      /* Fondo del botón rojo más oscuro al pasar el ratón */
                    text-white            /* Texto blanco */
                    font-semibold         /* Texto seminegrita */
                    py-2                  /* Padding vertical */
                    px-6                  /* Padding horizontal */
                    rounded-lg            /* Bordes redondeados grandes */
                    shadow-md             /* Sombra */
                    transition            /* Habilita transiciones para hover */
                    duration-300          /* Duración de la transición */
                    ease-in-out           /* Función de temporización de la transición */
                    text-base             /* Tamaño de texto base para el botón */
                    sm:text-lg            /* Tamaño de texto un poco más grande en pantallas pequeñas */
                "
            >
                Volver a la página de inicio
            </a>
        </div>
    );
}

export default Unauthorized;