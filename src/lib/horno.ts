/** Horarios de la panadería y qué sale del horno cada día, en hora de Buenos Aires. */
import { PRODUCTOS, type Producto } from '../data/site';

export const ZONA = 'America/Argentina/Buenos_Aires';

/** Minutos desde las 00:00. */
export type Franja = { abre: number; cierra: number };

/** 0 = domingo … 6 = sábado. `null` = cerrado todo el día. */
export const HORARIO: Record<number, Franja | null> = {
  0: { abre: 8 * 60, cierra: 14 * 60 },
  1: null,
  2: { abre: 8 * 60, cierra: 19 * 60 },
  3: { abre: 8 * 60, cierra: 19 * 60 },
  4: { abre: 8 * 60, cierra: 19 * 60 },
  5: { abre: 8 * 60, cierra: 19 * 60 },
  6: { abre: 8 * 60, cierra: 19 * 60 },
};

export const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'] as const;

export const capitalizar = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

export function hhmm(minutos: number): string {
  const m = ((minutos % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

/** Día de la semana y minutos del día de un instante, según la hora de Buenos Aires. */
export function relojLocal(fecha: Date): { dia: number; minutos: number } {
  const partes = new Intl.DateTimeFormat('en-US', {
    timeZone: ZONA,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(fecha);
  const get = (tipo: string) => partes.find((p) => p.type === tipo)?.value ?? '';
  const dia = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
  return { dia, minutos: Number(get('hour')) * 60 + Number(get('minute')) };
}

/** Fecha de hoy (AAAA-MM-DD) en Buenos Aires, aunque el navegador esté en otra zona. */
export function hoyISO(fecha: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: ZONA, year: 'numeric', month: '2-digit', day: '2-digit' }).format(fecha);
}

const ISO = /^\d{4}-\d{2}-\d{2}$/;

/** Día de la semana de una fecha ISO, sin depender de la zona del navegador. NaN si la fecha no existe. */
export function diaDeSemana(iso: string): number {
  if (!ISO.test(iso)) return Number.NaN;
  const d = new Date(`${iso}T12:00:00Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== iso) return Number.NaN;
  return d.getUTCDay();
}

export function sumarDias(iso: string, n: number): string {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function productosDelDia(dia: number, productos: Producto[] = PRODUCTOS): Producto[] {
  return productos.filter((p) => p.dias.includes(dia));
}

export type Estado = { abierto: boolean; texto: string };

export function estadoAhora(ahora: Date = new Date()): Estado {
  const { dia, minutos } = relojLocal(ahora);
  const hoy = HORARIO[dia];
  if (hoy && minutos >= hoy.abre && minutos < hoy.cierra) {
    return { abierto: true, texto: `Abierto ahora · cierra a las ${hhmm(hoy.cierra)}` };
  }
  if (hoy && minutos < hoy.abre) {
    return { abierto: false, texto: `Cerrado · abre hoy a las ${hhmm(hoy.abre)}` };
  }
  for (let i = 1; i <= 7; i++) {
    const d = (dia + i) % 7;
    const f = HORARIO[d];
    if (f) {
      const cuando = i === 1 ? 'mañana' : `el ${DIAS[d]}`;
      return { abierto: false, texto: `Cerrado · abre ${cuando} a las ${hhmm(f.abre)}` };
    }
  }
  return { abierto: false, texto: 'Cerrado' };
}
