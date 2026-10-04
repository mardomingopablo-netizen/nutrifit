export const SUPPLEMENT_CATEGORIES = [
  { id: 'performance', label: 'Rendimiento', icon: '💪' },
  { id: 'health', label: 'Salud general', icon: '❤️' },
  { id: 'recovery', label: 'Recuperación', icon: '🔄' },
  { id: 'vitamins', label: 'Vitaminas', icon: '💊' },
]

export const SUPPLEMENTS_DB = [
  // Rendimiento
  { id: 's1', name: 'Creatina monohidrato', category: 'performance', dose: '5g', timing: 'Cualquier momento', desc: 'Mejora fuerza y rendimiento. El suplemento más estudiado y efectivo.', benefits: ['Más fuerza', 'Más masa muscular', 'Mejor recuperación'] },
  { id: 's2', name: 'Whey Protein', category: 'performance', dose: '25-30g', timing: 'Post-entreno o entre comidas', desc: 'Proteína de suero de leche de absorción rápida.', benefits: ['Síntesis proteica', 'Recuperación muscular', 'Saciedad'] },
  { id: 's3', name: 'Caseína', category: 'performance', dose: '25-30g', timing: 'Antes de dormir', desc: 'Proteína de absorción lenta ideal para la noche.', benefits: ['Anticatabólico', 'Saciedad nocturna', 'Recuperación'] },
  { id: 's4', name: 'Cafeína', category: 'performance', dose: '200-400mg', timing: '30min pre-entreno', desc: 'Estimulante que mejora el rendimiento y la concentración.', benefits: ['Más energía', 'Mejor enfoque', 'Quema de grasa'] },
  { id: 's5', name: 'Beta-alanina', category: 'performance', dose: '3-5g', timing: 'Pre-entreno', desc: 'Reduce la fatiga muscular durante ejercicio intenso.', benefits: ['Más resistencia', 'Menos fatiga', 'Más volumen de entrenamiento'] },
  { id: 's6', name: 'Citrulina malato', category: 'performance', dose: '6-8g', timing: 'Pre-entreno', desc: 'Mejora el flujo sanguíneo y reduce la fatiga.', benefits: ['Mejor bombeo', 'Menos fatiga', 'Más resistencia'] },

  // Salud general
  { id: 's10', name: 'Omega-3 (EPA/DHA)', category: 'health', dose: '2-3g', timing: 'Con comida', desc: 'Ácidos grasos esenciales antiinflamatorios.', benefits: ['Salud cardiovascular', 'Antiinflamatorio', 'Salud cerebral'] },
  { id: 's11', name: 'Probióticos', category: 'health', dose: '10-50B CFU', timing: 'En ayunas', desc: 'Bacterias beneficiosas para la salud intestinal.', benefits: ['Salud digestiva', 'Sistema inmune', 'Absorción nutrientes'] },
  { id: 's12', name: 'Fibra (psyllium)', category: 'health', dose: '5-10g', timing: 'Con agua, antes de comida', desc: 'Mejora tránsito intestinal y saciedad.', benefits: ['Digestión', 'Saciedad', 'Control glucosa'] },
  { id: 's13', name: 'Colágeno', category: 'health', dose: '10-15g', timing: 'Cualquier momento', desc: 'Proteína estructural para articulaciones, piel y huesos.', benefits: ['Articulaciones', 'Piel', 'Tendones'] },

  // Recuperación
  { id: 's20', name: 'Magnesio', category: 'recovery', dose: '400mg', timing: 'Antes de dormir', desc: 'Mineral esencial para la función muscular y el sueño.', benefits: ['Mejor sueño', 'Menos calambres', 'Relajación muscular'] },
  { id: 's21', name: 'ZMA', category: 'recovery', dose: '30mg Zn + 450mg Mg', timing: 'Antes de dormir', desc: 'Zinc + magnesio + B6 para recuperación nocturna.', benefits: ['Recuperación', 'Hormonas', 'Sueño profundo'] },
  { id: 's22', name: 'Glutamina', category: 'recovery', dose: '5-10g', timing: 'Post-entreno', desc: 'Aminoácido para recuperación intestinal y muscular.', benefits: ['Recuperación', 'Sistema inmune', 'Salud intestinal'] },
  { id: 's23', name: 'Ashwagandha', category: 'recovery', dose: '300-600mg', timing: 'Con comida', desc: 'Adaptógeno que reduce cortisol y estrés.', benefits: ['Menos estrés', 'Mejor sueño', 'Más testosterona'] },

  // Vitaminas
  { id: 's30', name: 'Vitamina D3', category: 'vitamins', dose: '2000-5000 IU', timing: 'Con comida grasa', desc: 'Esencial si no te da mucho el sol. Crucial para huesos e inmunidad.', benefits: ['Huesos', 'Sistema inmune', 'Estado de ánimo'] },
  { id: 's31', name: 'Vitamina C', category: 'vitamins', dose: '500-1000mg', timing: 'Con comida', desc: 'Antioxidante y soporte inmunológico.', benefits: ['Antioxidante', 'Sistema inmune', 'Absorción hierro'] },
  { id: 's32', name: 'Multivitamínico', category: 'vitamins', dose: '1 cápsula', timing: 'Con desayuno', desc: 'Cobertura general de micronutrientes.', benefits: ['Cobertura nutricional', 'Energía', 'Salud general'] },
  { id: 's33', name: 'Vitamina B12', category: 'vitamins', dose: '1000mcg', timing: 'Con comida', desc: 'Esencial para veganos. Importante para energía y sistema nervioso.', benefits: ['Energía', 'Sistema nervioso', 'Glóbulos rojos'] },
  { id: 's34', name: 'Hierro', category: 'vitamins', dose: '14-18mg', timing: 'Con vitamina C, lejos de café', desc: 'Importante para transporte de oxígeno, especialmente en mujeres.', benefits: ['Energía', 'Oxigenación', 'Rendimiento'] },
  { id: 's35', name: 'Zinc', category: 'vitamins', dose: '15-30mg', timing: 'Con comida', desc: 'Mineral esencial para inmunidad y hormonas.', benefits: ['Sistema inmune', 'Testosterona', 'Piel'] },
  { id: 's36', name: 'Vitamina A', category: 'vitamins', dose: '700-900mcg', timing: 'Con comida grasa', desc: 'Esencial para la visión, piel y sistema inmunológico.', benefits: ['Vista', 'Piel', 'Sistema inmune'] },
  { id: 's37', name: 'Vitamina E', category: 'vitamins', dose: '15mg', timing: 'Con comida grasa', desc: 'Potente antioxidante que protege las células del daño oxidativo.', benefits: ['Antioxidante', 'Piel', 'Salud cardiovascular'] },
  { id: 's38', name: 'Vitamina K2', category: 'vitamins', dose: '100-200mcg', timing: 'Con vitamina D3', desc: 'Dirige el calcio a los huesos. Complemento ideal de la vitamina D3.', benefits: ['Huesos', 'Salud cardiovascular', 'Calcificación'] },
  { id: 's39', name: 'Ácido fólico (B9)', category: 'vitamins', dose: '400-800mcg', timing: 'Con comida', desc: 'Vital para la división celular y formación de ADN.', benefits: ['División celular', 'Embarazo', 'Salud cerebral'] },
  { id: 's40', name: 'Vitamina B6', category: 'vitamins', dose: '1.3-2mg', timing: 'Con comida', desc: 'Importante para el metabolismo de proteínas y función cerebral.', benefits: ['Metabolismo', 'Estado de ánimo', 'Sistema nervioso'] },
  { id: 's41', name: 'Biotina (B7)', category: 'vitamins', dose: '30-100mcg', timing: 'Con comida', desc: 'Fortalece pelo, uñas y piel. Apoya el metabolismo energético.', benefits: ['Pelo', 'Uñas', 'Piel'] },
  { id: 's42', name: 'Calcio', category: 'vitamins', dose: '500-1000mg', timing: 'Con comida, separado del hierro', desc: 'Mineral esencial para huesos, dientes y función muscular.', benefits: ['Huesos', 'Dientes', 'Función muscular'] },
  { id: 's43', name: 'Potasio', category: 'vitamins', dose: '200-400mg', timing: 'Con comida', desc: 'Electrolito clave para la función cardíaca y muscular.', benefits: ['Corazón', 'Músculos', 'Presión arterial'] },
  { id: 's44', name: 'Selenio', category: 'vitamins', dose: '55-200mcg', timing: 'Con comida', desc: 'Oligoelemento antioxidante que protege la tiroides.', benefits: ['Tiroides', 'Antioxidante', 'Sistema inmune'] },
  { id: 's45', name: 'Complejo B', category: 'vitamins', dose: '1 cápsula', timing: 'Con desayuno', desc: 'Todas las vitaminas del grupo B para energía y metabolismo.', benefits: ['Energía', 'Metabolismo', 'Sistema nervioso'] },
]

export const TIMING_OPTIONS = [
  { id: 'morning', label: 'Mañana', icon: '🌅' },
  { id: 'pre_workout', label: 'Pre-entreno', icon: '🏋️' },
  { id: 'post_workout', label: 'Post-entreno', icon: '💪' },
  { id: 'with_meal', label: 'Con comida', icon: '🍽️' },
  { id: 'night', label: 'Noche', icon: '🌙' },
]
