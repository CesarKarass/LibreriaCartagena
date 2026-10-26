import type { Book } from '../types/book';

export const mockBooks: Book[] = [
  {
    id: 'LIB001', titulo: 'Alicia en el País de las Maravillas', autor: 'Lewis Carroll',
    isbn: '978-84-376-049-2', editorial: 'Minotauro', precio: 350, precioOferta: 280,
    stock: 12, categoria: 'Ficción', genero: 'Fantasía', formato: 'Tapa blanda',
  },
  {
    id: 'LIB002', titulo: 'A través del espejo y lo que Alicia encontró allí', autor: 'Lewis Carroll',
    isbn: '978-84-206-331-5', editorial: 'Alianza', precio: 320,
    stock: 12, categoria: 'Ficción', genero: 'Fantasía', formato: 'Tapa blanda',
  },
  {
    id: 'LIB003', titulo: 'A través del espejo y lo que Alicia encontró allí', autor: 'Lewis Carroll',
    isbn: '978-84-206-331-5', editorial: 'Alianza', precio: 320,
    stock: 12, categoria: 'Ficción', genero: 'Fantasía', formato: 'Tapa dura',
  },
  {
    id: 'LIB004', titulo: 'A través del espejo y lo que Alicia encontró allí', autor: 'Lewis Carroll',
    isbn: '978-84-206-331-5', editorial: 'Alianza', precio: 320,
    stock: 12, categoria: 'Ficción', genero: 'Fantasía', formato: 'Electrónico',
  },
  {
    id: 'LIB005', titulo: 'El Banquete del Sombrerero', autor: 'Guillermo Arriaga',
    isbn: '978-607-11-234-8', editorial: 'Planeta', precio: 400, precioOferta: 340,
    stock: 12, categoria: 'Ficción', genero: 'Novela', formato: 'Tapa blanda',
  },
];
