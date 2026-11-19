import { describe, expect, it } from 'vitest';
import { diaDeSemana, estadoAhora, hhmm, hoyISO, productosDelDia, relojLocal, sumarDias } from './horno';
import { PRODUCTOS } from '../data/site';

describe('relojLocal / hoyISO', () => {
  it('usa Buenos Aires, no UTC', () => {
    // 01:00 UTC del 3 de diciembre = 22:00 del miércoles 2 en Buenos Aires.
    const f = new Date('2026-12-03T01:00:00Z');
    expect(relojLocal(f)).toEqual({ dia: 3, minutos: 22 * 60 });
    expect(hoyISO(f)).toBe('2026-12-02');
  });
});

describe('diaDeSemana / sumarDias', () => {
  it('calcula el día sin depender de la zona', () => {
    expect(diaDeSemana('2026-12-04')).toBe(5);
    expect(diaDeSemana('2026-12-07')).toBe(1);
  });
  it('rechaza fechas inexistentes o mal formadas', () => {
    expect(Number.isNaN(diaDeSemana('2026-02-30'))).toBe(true);
    expect(Number.isNaN(diaDeSemana('2026-2-3'))).toBe(true);
    expect(Number.isNaN(diaDeSemana(''))).toBe(true);
    expect(Number.isNaN(diaDeSemana('hoy'))).toBe(true);
  });
  it('suma días cruzando mes y año', () => {
    expect(sumarDias('2026-12-30', 3)).toBe('2027-01-02');
    expect(sumarDias('2028-02-28', 1)).toBe('2028-02-29');
  });
});

describe('hhmm', () => {
  it('formatea minutos', () => {
    expect(hhmm(8 * 60)).toBe('08:00');
    expect(hhmm(19 * 60 + 30)).toBe('19:30');
  });
});

describe('estadoAhora', () => {
  it('abierto un martes a media mañana', () => {
    expect(estadoAhora(new Date('2026-12-01T10:00:00-03:00'))).toEqual({ abierto: true, texto: 'Abierto ahora · cierra a las 19:00' });
  });
  it('antes de abrir', () => {
    expect(estadoAhora(new Date('2026-12-01T07:30:00-03:00')).texto).toBe('Cerrado · abre hoy a las 08:00');
  });
  it('después de cerrar abre mañana', () => {
    expect(estadoAhora(new Date('2026-12-01T19:00:00-03:00')).texto).toBe('Cerrado · abre mañana a las 08:00');
  });
  it('domingo cierra a las 14:00 y el sábado a la noche dice lunes cerrado → abre el martes', () => {
    expect(estadoAhora(new Date('2026-12-06T13:59:00-03:00')).abierto).toBe(true);
    expect(estadoAhora(new Date('2026-12-06T14:00:00-03:00')).texto).toBe('Cerrado · abre el martes a las 08:00');
  });
  it('el lunes está cerrado todo el día', () => {
    expect(estadoAhora(new Date('2026-12-07T12:00:00-03:00')).texto).toBe('Cerrado · abre mañana a las 08:00');
  });
});

describe('productosDelDia', () => {
  it('el lunes no sale nada porque no abre', () => {
    expect(productosDelDia(1)).toEqual([]);
  });
  it('el viernes sale la focaccia, el martes no', () => {
    expect(productosDelDia(5).map((p) => p.id)).toContain('focaccia');
    expect(productosDelDia(2).map((p) => p.id)).not.toContain('focaccia');
  });
  it('todos los días de horneado son días en que abre', () => {
    for (const p of PRODUCTOS) for (const d of p.dias) expect(d).not.toBe(1);
  });
  it('cada producto sale al menos un día', () => {
    for (const p of PRODUCTOS) expect(p.dias.length).toBeGreaterThan(0);
  });
  it('los ids son únicos', () => {
    expect(new Set(PRODUCTOS.map((p) => p.id)).size).toBe(PRODUCTOS.length);
  });
});
