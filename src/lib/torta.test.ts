import { describe, expect, it } from 'vitest';
import {
  fechaCorta, fechaMaxima, fechaMinima, horariosRetiro, precio, pesos, resumen, validar, MAX_TEXTO, type Encargo,
} from './torta';

const ahora = new Date('2026-12-02T15:00:00-03:00'); // miércoles
const base: Encargo = {
  nombre: 'Laura', porciones: 12, sabor: 'chocolate', relleno: 'ganache', decoracion: 'flores',
  texto: 'Feliz cumple', fecha: '2026-12-05', hora: '10:00',
};

describe('precio', () => {
  it('multiplica porciones por (sabor + relleno) y suma la decoración', () => {
    // 12 × (5800 + 900) + 6500
    expect(precio(base)).toBe(12 * 6700 + 6500);
  });
  it('dulce de leche y decoración simple no suman extra', () => {
    expect(precio({ porciones: 8, sabor: 'vainilla', relleno: 'ddl', decoracion: 'simple' })).toBe(8 * 5200);
  });
  it('devuelve null con combinaciones inválidas', () => {
    expect(precio({ ...base, sabor: 'nada' })).toBeNull();
    expect(precio({ ...base, porciones: 10 })).toBeNull();
    expect(precio({ ...base, decoracion: '' })).toBeNull();
  });
});

describe('pesos', () => {
  it('separa los miles', () => {
    expect(pesos(86500)).toBe('$ 86.500');
    expect(pesos(999)).toBe('$ 999');
  });
});

describe('fechaMinima', () => {
  it('es hoy + 2 días', () => {
    expect(fechaMinima(ahora)).toBe('2026-12-04');
  });
  it('si cae lunes, pasa al martes', () => {
    // Viernes 4 + 2 = domingo 6 (abre). Sábado 5 + 2 = lunes 7 (cerrado) → martes 8.
    expect(fechaMinima(new Date('2026-12-04T10:00:00-03:00'))).toBe('2026-12-06');
    expect(fechaMinima(new Date('2026-12-05T18:00:00-03:00'))).toBe('2026-12-08');
  });
  it('usa el día de Buenos Aires: 22:00 del sábado ya es sábado aunque en UTC sea domingo', () => {
    expect(fechaMinima(new Date('2026-12-06T01:00:00Z'))).toBe('2026-12-08');
  });
});

describe('horariosRetiro', () => {
  it('martes a sábado: de 08:00 a 18:30', () => {
    const h = horariosRetiro('2026-12-05');
    expect(h[0]).toBe('08:00');
    expect(h.at(-1)).toBe('18:30');
    expect(h).toHaveLength(22);
  });
  it('domingo: último turno 13:30', () => {
    expect(horariosRetiro('2026-12-06').at(-1)).toBe('13:30');
  });
  it('lunes y fechas inválidas no ofrecen turnos', () => {
    expect(horariosRetiro('2026-12-07')).toEqual([]);
    expect(horariosRetiro('')).toEqual([]);
  });
});

describe('validar', () => {
  it('acepta un encargo correcto', () => {
    expect(validar(base, ahora)).toEqual({});
  });
  it('exige nombre', () => {
    expect(validar({ ...base, nombre: ' a ' }, ahora).nombre).toBeDefined();
  });
  it('rechaza valores fuera de las listas', () => {
    const e = validar({ ...base, porciones: 10, sabor: 'x', relleno: 'x', decoracion: 'x' }, ahora);
    expect(Object.keys(e).sort()).toEqual(['decoracion', 'porciones', 'relleno', 'sabor']);
  });
  it('rechaza fechas con menos de 2 días de anticipación', () => {
    const e = validar({ ...base, fecha: '2026-12-03' }, ahora);
    expect(e.fecha).toContain('anticipación');
    expect(e.fecha).toContain('viernes 4 de diciembre');
  });
  it('acepta justo la fecha mínima', () => {
    expect(validar({ ...base, fecha: '2026-12-04' }, ahora)).toEqual({});
  });
  it('rechaza los lunes', () => {
    expect(validar({ ...base, fecha: '2026-12-07' }, ahora).fecha).toContain('lunes');
  });
  it('rechaza fechas vacías o inexistentes', () => {
    expect(validar({ ...base, fecha: '' }, ahora).fecha).toBeDefined();
    expect(validar({ ...base, fecha: '2026-02-30' }, ahora).fecha).toBeDefined();
  });
  it('rechaza fechas a más de 60 días', () => {
    expect(validar({ ...base, fecha: fechaMaxima(ahora) }, ahora).fecha).toBeUndefined();
    expect(validar({ ...base, fecha: '2027-03-02' }, ahora).fecha).toContain('60');
  });
  it('rechaza horarios que no son de la lista, o fuera del horario del domingo', () => {
    expect(validar({ ...base, hora: '' }, ahora).hora).toBeDefined();
    expect(validar({ ...base, hora: '07:30' }, ahora).hora).toBeDefined();
    expect(validar({ ...base, hora: '10:15' }, ahora).hora).toBeDefined();
    expect(validar({ ...base, fecha: '2026-12-06', hora: '15:00' }, ahora).hora).toBeDefined();
  });
  it('limita el mensaje y no admite saltos de línea', () => {
    expect(validar({ ...base, texto: 'x'.repeat(MAX_TEXTO) }, ahora)).toEqual({});
    expect(validar({ ...base, texto: 'x'.repeat(MAX_TEXTO + 1) }, ahora).texto).toContain('30');
    expect(validar({ ...base, texto: 'a\nb' }, ahora).texto).toBeDefined();
  });
  it('el mensaje es opcional', () => {
    expect(validar({ ...base, texto: '' }, ahora)).toEqual({});
  });
});

describe('fechaCorta', () => {
  it('escribe día, número y mes', () => {
    expect(fechaCorta('2026-12-05')).toBe('sábado 5 de diciembre');
    expect(fechaCorta('basura')).toBe('');
  });
});

describe('resumen', () => {
  it('incluye todos los datos y el total', () => {
    const r = resumen(base);
    expect(r).toContain('Tamaño: 12 porciones');
    expect(r).toContain('Sabor: Chocolate, relleno de ganache de chocolate');
    expect(r).toContain('Mensaje en la torta: Feliz cumple');
    expect(r).toContain('Retiro: sábado 5 de diciembre a las 10:00');
    expect(r).toContain('Total estimado: $ 86.900');
  });
  it('omite la línea del mensaje si está vacío', () => {
    expect(resumen({ ...base, texto: '  ' })).not.toContain('Mensaje en la torta');
  });
});
