# Harina & Flor

Sitio de demostración para una panadería de barrio ficticia de Buenos Aires. Estilo cottagecore con acento mermelada, hecho con Astro y TypeScript.

Demo: https://laura-m-stack.github.io/harina-y-flor/

## Qué tiene

- **Qué sale hoy:** tabla semanal de horneado. Marca el día actual según la hora de Buenos Aires (no la del navegador) y el estado "abierto ahora" se actualiza solo.
- **Armá tu torta:** configurador con precio en vivo, fecha mínima de 2 días de anticipación, lunes cerrados, horarios de retiro según el día, validación con mensajes accesibles y botón para copiar el pedido.
- **Accesibilidad:** contraste AA, foco visible, navegación con teclado, `prefers-reduced-motion`, objetivos táctiles de 44 px.
- **Lógica pura y testeada:** `src/lib/horno.ts` y `src/lib/torta.ts` no dependen del DOM (39 tests).

Es una demo: no se toman pedidos reales ni se envía nada a ningún servidor.

## Desarrollo

```powershell
npm install
npm run dev      # servidor local
npm test         # tests con Vitest
npm run build    # astro check + astro build
```

## Estructura

```
src/
  data/site.ts       datos del negocio y carta
  lib/horno.ts       horarios, zona horaria, estado abierto/cerrado
  lib/torta.ts       precios, fechas y validación del encargo
  components/        secciones de la página
  styles/global.css  tokens y estilos
```

## Despliegue

GitHub Actions publica en GitHub Pages en cada push a `main`. En el repositorio: Settings > Pages > Source: GitHub Actions.
