// pages/api/ver-productos.js

// Mock data - in a real application, this would come from a database
const mockProducts = [
  ['Tubería de PVC 4"', '100', '10', 'Metros'],
  ['Pegamento para PVC', '50', '5', 'Unidades'],
  ['Bomba de agua 1HP', '20', '2', 'Unidades'],
  ['Codo de PVC 90 grados', '200', '25', 'Unidades'],
  ['Válvula de bola 1"', '75', '15', 'Unidades'],
];

export default async function handler(req, res) {
  try {
    // Simulate an API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    res.status(200).json(mockProducts);
  } catch (error) {
    console.error('Error al leer productos (mock):', error);
    res.status(500).json({ error: 'Error al leer productos' });
  }
}