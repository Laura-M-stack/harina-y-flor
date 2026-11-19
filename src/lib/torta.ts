/** Encargo de tortas: precio, fecha mínima de retiro y validación. */
import { HORARIO, diaDeSemana, hhmm, hoyISO, sumarDias } from './horno';

export const PORCIONES = [8, 12, 16, 24] as const;
export const ANTICIPACION_DIAS = 2;
export const MAX_DIAS_ADELANTE = 60;
export const MAX_TEXTO = 30;
export const PASO_RETIRO = 30;

export const SABORES = [
  { id: 'vainilla', nombre: 'Vainilla', porPorcion: 5200 },
  { id: 'chocolate', nombre: 'Chocolate', porPorcion: 5800 },
  { id: 'zanahoria', nombre: 'Zanahoria y nuez', porPorcion: 5600 },
  { id: 'limon', nombre: 'Limón', porPorcion: 5400 },
] as const;

export const RELLENOS = [
  { id: 'ddl', nombre: 'Dulce de leche', porPorcion: 0 },
  { id: 'frutillas', nombre: 'Crema y frutillas', porPorcion: 700 },
  { id: 'ganache', nombre: 'Ganache de chocolate', porPorcion: 900 },
  { id: 'crema-limon', nombre: 'Crema de limón', porPorcion: 600 },
] as const;

export const DECORACIONES = [
  { id: 'simple', nombre: 'Simple, con crema', precio: 0 },
  { id: 'flores', nombre: 'Flores comestibles', precio: 6500 },
  { id: 'frutos', nombre: 'Frutos rojos', precio: 5000 },
] as const;

export type Encargo = {
  nombre: string;
  porciones: number;
  sabor: string;
  relleno: string;
  decoracion: string;
  texto: string;
  fecha: string;
  hora: string;
};

export type Errores = Partial<Record<keyof Encargo, string>>;

const buscar = <T extends { id: string }>(lista: readonly T[], id: string): T | undefined => lista.find((x) => x.id === id);

/** Precio total en pesos. Devuelve null si la combinación no es válida. */
export function precio(e: Pick<Encargo, 'porciones' | 'sabor' | 'relleno' | 'decoracion'>): number | null {
  const sabor = buscar(SABORES, e.sabor);
  const relleno = buscar(RELLENOS, e.relleno);
  const deco = buscar(DECORACIONES, e.decoracion);
  if (!sabor || !relleno || !deco || !(PORCIONES as readonly number[]).includes(e.porciones)) return null;
  return e.porciones * (sabor.porPorcion + relleno.porPorcion) + deco.precio;
}

export const pesos = (n: number): string => '$ ' + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

/** Primer día de retiro posible: hoy + 2 días, saltando los días que la panadería no abre. */
export function fechaMinima(ahora: Date = new Date()): string {
  let f = sumarDias(hoyISO(ahora), ANTICIPACION_DIAS);
  for (let i = 0; i < 7 && !HORARIO[diaDeSemana(f)]; i++) f = sumarDias(f, 1);
  return f;
}

export function fechaMaxima(ahora: Date = new Date()): string {
  return sumarDias(hoyISO(ahora), MAX_DIAS_ADELANTE);
}

/** Turnos de retiro de un día: cada 30 minutos, hasta media hora antes del cierre. */
export function horariosRetiro(iso: string): string[] {
  const franja = HORARIO[diaDeSemana(iso)];
  if (!franja) return [];
  const out: string[] = [];
  for (let m = franja.abre; m <= franja.cierra - PASO_RETIRO; m += PASO_RETIRO) out.push(hhmm(m));
  return out;
}

export function validar(e: Encargo, ahora: Date = new Date()): Errores {
  const err: Errores = {};
  if (e.nombre.trim().length < 2) err.nombre = 'Escribí tu nombre.';
  if (!(PORCIONES as readonly number[]).includes(e.porciones)) err.porciones = 'Elegí un tamaño de la lista.';
  if (!buscar(SABORES, e.sabor)) err.sabor = 'Elegí un sabor.';
  if (!buscar(RELLENOS, e.relleno)) err.relleno = 'Elegí un relleno.';
  if (!buscar(DECORACIONES, e.decoracion)) err.decoracion = 'Elegí una decoración.';
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001f\u007f]/.test(e.texto)) err.texto = 'El mensaje no puede tener saltos de línea.';
  else if (e.texto.trim().length > MAX_TEXTO) err.texto = `Máximo ${MAX_TEXTO} caracteres.`;

  const dia = diaDeSemana(e.fecha);
  if (Number.isNaN(dia)) {
    err.fecha = 'Elegí una fecha de retiro.';
  } else if (!HORARIO[dia]) {
    err.fecha = 'Los lunes no abrimos. Elegí otro día.';
  } else if (e.fecha < fechaMinima(ahora)) {
    err.fecha = `Necesitamos ${ANTICIPACION_DIAS} días de anticipación. La primera fecha posible es ${fechaCorta(fechaMinima(ahora))}.`;
  } else if (e.fecha > fechaMaxima(ahora)) {
    err.fecha = `Podés encargar hasta ${MAX_DIAS_ADELANTE} días antes.`;
  } else if (!horariosRetiro(e.fecha).includes(e.hora)) {
    err.hora = 'Elegí un horario de retiro de la lista.';
  }
  return err;
}

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const DIAS_LARGOS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

export function fechaCorta(iso: string): string {
  const dia = diaDeSemana(iso);
  if (Number.isNaN(dia)) return '';
  const [, m, d] = iso.split('-').map(Number) as [number, number, number];
  return `${DIAS_LARGOS[dia]} ${d} de ${MESES[(m ?? 1) - 1]}`;
}

/** Texto del pedido, listo para pegar en un mensaje. Solo tiene sentido si el encargo es válido. */
export function resumen(e: Encargo): string {
  const total = precio(e);
  const sabor = buscar(SABORES, e.sabor)?.nombre ?? '';
  const relleno = buscar(RELLENOS, e.relleno)?.nombre ?? '';
  const deco = buscar(DECORACIONES, e.decoracion)?.nombre ?? '';
  const lineas = [
    'Hola, quiero encargar una torta.',
    `Nombre: ${e.nombre.trim()}`,
    `Tamaño: ${e.porciones} porciones`,
    `Sabor: ${sabor}, relleno de ${relleno.toLowerCase()}`,
    `Decoración: ${deco}`,
  ];
  if (e.texto.trim()) lineas.push(`Mensaje en la torta: ${e.texto.trim()}`);
  lineas.push(`Retiro: ${fechaCorta(e.fecha)} a las ${e.hora}`);
  if (total !== null) lineas.push(`Total estimado: ${pesos(total)}`);
  return lineas.join('\n');
}
