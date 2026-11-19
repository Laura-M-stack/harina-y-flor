export const site = {
  nombre: 'Harina & Flor',
  isDemo: true,
  direccion: 'Calle de los Aromos 450, Buenos Aires',
  telefono: '+54 11 5555-0123',
  instagram: '@harinayflor.demo',
  repo: 'https://github.com/Laura-M-stack/harina-y-flor',
};

export type Categoria = 'panes' | 'dulces' | 'salados';

export type Producto = {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: Categoria;
  /** Días en que sale del horno. 0 = domingo … 6 = sábado. */
  dias: number[];
};

export const PRODUCTOS: Producto[] = [
  { id: 'masa-madre', nombre: 'Pan de masa madre', descripcion: 'Fermentación de 24 horas, corteza fina y miga abierta.', precio: 4800, categoria: 'panes', dias: [2, 3, 4, 5, 6] },
  { id: 'focaccia', nombre: 'Focaccia de romero', descripcion: 'Con aceite de oliva y sal gruesa. Solo fin de semana largo de horno.', precio: 5200, categoria: 'panes', dias: [5, 6] },
  { id: 'centeno', nombre: 'Pan de centeno y semillas', descripcion: 'Denso, con girasol, lino y sésamo.', precio: 5400, categoria: 'panes', dias: [3, 6] },
  { id: 'medialunas', nombre: 'Medialunas de manteca', descripcion: 'Laminadas a mano, con almíbar liviano. Se venden por unidad.', precio: 1100, categoria: 'dulces', dias: [0, 2, 3, 4, 5, 6] },
  { id: 'budin', nombre: 'Budín de limón y amapola', descripcion: 'Húmedo, con glaseado fino de limón.', precio: 4200, categoria: 'dulces', dias: [4, 5, 6, 0] },
  { id: 'pastafrola', nombre: 'Pastafrola de membrillo', descripcion: 'Masa quebradiza y dulce de membrillo casero.', precio: 4600, categoria: 'dulces', dias: [6, 0] },
  { id: 'galletas', nombre: 'Galletas de avena y pasas', descripcion: 'Bolsa de seis, con un toque de canela.', precio: 3200, categoria: 'dulces', dias: [2, 4] },
  { id: 'scones', nombre: 'Scones de queso y cebollín', descripcion: 'Para el desayuno o la merienda salada.', precio: 1800, categoria: 'salados', dias: [3, 6, 0] },
  { id: 'tarta', nombre: 'Tarta de zapallo y queso', descripcion: 'Masa de manteca, relleno cremoso. Porción individual.', precio: 3900, categoria: 'salados', dias: [4, 5, 6] },
];

export const CATEGORIAS: { id: Categoria; titulo: string }[] = [
  { id: 'panes', titulo: 'Panes' },
  { id: 'dulces', titulo: 'Dulces' },
  { id: 'salados', titulo: 'Salados' },
];
