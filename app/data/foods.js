// Base de datos de alimentos con información nutricional por 100g
export const FOOD_CATEGORIES = [
  { id: 'proteins', label: 'Proteínas', icon: '🥩' },
  { id: 'carbs', label: 'Carbohidratos', icon: '🍚' },
  { id: 'fats', label: 'Grasas saludables', icon: '🥑' },
  { id: 'vegetables', label: 'Verduras', icon: '🥦' },
  { id: 'fruits', label: 'Frutas', icon: '🍎' },
  { id: 'dairy', label: 'Lácteos', icon: '🥛' },
  { id: 'grains', label: 'Cereales y legumbres', icon: '🌾' },
  { id: 'snacks', label: 'Snacks', icon: '🥜' },
  { id: 'prepared', label: 'Comidas preparadas', icon: '🍽️' },
]

// per 100g
export const FOODS_DB = [
  // Proteínas
  { id: 1, name: 'Pechuga de pollo', category: 'proteins', cal: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0 },
  { id: 2, name: 'Pechuga de pavo', category: 'proteins', cal: 135, protein: 30, carbs: 0, fat: 1.5, fiber: 0 },
  { id: 3, name: 'Ternera magra', category: 'proteins', cal: 150, protein: 26, carbs: 0, fat: 5, fiber: 0 },
  { id: 4, name: 'Salmón', category: 'proteins', cal: 208, protein: 20, carbs: 0, fat: 13, fiber: 0 },
  { id: 5, name: 'Atún fresco', category: 'proteins', cal: 130, protein: 29, carbs: 0, fat: 1, fiber: 0 },
  { id: 6, name: 'Merluza', category: 'proteins', cal: 89, protein: 17, carbs: 0, fat: 2, fiber: 0 },
  { id: 7, name: 'Gambas', category: 'proteins', cal: 99, protein: 24, carbs: 0.2, fat: 0.3, fiber: 0 },
  { id: 8, name: 'Huevo entero', category: 'proteins', cal: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0 },
  { id: 9, name: 'Clara de huevo', category: 'proteins', cal: 52, protein: 11, carbs: 0.7, fat: 0.2, fiber: 0 },
  { id: 10, name: 'Lomo de cerdo', category: 'proteins', cal: 143, protein: 27, carbs: 0, fat: 3.5, fiber: 0 },
  { id: 11, name: 'Tofu firme', category: 'proteins', cal: 144, protein: 17, carbs: 3, fat: 8, fiber: 2 },
  { id: 12, name: 'Atún en lata (natural)', category: 'proteins', cal: 116, protein: 26, carbs: 0, fat: 1, fiber: 0 },
  { id: 13, name: 'Seitan', category: 'proteins', cal: 370, protein: 75, carbs: 14, fat: 2, fiber: 0.6 },
  { id: 14, name: 'Bacalao', category: 'proteins', cal: 82, protein: 18, carbs: 0, fat: 0.7, fiber: 0 },
  { id: 15, name: 'Pollo muslo (sin piel)', category: 'proteins', cal: 177, protein: 25, carbs: 0, fat: 8, fiber: 0 },
  { id: 16, name: 'Sardinas en lata', category: 'proteins', cal: 208, protein: 25, carbs: 0, fat: 11, fiber: 0 },
  { id: 17, name: 'Pulpo', category: 'proteins', cal: 82, protein: 15, carbs: 2, fat: 1, fiber: 0 },
  { id: 18, name: 'Pechuga de pollo empanada', category: 'proteins', cal: 220, protein: 22, carbs: 12, fat: 10, fiber: 0.5 },
  { id: 19, name: 'Jamón serrano', category: 'proteins', cal: 241, protein: 31, carbs: 0, fat: 13, fiber: 0 },
  { id: 220, name: 'Salmón ahumado', category: 'proteins', cal: 117, protein: 18, carbs: 0, fat: 4.3, fiber: 0 },
  { id: 221, name: 'Jamón york/cocido', category: 'proteins', cal: 107, protein: 18, carbs: 1.5, fat: 3.5, fiber: 0 },
  { id: 222, name: 'Pavo (fiambre)', category: 'proteins', cal: 104, protein: 17, carbs: 1.5, fat: 3, fiber: 0 },
  { id: 223, name: 'Caballa', category: 'proteins', cal: 205, protein: 19, carbs: 0, fat: 14, fiber: 0 },
  { id: 224, name: 'Mejillones', category: 'proteins', cal: 86, protein: 12, carbs: 3.7, fat: 2.2, fiber: 0 },
  { id: 225, name: 'Solomillo de ternera', category: 'proteins', cal: 158, protein: 21, carbs: 0, fat: 8, fiber: 0 },
  { id: 226, name: 'Chorizo', category: 'proteins', cal: 455, protein: 24, carbs: 2, fat: 38, fiber: 0 },
  { id: 227, name: 'Bonito del norte (lata)', category: 'proteins', cal: 128, protein: 23, carbs: 0, fat: 4, fiber: 0 },

  // Carbohidratos
  { id: 20, name: 'Arroz blanco (cocido)', category: 'carbs', cal: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4 },
  { id: 21, name: 'Arroz integral (cocido)', category: 'carbs', cal: 123, protein: 2.7, carbs: 26, fat: 1, fiber: 1.8 },
  { id: 22, name: 'Pasta (cocida)', category: 'carbs', cal: 131, protein: 5, carbs: 25, fat: 1.1, fiber: 1.8 },
  { id: 23, name: 'Pan integral', category: 'carbs', cal: 247, protein: 13, carbs: 41, fat: 3.4, fiber: 7 },
  { id: 24, name: 'Pan blanco', category: 'carbs', cal: 265, protein: 9, carbs: 49, fat: 3.2, fiber: 2.7 },
  { id: 25, name: 'Patata (cocida)', category: 'carbs', cal: 87, protein: 1.9, carbs: 20, fat: 0.1, fiber: 1.8 },
  { id: 26, name: 'Boniato (cocido)', category: 'carbs', cal: 90, protein: 2, carbs: 21, fat: 0.1, fiber: 3.3 },
  { id: 27, name: 'Avena', category: 'carbs', cal: 389, protein: 17, carbs: 66, fat: 7, fiber: 11 },
  { id: 28, name: 'Quinoa (cocida)', category: 'carbs', cal: 120, protein: 4.4, carbs: 21, fat: 1.9, fiber: 2.8 },
  { id: 29, name: 'Cuscús (cocido)', category: 'carbs', cal: 112, protein: 3.8, carbs: 23, fat: 0.2, fiber: 1.4 },
  { id: 30, name: 'Tortitas de arroz', category: 'carbs', cal: 387, protein: 8, carbs: 82, fat: 3, fiber: 4 },
  { id: 31, name: 'Tortilla de trigo', category: 'carbs', cal: 312, protein: 8, carbs: 52, fat: 8, fiber: 3 },
  { id: 32, name: 'Cereales de desayuno', category: 'carbs', cal: 379, protein: 7, carbs: 84, fat: 2, fiber: 3 },
  { id: 33, name: 'Muesli', category: 'carbs', cal: 340, protein: 10, carbs: 60, fat: 8, fiber: 8 },
  { id: 34, name: 'Macarrones (cocidos)', category: 'carbs', cal: 131, protein: 5, carbs: 25, fat: 1.1, fiber: 1.8 },
  { id: 35, name: 'Fideos (cocidos)', category: 'carbs', cal: 138, protein: 4.5, carbs: 25, fat: 2, fiber: 1 },
  { id: 36, name: 'Pan de molde integral', category: 'carbs', cal: 250, protein: 10, carbs: 44, fat: 4, fiber: 5 },
  { id: 37, name: 'Pan de centeno', category: 'carbs', cal: 259, protein: 9, carbs: 48, fat: 3.3, fiber: 6 },
  { id: 38, name: 'Galletas María', category: 'carbs', cal: 436, protein: 7, carbs: 73, fat: 13, fiber: 2 },

  // Grasas saludables
  { id: 40, name: 'Aguacate', category: 'fats', cal: 160, protein: 2, carbs: 9, fat: 15, fiber: 7 },
  { id: 41, name: 'Aceite de oliva (1 cda)', category: 'fats', cal: 884, protein: 0, carbs: 0, fat: 100, fiber: 0 },
  { id: 42, name: 'Almendras', category: 'fats', cal: 579, protein: 21, carbs: 22, fat: 50, fiber: 12 },
  { id: 43, name: 'Nueces', category: 'fats', cal: 654, protein: 15, carbs: 14, fat: 65, fiber: 7 },
  { id: 44, name: 'Mantequilla de cacahuete', category: 'fats', cal: 588, protein: 25, carbs: 20, fat: 50, fiber: 6 },
  { id: 45, name: 'Semillas de chía', category: 'fats', cal: 486, protein: 17, carbs: 42, fat: 31, fiber: 34 },
  { id: 46, name: 'Semillas de lino', category: 'fats', cal: 534, protein: 18, carbs: 29, fat: 42, fiber: 27 },
  { id: 47, name: 'Aceitunas', category: 'fats', cal: 115, protein: 0.8, carbs: 6, fat: 11, fiber: 3.2 },
  { id: 48, name: 'Cacahuetes', category: 'fats', cal: 567, protein: 26, carbs: 16, fat: 49, fiber: 9 },
  { id: 49, name: 'Pipas de girasol', category: 'fats', cal: 584, protein: 21, carbs: 20, fat: 51, fiber: 9 },
  { id: 50, name: 'Anacardos', category: 'fats', cal: 553, protein: 18, carbs: 30, fat: 44, fiber: 3 },
  { id: 51, name: 'Pistachos', category: 'fats', cal: 560, protein: 20, carbs: 28, fat: 45, fiber: 10 },
  { id: 52, name: 'Coco rallado', category: 'fats', cal: 660, protein: 7, carbs: 24, fat: 62, fiber: 16 },

  // Verduras
  { id: 60, name: 'Brócoli', category: 'vegetables', cal: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6 },
  { id: 61, name: 'Espinacas', category: 'vegetables', cal: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2 },
  { id: 62, name: 'Tomate', category: 'vegetables', cal: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2 },
  { id: 63, name: 'Pepino', category: 'vegetables', cal: 15, protein: 0.7, carbs: 3.6, fat: 0.1, fiber: 0.5 },
  { id: 64, name: 'Zanahoria', category: 'vegetables', cal: 41, protein: 0.9, carbs: 10, fat: 0.2, fiber: 2.8 },
  { id: 65, name: 'Pimiento rojo', category: 'vegetables', cal: 31, protein: 1, carbs: 6, fat: 0.3, fiber: 2.1 },
  { id: 66, name: 'Calabacín', category: 'vegetables', cal: 17, protein: 1.2, carbs: 3.1, fat: 0.3, fiber: 1 },
  { id: 67, name: 'Cebolla', category: 'vegetables', cal: 40, protein: 1.1, carbs: 9, fat: 0.1, fiber: 1.7 },
  { id: 68, name: 'Champiñones', category: 'vegetables', cal: 22, protein: 3.1, carbs: 3.3, fat: 0.3, fiber: 1 },
  { id: 69, name: 'Judías verdes', category: 'vegetables', cal: 31, protein: 1.8, carbs: 7, fat: 0.1, fiber: 3.4 },
  { id: 70, name: 'Lechuga', category: 'vegetables', cal: 15, protein: 1.4, carbs: 2.9, fat: 0.2, fiber: 1.3 },
  { id: 71, name: 'Coliflor', category: 'vegetables', cal: 25, protein: 1.9, carbs: 5, fat: 0.3, fiber: 2 },
  { id: 72, name: 'Berenjena', category: 'vegetables', cal: 25, protein: 1, carbs: 6, fat: 0.2, fiber: 3 },
  { id: 73, name: 'Espárragos', category: 'vegetables', cal: 20, protein: 2.2, carbs: 3.9, fat: 0.1, fiber: 2.1 },
  { id: 150, name: 'Acelgas', category: 'vegetables', cal: 19, protein: 1.8, carbs: 3.7, fat: 0.2, fiber: 1.6 },
  { id: 151, name: 'Col/Repollo', category: 'vegetables', cal: 25, protein: 1.3, carbs: 6, fat: 0.1, fiber: 2.5 },
  { id: 152, name: 'Rúcula', category: 'vegetables', cal: 25, protein: 2.6, carbs: 3.6, fat: 0.7, fiber: 1.6 },
  { id: 153, name: 'Alcachofas', category: 'vegetables', cal: 47, protein: 3.3, carbs: 11, fat: 0.2, fiber: 5.4 },
  { id: 154, name: 'Remolacha', category: 'vegetables', cal: 43, protein: 1.6, carbs: 10, fat: 0.2, fiber: 2.8 },
  { id: 155, name: 'Apio', category: 'vegetables', cal: 14, protein: 0.7, carbs: 3, fat: 0.2, fiber: 1.6 },
  { id: 156, name: 'Puerro', category: 'vegetables', cal: 61, protein: 1.5, carbs: 14, fat: 0.3, fiber: 1.8 },
  { id: 157, name: 'Guindilla/Chile', category: 'vegetables', cal: 40, protein: 1.9, carbs: 9, fat: 0.4, fiber: 1.5 },
  { id: 158, name: 'Lombarda', category: 'vegetables', cal: 31, protein: 1.4, carbs: 7, fat: 0.2, fiber: 2.1 },
  { id: 159, name: 'Canónigos', category: 'vegetables', cal: 21, protein: 2, carbs: 3.6, fat: 0.4, fiber: 1.5 },
  { id: 160, name: 'Rábanos', category: 'vegetables', cal: 16, protein: 0.7, carbs: 3.4, fat: 0.1, fiber: 1.6 },
  { id: 161, name: 'Nabo', category: 'vegetables', cal: 28, protein: 0.9, carbs: 6, fat: 0.1, fiber: 1.8 },

  // Frutas
  { id: 80, name: 'Plátano', category: 'fruits', cal: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6 },
  { id: 81, name: 'Manzana', category: 'fruits', cal: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4 },
  { id: 82, name: 'Naranja', category: 'fruits', cal: 47, protein: 0.9, carbs: 12, fat: 0.1, fiber: 2.4 },
  { id: 83, name: 'Fresas', category: 'fruits', cal: 32, protein: 0.7, carbs: 8, fat: 0.3, fiber: 2 },
  { id: 84, name: 'Arándanos', category: 'fruits', cal: 57, protein: 0.7, carbs: 14, fat: 0.3, fiber: 2.4 },
  { id: 85, name: 'Kiwi', category: 'fruits', cal: 61, protein: 1.1, carbs: 15, fat: 0.5, fiber: 3 },
  { id: 86, name: 'Sandía', category: 'fruits', cal: 30, protein: 0.6, carbs: 8, fat: 0.2, fiber: 0.4 },
  { id: 87, name: 'Uvas', category: 'fruits', cal: 69, protein: 0.7, carbs: 18, fat: 0.2, fiber: 0.9 },
  { id: 88, name: 'Piña', category: 'fruits', cal: 50, protein: 0.5, carbs: 13, fat: 0.1, fiber: 1.4 },
  { id: 89, name: 'Mango', category: 'fruits', cal: 60, protein: 0.8, carbs: 15, fat: 0.4, fiber: 1.6 },
  { id: 90, name: 'Pera', category: 'fruits', cal: 57, protein: 0.4, carbs: 15, fat: 0.1, fiber: 3.1 },
  { id: 91, name: 'Melocotón', category: 'fruits', cal: 39, protein: 0.9, carbs: 10, fat: 0.3, fiber: 1.5 },
  { id: 92, name: 'Cereza', category: 'fruits', cal: 50, protein: 1, carbs: 12, fat: 0.3, fiber: 2 },
  { id: 93, name: 'Mandarina', category: 'fruits', cal: 53, protein: 0.8, carbs: 13, fat: 0.3, fiber: 1.8 },
  { id: 94, name: 'Pomelo', category: 'fruits', cal: 42, protein: 0.8, carbs: 11, fat: 0.1, fiber: 1.6 },
  { id: 95, name: 'Granada', category: 'fruits', cal: 83, protein: 1.7, carbs: 19, fat: 1.2, fiber: 4 },
  { id: 96, name: 'Higos', category: 'fruits', cal: 74, protein: 0.8, carbs: 19, fat: 0.3, fiber: 3 },
  { id: 97, name: 'Papaya', category: 'fruits', cal: 43, protein: 0.5, carbs: 11, fat: 0.3, fiber: 1.7 },
  { id: 98, name: 'Ciruela', category: 'fruits', cal: 46, protein: 0.7, carbs: 11, fat: 0.3, fiber: 1.4 },
  { id: 99, name: 'Caqui', category: 'fruits', cal: 70, protein: 0.6, carbs: 19, fat: 0.2, fiber: 3.6 },

  // Lácteos
  { id: 100, name: 'Leche entera', category: 'dairy', cal: 61, protein: 3.2, carbs: 4.8, fat: 3.3, fiber: 0 },
  { id: 101, name: 'Leche desnatada', category: 'dairy', cal: 35, protein: 3.4, carbs: 5, fat: 0.1, fiber: 0 },
  { id: 102, name: 'Yogur natural', category: 'dairy', cal: 61, protein: 3.5, carbs: 4.7, fat: 3.3, fiber: 0 },
  { id: 103, name: 'Yogur griego', category: 'dairy', cal: 97, protein: 9, carbs: 3.6, fat: 5, fiber: 0 },
  { id: 104, name: 'Skyr', category: 'dairy', cal: 63, protein: 11, carbs: 4, fat: 0.2, fiber: 0 },
  { id: 105, name: 'Queso fresco', category: 'dairy', cal: 174, protein: 12, carbs: 3, fat: 13, fiber: 0 },
  { id: 106, name: 'Queso curado', category: 'dairy', cal: 402, protein: 32, carbs: 0.5, fat: 30, fiber: 0 },
  { id: 107, name: 'Requesón', category: 'dairy', cal: 98, protein: 11, carbs: 3.4, fat: 4.3, fiber: 0 },
  { id: 108, name: 'Cottage cheese', category: 'dairy', cal: 98, protein: 11, carbs: 3.4, fat: 4.3, fiber: 0 },
  { id: 109, name: 'Whey protein (scoop)', category: 'dairy', cal: 120, protein: 24, carbs: 3, fat: 1.5, fiber: 0 },
  { id: 110, name: 'Leche semidesnatada', category: 'dairy', cal: 46, protein: 3.3, carbs: 4.8, fat: 1.6, fiber: 0 },
  { id: 111, name: 'Yogur desnatado', category: 'dairy', cal: 45, protein: 4.5, carbs: 6, fat: 0.3, fiber: 0 },
  { id: 112, name: 'Queso mozzarella', category: 'dairy', cal: 280, protein: 22, carbs: 2, fat: 21, fiber: 0 },
  { id: 113, name: 'Queso emmental', category: 'dairy', cal: 380, protein: 29, carbs: 0, fat: 29, fiber: 0 },
  { id: 114, name: 'Queso de cabra', category: 'dairy', cal: 364, protein: 22, carbs: 1, fat: 30, fiber: 0 },
  { id: 115, name: 'Kéfir', category: 'dairy', cal: 41, protein: 3.3, carbs: 4.7, fat: 1, fiber: 0 },
  { id: 116, name: 'Nata', category: 'dairy', cal: 340, protein: 2, carbs: 3, fat: 36, fiber: 0 },
  { id: 117, name: 'Mantequilla', category: 'dairy', cal: 717, protein: 0.9, carbs: 0.1, fat: 81, fiber: 0 },
  { id: 118, name: 'Bebida de avena', category: 'dairy', cal: 43, protein: 1, carbs: 7, fat: 1.5, fiber: 0.8 },
  { id: 230, name: 'Queso crema/untable', category: 'dairy', cal: 253, protein: 6, carbs: 4, fat: 24, fiber: 0 },
  { id: 231, name: 'Queso cheddar', category: 'dairy', cal: 402, protein: 25, carbs: 1.3, fat: 33, fiber: 0 },
  { id: 232, name: 'Queso en lonchas', category: 'dairy', cal: 300, protein: 18, carbs: 6, fat: 23, fiber: 0 },
  { id: 233, name: 'Queso parmesano', category: 'dairy', cal: 431, protein: 38, carbs: 4, fat: 29, fiber: 0 },
  { id: 234, name: 'Queso burgos/batido', category: 'dairy', cal: 90, protein: 8, carbs: 4, fat: 5, fiber: 0 },

  // Cereales y legumbres
  { id: 120, name: 'Lentejas (cocidas)', category: 'grains', cal: 116, protein: 9, carbs: 20, fat: 0.4, fiber: 8 },
  { id: 121, name: 'Garbanzos (cocidos)', category: 'grains', cal: 164, protein: 9, carbs: 27, fat: 2.6, fiber: 8 },
  { id: 122, name: 'Judías blancas (cocidas)', category: 'grains', cal: 139, protein: 9.7, carbs: 25, fat: 0.5, fiber: 6.3 },
  { id: 123, name: 'Edamame', category: 'grains', cal: 121, protein: 12, carbs: 9, fat: 5, fiber: 5 },
  { id: 124, name: 'Maíz dulce', category: 'grains', cal: 86, protein: 3.3, carbs: 19, fat: 1.2, fiber: 2.7 },
  { id: 125, name: 'Guisantes', category: 'grains', cal: 81, protein: 5.4, carbs: 14, fat: 0.4, fiber: 5 },
  { id: 126, name: 'Alubias rojas (cocidas)', category: 'grains', cal: 127, protein: 8.7, carbs: 23, fat: 0.5, fiber: 6.4 },
  { id: 127, name: 'Habas (cocidas)', category: 'grains', cal: 88, protein: 8, carbs: 12, fat: 0.7, fiber: 5 },
  { id: 128, name: 'Soja texturizada', category: 'grains', cal: 345, protein: 50, carbs: 30, fat: 1, fiber: 5 },
  { id: 129, name: 'Bulgur (cocido)', category: 'grains', cal: 83, protein: 3, carbs: 19, fat: 0.2, fiber: 4.5 },
  { id: 130, name: 'Mijo (cocido)', category: 'grains', cal: 119, protein: 3.5, carbs: 23, fat: 1, fiber: 1.3 },
  { id: 131, name: 'Trigo sarraceno (cocido)', category: 'grains', cal: 92, protein: 3.4, carbs: 20, fat: 0.6, fiber: 2.7 },
  { id: 132, name: 'Harina de avena', category: 'grains', cal: 380, protein: 13, carbs: 67, fat: 6.5, fiber: 10 },
  { id: 133, name: 'Copos de maíz', category: 'grains', cal: 357, protein: 7, carbs: 84, fat: 0.4, fiber: 1.2 },

  // Snacks
  { id: 140, name: 'Chocolate negro 85%', category: 'snacks', cal: 580, protein: 10, carbs: 30, fat: 46, fiber: 11 },
  { id: 141, name: 'Barrita proteica', category: 'snacks', cal: 200, protein: 20, carbs: 22, fat: 7, fiber: 3 },
  { id: 142, name: 'Hummus', category: 'snacks', cal: 166, protein: 8, carbs: 14, fat: 10, fiber: 6 },
  { id: 143, name: 'Palomitas (sin aceite)', category: 'snacks', cal: 375, protein: 11, carbs: 74, fat: 4.3, fiber: 15 },
  { id: 144, name: 'Dátiles', category: 'snacks', cal: 277, protein: 1.8, carbs: 75, fat: 0.2, fiber: 7 },
  { id: 145, name: 'Crackers integrales', category: 'snacks', cal: 430, protein: 10, carbs: 67, fat: 14, fiber: 6 },
  { id: 170, name: 'Tortitas de maíz', category: 'snacks', cal: 380, protein: 7, carbs: 83, fat: 2, fiber: 2 },
  { id: 171, name: 'Barritas de cereales', category: 'snacks', cal: 400, protein: 5, carbs: 70, fat: 12, fiber: 4 },
  { id: 172, name: 'Frutos secos mix', category: 'snacks', cal: 607, protein: 20, carbs: 20, fat: 53, fiber: 7 },
  { id: 173, name: 'Pasas', category: 'snacks', cal: 299, protein: 3, carbs: 79, fat: 0.5, fiber: 4 },
  { id: 174, name: 'Orejones de albaricoque', category: 'snacks', cal: 241, protein: 3, carbs: 63, fat: 0.5, fiber: 7 },
  { id: 175, name: 'Chips de plátano', category: 'snacks', cal: 519, protein: 2, carbs: 59, fat: 31, fiber: 8 },
  { id: 176, name: 'Turrón blando', category: 'snacks', cal: 500, protein: 14, carbs: 44, fat: 30, fiber: 3 },
  { id: 177, name: 'Membrillo', category: 'snacks', cal: 215, protein: 0.4, carbs: 55, fat: 0.2, fiber: 2 },
  { id: 178, name: 'Palitos de pan', category: 'snacks', cal: 410, protein: 12, carbs: 68, fat: 10, fiber: 3 },
  { id: 179, name: 'Crema de chocolate (tipo Nocilla)', category: 'snacks', cal: 539, protein: 6, carbs: 58, fat: 31, fiber: 4 },

  // Comidas preparadas
  { id: 200, name: 'Pizza margarita', category: 'prepared', cal: 266, protein: 11, carbs: 33, fat: 10, fiber: 2 },
  { id: 201, name: 'Hamburguesa completa', category: 'prepared', cal: 295, protein: 17, carbs: 24, fat: 14, fiber: 1.5 },
  { id: 202, name: 'Kebab con pan', category: 'prepared', cal: 215, protein: 15, carbs: 18, fat: 9, fiber: 1 },
  { id: 203, name: 'Croquetas (unidad ~25g)', category: 'prepared', cal: 220, protein: 7, carbs: 20, fat: 13, fiber: 1 },
  { id: 204, name: 'Tortilla de patata', category: 'prepared', cal: 130, protein: 6, carbs: 10, fat: 7, fiber: 0.8 },
  { id: 205, name: 'Empanada de atún', category: 'prepared', cal: 290, protein: 10, carbs: 32, fat: 14, fiber: 1.5 },
  { id: 206, name: 'Nuggets de pollo', category: 'prepared', cal: 280, protein: 14, carbs: 18, fat: 17, fiber: 1 },
  { id: 207, name: 'Sushi (maki 6 piezas)', category: 'prepared', cal: 140, protein: 5, carbs: 28, fat: 1, fiber: 1 },
  { id: 208, name: 'Paella (porción)', category: 'prepared', cal: 155, protein: 8, carbs: 20, fat: 5, fiber: 1 },
  { id: 209, name: 'Gazpacho', category: 'prepared', cal: 44, protein: 0.7, carbs: 4, fat: 3, fiber: 0.7 },
  { id: 210, name: 'Salmorejo', category: 'prepared', cal: 85, protein: 2, carbs: 8, fat: 5, fiber: 0.5 },
  { id: 211, name: 'Fabada (porción)', category: 'prepared', cal: 195, protein: 12, carbs: 18, fat: 8, fiber: 5 },
  { id: 212, name: 'Cocido (porción)', category: 'prepared', cal: 180, protein: 14, carbs: 15, fat: 7, fiber: 4 },
  { id: 213, name: 'Macarrones con tomate', category: 'prepared', cal: 150, protein: 5, carbs: 25, fat: 3, fiber: 2 },
  { id: 214, name: 'Ensaladilla rusa', category: 'prepared', cal: 180, protein: 4, carbs: 12, fat: 13, fiber: 2 },
  { id: 215, name: 'Lentejas estofadas', category: 'prepared', cal: 130, protein: 8, carbs: 18, fat: 3, fiber: 5 },
]

// Meal suggestions by goal
export const MEAL_SUGGESTIONS = {
  deficit: {
    breakfast: [
      { name: 'Tortilla de claras con espinacas', foods: [{ id: 9, grams: 200 }, { id: 61, grams: 50 }], cal: 116 },
      { name: 'Yogur griego con fresas', foods: [{ id: 103, grams: 150 }, { id: 83, grams: 100 }], cal: 178 },
      { name: 'Avena con plátano', foods: [{ id: 27, grams: 40 }, { id: 80, grams: 100 }, { id: 101, grams: 150 }], cal: 297 },
      { name: 'Tostada integral con pavo', foods: [{ id: 23, grams: 40 }, { id: 2, grams: 60 }], cal: 180 },
    ],
    lunch: [
      { name: 'Pollo a la plancha con verduras', foods: [{ id: 1, grams: 150 }, { id: 60, grams: 150 }, { id: 20, grams: 100 }], cal: 429 },
      { name: 'Ensalada de atún', foods: [{ id: 12, grams: 100 }, { id: 70, grams: 100 }, { id: 62, grams: 100 }, { id: 63, grams: 80 }], cal: 164 },
      { name: 'Merluza con patata', foods: [{ id: 6, grams: 200 }, { id: 25, grams: 150 }], cal: 309 },
      { name: 'Pechuga de pavo con quinoa', foods: [{ id: 2, grams: 150 }, { id: 28, grams: 150 }], cal: 383 },
    ],
    dinner: [
      { name: 'Salmón con espárragos', foods: [{ id: 4, grams: 150 }, { id: 73, grams: 150 }], cal: 342 },
      { name: 'Tortilla francesa con ensalada', foods: [{ id: 8, grams: 100 }, { id: 70, grams: 100 }, { id: 62, grams: 100 }], cal: 188 },
      { name: 'Pollo con calabacín', foods: [{ id: 1, grams: 150 }, { id: 66, grams: 200 }], cal: 282 },
      { name: 'Bacalao al horno con verduras', foods: [{ id: 14, grams: 200 }, { id: 65, grams: 100 }, { id: 67, grams: 50 }], cal: 215 },
    ],
    snack: [
      { name: 'Manzana', foods: [{ id: 81, grams: 150 }], cal: 78 },
      { name: 'Yogur natural', foods: [{ id: 102, grams: 125 }], cal: 76 },
      { name: 'Zanahorias baby', foods: [{ id: 64, grams: 100 }], cal: 41 },
      { name: 'Skyr con arándanos', foods: [{ id: 104, grams: 150 }, { id: 84, grams: 50 }], cal: 123 },
    ],
  },
  bulk: {
    breakfast: [
      { name: 'Avena con plátano, nueces y miel', foods: [{ id: 27, grams: 80 }, { id: 80, grams: 120 }, { id: 43, grams: 20 }], cal: 549 },
      { name: 'Tostadas con aguacate y huevos', foods: [{ id: 23, grams: 80 }, { id: 40, grams: 80 }, { id: 8, grams: 100 }], cal: 481 },
      { name: 'Batido proteico con avena', foods: [{ id: 109, grams: 30 }, { id: 27, grams: 50 }, { id: 80, grams: 100 }, { id: 100, grams: 250 }], cal: 488 },
      { name: 'Tortilla de 3 huevos con pan', foods: [{ id: 8, grams: 150 }, { id: 23, grams: 60 }], cal: 381 },
    ],
    lunch: [
      { name: 'Arroz con pollo y aguacate', foods: [{ id: 20, grams: 200 }, { id: 1, grams: 200 }, { id: 40, grams: 80 }], cal: 718 },
      { name: 'Pasta con carne y verduras', foods: [{ id: 22, grams: 200 }, { id: 3, grams: 150 }, { id: 65, grams: 100 }], cal: 518 },
      { name: 'Bowl de quinoa con salmón', foods: [{ id: 28, grams: 200 }, { id: 4, grams: 150 }, { id: 40, grams: 50 }], cal: 632 },
      { name: 'Garbanzos con arroz y pollo', foods: [{ id: 121, grams: 150 }, { id: 20, grams: 150 }, { id: 1, grams: 150 }], cal: 689 },
    ],
    dinner: [
      { name: 'Salmón con boniato', foods: [{ id: 4, grams: 200 }, { id: 26, grams: 250 }], cal: 641 },
      { name: 'Carne con pasta integral', foods: [{ id: 3, grams: 200 }, { id: 22, grams: 200 }], cal: 562 },
      { name: 'Pollo con arroz y verduras', foods: [{ id: 1, grams: 200 }, { id: 21, grams: 200 }, { id: 60, grams: 150 }], cal: 627 },
      { name: 'Tortilla de patata con ensalada', foods: [{ id: 8, grams: 150 }, { id: 25, grams: 200 }, { id: 70, grams: 100 }], cal: 421 },
    ],
    snack: [
      { name: 'Batido de proteínas con plátano', foods: [{ id: 109, grams: 30 }, { id: 80, grams: 120 }, { id: 100, grams: 200 }], cal: 365 },
      { name: 'Tostada con mantequilla de cacahuete', foods: [{ id: 23, grams: 60 }, { id: 44, grams: 30 }], cal: 325 },
      { name: 'Mix de frutos secos', foods: [{ id: 42, grams: 30 }, { id: 43, grams: 20 }], cal: 305 },
      { name: 'Yogur griego con granola', foods: [{ id: 103, grams: 200 }, { id: 27, grams: 30 }], cal: 311 },
    ],
  },
  maintenance: {
    breakfast: [
      { name: 'Avena con frutas', foods: [{ id: 27, grams: 50 }, { id: 83, grams: 80 }, { id: 80, grams: 60 }], cal: 275 },
      { name: 'Tostada integral con huevo', foods: [{ id: 23, grams: 50 }, { id: 8, grams: 100 }], cal: 279 },
      { name: 'Yogur con granola y fruta', foods: [{ id: 103, grams: 150 }, { id: 27, grams: 25 }, { id: 84, grams: 50 }], cal: 272 },
      { name: 'Smoothie bowl', foods: [{ id: 80, grams: 100 }, { id: 83, grams: 80 }, { id: 27, grams: 30 }, { id: 101, grams: 100 }], cal: 265 },
    ],
    lunch: [
      { name: 'Pollo con arroz y ensalada', foods: [{ id: 1, grams: 150 }, { id: 20, grams: 150 }, { id: 70, grams: 80 }], cal: 455 },
      { name: 'Salmón con quinoa', foods: [{ id: 4, grams: 150 }, { id: 28, grams: 150 }], cal: 492 },
      { name: 'Lentejas con verduras', foods: [{ id: 120, grams: 200 }, { id: 64, grams: 80 }, { id: 62, grams: 80 }], cal: 279 },
      { name: 'Wrap de pavo con aguacate', foods: [{ id: 2, grams: 100 }, { id: 40, grams: 50 }, { id: 24, grams: 50 }], cal: 348 },
    ],
    dinner: [
      { name: 'Merluza con patatas y verduras', foods: [{ id: 6, grams: 200 }, { id: 25, grams: 150 }, { id: 60, grams: 100 }], cal: 343 },
      { name: 'Pollo al horno con boniato', foods: [{ id: 1, grams: 150 }, { id: 26, grams: 200 }], cal: 428 },
      { name: 'Tortilla con ensalada', foods: [{ id: 8, grams: 100 }, { id: 62, grams: 100 }, { id: 63, grams: 80 }], cal: 200 },
      { name: 'Pasta con gambas', foods: [{ id: 22, grams: 150 }, { id: 7, grams: 120 }], cal: 315 },
    ],
    snack: [
      { name: 'Fruta con yogur', foods: [{ id: 81, grams: 120 }, { id: 102, grams: 100 }], cal: 123 },
      { name: 'Tostada con queso fresco', foods: [{ id: 23, grams: 40 }, { id: 105, grams: 30 }], cal: 151 },
      { name: 'Hummus con zanahorias', foods: [{ id: 142, grams: 50 }, { id: 64, grams: 100 }], cal: 124 },
      { name: 'Puñado de almendras', foods: [{ id: 42, grams: 25 }], cal: 145 },
    ],
  },
}

export const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
export const DAYS_SHORT = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
export const MEALS = ['breakfast', 'lunch', 'dinner', 'snack']
export const MEAL_LABELS = { breakfast: 'Desayuno', lunch: 'Almuerzo', dinner: 'Cena', snack: 'Snack' }
export const MEAL_ICONS = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍪' }

// Reparto de calorías/macros por comida según el objetivo.
// Cada objetivo suma 1.0 entre las 4 comidas. En volumen el snack pesa más
// (comidas extra), en déficit se concentra en comidas principales.
export const MEAL_SPLIT = {
  deficit:     { breakfast: 0.25, lunch: 0.35, dinner: 0.30, snack: 0.10 },
  maintenance: { breakfast: 0.25, lunch: 0.35, dinner: 0.28, snack: 0.12 },
  bulk:        { breakfast: 0.25, lunch: 0.32, dinner: 0.28, snack: 0.15 },
}

export function getGoalKey(goal) {
  return goal === 'bulk' ? 'bulk' : goal === 'deficit' ? 'deficit' : 'maintenance'
}

// Calcula los totales (cal + macros + gramos) de una lista de ingredientes
// [{ id, grams }] resolviendo contra FOODS_DB (que está en valores por 100g).
export function computeFoodsTotals(foods) {
  let cal = 0, protein = 0, carbs = 0, fat = 0, grams = 0
  ;(foods || []).forEach(f => {
    const food = FOODS_DB.find(fd => fd.id === f.id)
    if (!food) return
    const factor = (f.grams || 0) / 100
    cal += food.cal * factor
    protein += food.protein * factor
    carbs += food.carbs * factor
    fat += food.fat * factor
    grams += f.grams || 0
  })
  return {
    cal: Math.round(cal),
    protein: Math.round(protein * 10) / 10,
    carbs: Math.round(carbs * 10) / 10,
    fat: Math.round(fat * 10) / 10,
    grams: Math.round(grams),
  }
}

// Escala las porciones de una lista de ingredientes por un factor, redondeando
// a 5g para que las cantidades queden "limpias".
export function scaleFoods(foods, factor) {
  return (foods || []).map(f => ({
    ...f,
    grams: Math.max(5, Math.round((f.grams || 0) * factor / 5) * 5),
  }))
}
