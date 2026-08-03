const apiUrl = import.meta.env.VITE_API_URL

if (!apiUrl) {
  throw new Error(
    'La variable de entorno VITE_API_URL no está configurada. Por favor, asegúrate de que esté definida en tu archivo .env',
  )
}

export const env = { apiUrl }
