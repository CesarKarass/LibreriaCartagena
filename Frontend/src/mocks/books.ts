import type { Book } from '../types/book';

export const mockBooks: Book[] = [
  {
    id: 'LIB001', titulo: 'Alicia en el País de las Maravillas', autor: 'Lewis Carroll',
    isbn: '978-84-376-049-2', editorial: 'Minotauro', precio: 350, precioOferta: 280,
    stock: 12, categoria: 'Ficción', genero: 'Fantasía', formato: 'Tapa blanda',
    portadaUrl: '/images/libros/ciudad-de-cristal.jpg',
  },
  {
    id: 'LIB002', titulo: 'A través del espejo y lo que Alicia encontró allí', autor: 'Lewis Carroll',
    isbn: '978-84-206-331-5', editorial: 'Alianza', precio: 320,
    stock: 12, categoria: 'Ficción', genero: 'Fantasía', formato: 'Tapa blanda',
    portadaUrl: '/images/libros/la-casa-en-el-mar-mas-azul.jpg',
  },
  {
    id: 'LIB003', titulo: 'A través del espejo y lo que Alicia encontró allí', autor: 'Lewis Carroll',
    isbn: '978-84-206-331-5', editorial: 'Alianza', precio: 320,
    stock: 12, categoria: 'Ficción', genero: 'Fantasía', formato: 'Tapa dura',
    portadaUrl: '/images/libros/la-fragata.jpg',
  },
  {
    id: 'LIB004', titulo: 'A través del espejo y lo que Alicia encontró allí', autor: 'Lewis Carroll',
    isbn: '978-84-206-331-5', editorial: 'Alianza', precio: 320,
    stock: 12, categoria: 'Ficción', genero: 'Fantasía', formato: 'Electrónico',
    portadaUrl: '/images/libros/las-esquinas-de-la-luz.jpg',
  },
  {
    id: 'LIB005', titulo: 'El Banquete del Sombrerero', autor: 'Guillermo Arriaga',
    isbn: '978-607-11-234-8', editorial: 'Planeta', precio: 400, precioOferta: 340,
    stock: 12, categoria: 'Ficción', genero: 'Novela', formato: 'Tapa blanda',
    portadaUrl: '/images/libros/leyendas-de-guanajuato.jpg',
  },
  {
    id: 'LIB006', titulo: 'El Curioso Caso de Benjamin Button', autor: 'F. Scott Fitzgerald',
    isbn: '978-84-206-555-1', editorial: 'Alfaguara', precio: 290,
    stock: 8, categoria: 'Ficción', genero: 'Realismo', formato: 'Tapa blanda',
    portadaUrl: '/images/libros/el-curioso-caso-de-benjamin-button.jpg',
  },
  {
    id: 'LIB007', titulo: 'Ciencias Naturales', autor: 'Varios',
    isbn: '978-607-11-100-2', editorial: 'SEP', precio: 180,
    stock: 25, categoria: 'Educación', genero: 'Ciencia', formato: 'Tapa blanda',
    portadaUrl: '/images/libros/ciencias-naturales.jpg',
  },
  {
    id: 'LIB008', titulo: 'Curso de Guitarra', autor: 'Varios',
    isbn: '978-84-206-200-5', editorial: 'Acana', precio: 350,
    stock: 6, categoria: 'Educación', genero: 'Música', formato: 'Tapa blanda',
    portadaUrl: '/images/libros/curso-de-guitarra.jpg',
  },
  {
    id: 'LIB009', titulo: 'Diálogos de Platón', autor: 'Platón',
    isbn: '978-84-376-049-9', editorial: 'Gredos', precio: 260,
    stock: 10, categoria: 'Filosofía', genero: 'Clásico', formato: 'Tapa dura',
    portadaUrl: '/images/libros/dialogos-platon.jpg',
  },
  {
    id: 'LIB010', titulo: 'Las Neblinas de Almagro', autor: 'Varios',
    isbn: '978-607-11-300-1', editorial: 'Almadía', precio: 240,
    stock: 7, categoria: 'Ficción', genero: 'Misterio', formato: 'Tapa blanda',
    portadaUrl: '/images/libros/las-neblinas-de-almagro.jpg',
  },
];
