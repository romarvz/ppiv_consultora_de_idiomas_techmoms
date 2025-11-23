import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider, useAuth, useLoginForm } from '../../hooks/useAuth.jsx'
import * as api from '../../services/api'

// Mock del módulo de API
vi.mock('../../services/api', () => ({
  authAPI: {
    login: vi.fn(),
    logout: vi.fn(),
    getProfile: vi.fn(),
    verifyToken: vi.fn(),
    changePasswordForced: vi.fn(),
  },
  authUtils: {
    isAuthenticated: vi.fn(),
    getCurrentUser: vi.fn(),
    clearAuth: vi.fn(),
  }
}))

const wrapper = ({ children }) => (
  <BrowserRouter>
    <AuthProvider>
      {children}
    </AuthProvider>
  </BrowserRouter>
)

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe('Inicialización', () => {
    it('debe inicializar sin usuario cuando no hay token', async () => {
      api.authUtils.isAuthenticated.mockReturnValue(false)
      
      const { result } = renderHook(() => useAuth(), { wrapper })
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
      
      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })

    it('debe cargar usuario cuando hay token válido', async () => {
      const mockUser = {
        _id: '123',
        email: 'test@example.com',
        role: 'estudiante',
        name: 'Test User'
      }

      api.authUtils.isAuthenticated.mockReturnValue(true)
      api.authUtils.getCurrentUser.mockReturnValue(mockUser)
      api.authAPI.verifyToken.mockResolvedValue({ user: mockUser })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.user).toEqual(mockUser)
      expect(result.current.isAuthenticated).toBe(true)
    })

    it('debe limpiar auth cuando el token es inválido', async () => {
      api.authUtils.isAuthenticated.mockReturnValue(true)
      api.authAPI.verifyToken.mockRejectedValue(new Error('Token inválido'))

      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(api.authUtils.clearAuth).toHaveBeenCalled()
      expect(result.current.user).toBeNull()
    })
  })

  describe('Login', () => {
    it('debe hacer login exitosamente', async () => {
      const mockUser = {
        _id: '123',
        email: 'test@example.com',
        role: 'estudiante'
      }

      api.authUtils.isAuthenticated.mockReturnValue(false)
      api.authAPI.login.mockResolvedValue({ user: mockUser, token: 'token123' })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await result.current.login('test@example.com', 'password123')

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser)
      })

      expect(api.authAPI.login).toHaveBeenCalledWith('test@example.com', 'password123')
      expect(result.current.error).toBeNull()
    })

    it('debe manejar errores de login', async () => {
      const errorMessage = 'Credenciales inválidas'
      api.authUtils.isAuthenticated.mockReturnValue(false)
      api.authAPI.login.mockRejectedValue({ message: errorMessage })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await expect(
        result.current.login('test@example.com', 'wrongpassword')
      ).rejects.toEqual({ message: errorMessage })

      await waitFor(() => {
        expect(result.current.error).toBe(errorMessage)
      })

      expect(result.current.user).toBeNull()
    })
  })

  describe('Logout', () => {
    it('debe hacer logout correctamente', async () => {
      const mockUser = { _id: '123', email: 'test@example.com' }
      api.authUtils.isAuthenticated.mockReturnValue(true)
      api.authUtils.getCurrentUser.mockReturnValue(mockUser)
      api.authAPI.verifyToken.mockResolvedValue({ user: mockUser })
      api.authAPI.logout.mockResolvedValue({})

      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true)
      })

      await result.current.logout()

      await waitFor(() => {
        expect(result.current.user).toBeNull()
      })

      expect(api.authAPI.logout).toHaveBeenCalled()
      expect(result.current.isAuthenticated).toBe(false)
    })
  })

  describe('Verificación de roles', () => {
    it('debe verificar si el usuario es estudiante', async () => {
      const mockUser = { _id: '123', role: 'estudiante' }
      api.authUtils.isAuthenticated.mockReturnValue(true)
      api.authUtils.getCurrentUser.mockReturnValue(mockUser)
      api.authAPI.verifyToken.mockResolvedValue({ user: mockUser })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.user).toBeTruthy()
      })

      expect(result.current.isStudent()).toBe(true)
      expect(result.current.isTeacher()).toBe(false)
      expect(result.current.isAdmin()).toBe(false)
    })

    it('debe verificar si el usuario es profesor', async () => {
      const mockUser = { _id: '123', role: 'profesor' }
      api.authUtils.isAuthenticated.mockReturnValue(true)
      api.authUtils.getCurrentUser.mockReturnValue(mockUser)
      api.authAPI.verifyToken.mockResolvedValue({ user: mockUser })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.user).toBeTruthy()
      })

      expect(result.current.isStudent()).toBe(false)
      expect(result.current.isTeacher()).toBe(true)
      expect(result.current.isAdmin()).toBe(false)
    })

    it('debe verificar si el usuario es admin', async () => {
      const mockUser = { _id: '123', role: 'admin' }
      api.authUtils.isAuthenticated.mockReturnValue(true)
      api.authUtils.getCurrentUser.mockReturnValue(mockUser)
      api.authAPI.verifyToken.mockResolvedValue({ user: mockUser })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.user).toBeTruthy()
      })

      expect(result.current.isStudent()).toBe(false)
      expect(result.current.isTeacher()).toBe(false)
      expect(result.current.isAdmin()).toBe(true)
    })
  })

  describe('getRedirectPath', () => {
    it('debe retornar ruta de login si no hay usuario', () => {
      api.authUtils.isAuthenticated.mockReturnValue(false)

      const { result } = renderHook(() => useAuth(), { wrapper })

      expect(result.current.getRedirectPath()).toBe('/login')
    })

    it('debe retornar ruta correcta según el rol', async () => {
      const testCases = [
        { role: 'admin', expected: '/dashboard/admin' },
        { role: 'profesor', expected: '/dashboard/teacher' },
        { role: 'estudiante', expected: '/dashboard/student' },
      ]

      for (const { role, expected } of testCases) {
        const mockUser = { _id: '123', role }
        api.authUtils.isAuthenticated.mockReturnValue(true)
        api.authUtils.getCurrentUser.mockReturnValue(mockUser)
        api.authAPI.verifyToken.mockResolvedValue({ user: mockUser })

        const { result } = renderHook(() => useAuth(), { wrapper })

        await waitFor(() => {
          expect(result.current.user).toBeTruthy()
        })

        expect(result.current.getRedirectPath()).toBe(expected)
      }
    })
  })
})

describe('useLoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debe inicializar con valores vacíos', () => {
    const { result } = renderHook(() => useLoginForm(), { wrapper })

    expect(result.current.formData.email).toBe('')
    expect(result.current.formData.password).toBe('')
    expect(result.current.isSubmitting).toBe(false)
  })

  it('debe actualizar formData cuando cambia el input', () => {
    const { result } = renderHook(() => useLoginForm(), { wrapper })

    const mockEvent = {
      target: {
        name: 'email',
        value: 'test@example.com'
      }
    }

    act(() => {
      result.current.handleChange(mockEvent)
    })

    expect(result.current.formData.email).toBe('test@example.com')
  })

  it('debe hacer submit del formulario correctamente', async () => {
    const mockUser = { _id: '123', email: 'test@example.com' }
    api.authUtils.isAuthenticated.mockReturnValue(false)
    api.authAPI.login.mockResolvedValue({ user: mockUser, token: 'token123' })

    const { result } = renderHook(() => useLoginForm(), { wrapper })

    // Actualizar formulario y esperar a que el estado se actualice
    await act(async () => {
      result.current.handleChange({
        target: { name: 'email', value: 'test@example.com' }
      })
    })

    await act(async () => {
      result.current.handleChange({
        target: { name: 'password', value: 'password123' }
      })
    })

    // Verificar que el estado se actualizó antes de hacer submit
    await waitFor(() => {
      expect(result.current.formData.email).toBe('test@example.com')
      expect(result.current.formData.password).toBe('password123')
    })

    const mockEvent = {
      preventDefault: vi.fn()
    }

    await act(async () => {
      await result.current.handleSubmit(mockEvent)
    })

    expect(mockEvent.preventDefault).toHaveBeenCalled()
    expect(api.authAPI.login).toHaveBeenCalledWith('test@example.com', 'password123')
  })

  it('debe resetear el formulario', () => {
    const { result } = renderHook(() => useLoginForm(), { wrapper })

    result.current.handleChange({
      target: { name: 'email', value: 'test@example.com' }
    })

    result.current.resetForm()

    expect(result.current.formData.email).toBe('')
    expect(result.current.formData.password).toBe('')
  })
})

