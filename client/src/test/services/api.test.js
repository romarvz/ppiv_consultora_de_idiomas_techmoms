import { describe, it, expect, beforeEach, vi } from 'vitest'

// Crear la instancia mock dentro de una variable que se puede compartir
let mockAxiosInstance

// Mock de axios ANTES de importar el módulo api
vi.mock('axios', () => {
  // Crear la instancia dentro del mock
  const instance = {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  }
  
  return {
    default: {
      create: vi.fn(() => instance),
    },
    // Exportar la instancia para uso en los tests
    __mockInstance: instance,
  }
})

// Ahora importar el módulo después del mock
import axios from 'axios'
import { authAPI, authUtils } from '../../services/api'

// Obtener la instancia mock después de que se haya creado
mockAxiosInstance = axios.create()

// Mock de localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
global.localStorage = localStorageMock

describe('authAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
    // Limpiar los mocks de la instancia de axios
    mockAxiosInstance.post.mockClear()
    mockAxiosInstance.get.mockClear()
    mockAxiosInstance.put.mockClear()
  })

  describe('login', () => {
    it('debe hacer login exitosamente y guardar token y usuario', async () => {
      const mockResponse = {
        data: {
          data: {
            token: 'mock-token-123',
            user: {
              _id: '123',
              email: 'test@example.com',
              role: 'estudiante',
            },
          },
        },
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      const result = await authAPI.login('test@example.com', 'password123')

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password123',
      })
      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'mock-token-123')
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'user',
        JSON.stringify(mockResponse.data.data.user)
      )
    })

    it('debe manejar errores de login', async () => {
      const mockError = {
        response: {
          data: {
            message: 'Credenciales inválidas',
          },
        },
      }

      mockAxiosInstance.post.mockRejectedValue(mockError)

      await expect(
        authAPI.login('test@example.com', 'wrongpassword')
      ).rejects.toEqual(mockError.response.data)
    })
  })

  describe('logout', () => {
    it('debe limpiar localStorage al hacer logout', async () => {
      mockAxiosInstance.post.mockResolvedValue({})

      await authAPI.logout()

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/logout')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user')
    })

    it('debe limpiar localStorage incluso si la API falla', async () => {
      mockAxiosInstance.post.mockRejectedValue(new Error('Network error'))

      await authAPI.logout()

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user')
    })
  })

  describe('getProfile', () => {
    it('debe obtener el perfil del usuario', async () => {
      const mockUser = {
        _id: '123',
        email: 'test@example.com',
        role: 'estudiante',
      }

      const mockResponse = {
        data: {
          data: {
            user: mockUser,
          },
        },
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await authAPI.getProfile()

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/auth/profile')
      expect(result.user).toEqual(mockUser)
    })
  })

  describe('verifyToken', () => {
    it('debe verificar que el token es válido', async () => {
      const mockResponse = {
        data: {
          data: {
            valid: true,
            user: {
              _id: '123',
              email: 'test@example.com',
            },
          },
        },
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      const result = await authAPI.verifyToken()

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/auth/verify-token')
      expect(result.valid).toBe(true)
    })
  })

  describe('changePasswordForced', () => {
    it('debe cambiar la contraseña forzada y actualizar localStorage', async () => {
      const mockUser = {
        _id: '123',
        email: 'test@example.com',
        mustChangePassword: true,
      }

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUser))

      const mockResponse = {
        data: {
          data: {
            success: true,
          },
        },
      }

      mockAxiosInstance.put.mockResolvedValue(mockResponse)

      await authAPI.changePasswordForced('newpassword123')

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/auth/change-password-forced', {
        newPassword: 'newpassword123',
      })
      expect(localStorageMock.setItem).toHaveBeenCalled()
    })
  })
})

describe('authUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('isAuthenticated', () => {
    it('debe retornar true si hay token y usuario', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'token') return 'mock-token'
        if (key === 'user') return JSON.stringify({ _id: '123' })
        return null
      })

      expect(authUtils.isAuthenticated()).toBe(true)
    })

    it('debe retornar false si no hay token', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'token') return null
        if (key === 'user') return JSON.stringify({ _id: '123' })
        return null
      })

      expect(authUtils.isAuthenticated()).toBe(false)
    })

    it('debe retornar false si no hay usuario', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'token') return 'mock-token'
        if (key === 'user') return null
        return null
      })

      expect(authUtils.isAuthenticated()).toBe(false)
    })
  })

  describe('getCurrentUser', () => {
    it('debe retornar el usuario parseado desde localStorage', () => {
      const mockUser = { _id: '123', email: 'test@example.com' }
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUser))

      expect(authUtils.getCurrentUser()).toEqual(mockUser)
    })

    it('debe retornar null si no hay usuario en localStorage', () => {
      localStorageMock.getItem.mockReturnValue(null)

      expect(authUtils.getCurrentUser()).toBeNull()
    })

    it('debe retornar null si el JSON es inválido', () => {
      localStorageMock.getItem.mockReturnValue('invalid-json')

      expect(authUtils.getCurrentUser()).toBeNull()
    })
  })

  describe('getUserRole', () => {
    it('debe retornar el rol del usuario', () => {
      const mockUser = { _id: '123', role: 'estudiante' }
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUser))

      expect(authUtils.getUserRole()).toBe('estudiante')
    })

    it('debe retornar null si no hay usuario', () => {
      localStorageMock.getItem.mockReturnValue(null)

      expect(authUtils.getUserRole()).toBeNull()
    })
  })

  describe('hasRole', () => {
    it('debe verificar si el usuario tiene un rol específico', () => {
      const mockUser = { _id: '123', role: 'admin' }
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUser))

      expect(authUtils.hasRole('admin')).toBe(true)
      expect(authUtils.hasRole('estudiante')).toBe(false)
    })
  })

  describe('clearAuth', () => {
    it('debe limpiar token y usuario de localStorage', () => {
      authUtils.clearAuth()

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user')
    })
  })
})
