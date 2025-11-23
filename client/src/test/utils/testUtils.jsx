import React from 'react'
import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../../hooks/useAuth.jsx'

// Helper para renderizar componentes con providers necesarios
export const renderWithProviders = (ui, { 
  initialAuthState = null,
  route = '/' 
} = {}) => {
  // Mock de localStorage para auth
  if (initialAuthState) {
    localStorage.setItem('token', initialAuthState.token || 'mock-token')
    localStorage.setItem('user', JSON.stringify(initialAuthState.user || {}))
  }

  window.history.pushState({}, 'Test page', route)

  const Wrapper = ({ children }) => (
    <BrowserRouter>
      <AuthProvider>
        {children}
      </AuthProvider>
    </BrowserRouter>
  )

  return render(ui, { wrapper: Wrapper })
}

// Helper para crear un usuario mock
export const createMockUser = (overrides = {}) => ({
  _id: '123',
  email: 'test@example.com',
  role: 'estudiante',
  name: 'Test User',
  ...overrides
})

// Helper para mockear la API
export const mockApiResponse = (data, status = 200) => ({
  data: {
    data,
    success: true
  },
  status,
  statusText: 'OK'
})

// Helper para mockear errores de API
export const mockApiError = (message, status = 400) => ({
  response: {
    data: {
      message,
      success: false
    },
    status,
    statusText: 'Bad Request'
  }
})

