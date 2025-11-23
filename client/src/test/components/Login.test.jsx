import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import Login from '../../pages/Login'
import * as api from '../../services/api'

// Mock del hook useAuth
vi.mock('../../hooks/useAuth.jsx', async () => {
  const actual = await vi.importActual('../../hooks/useAuth.jsx')
  return {
    ...actual,
    useAuth: vi.fn(),
    useLoginForm: vi.fn(),
  }
})

// Mock de useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

import { useAuth, useLoginForm } from '../../hooks/useAuth.jsx'

const renderLogin = () => {
  return render(
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  )
}

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNavigate.mockClear()
  })

  it('debe renderizar el formulario de login', () => {
    useAuth.mockReturnValue({
      user: null,
      error: null,
      loading: false,
      isAuthenticated: false,
      getRedirectPath: () => '/dashboard/student',
    })

    useLoginForm.mockReturnValue({
      formData: { email: '', password: '' },
      isSubmitting: false,
      handleChange: vi.fn(),
      handleSubmit: vi.fn(),
    })

    renderLogin()

    expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument()
    expect(screen.getByLabelText('Correo Electrónico')).toBeInTheDocument()
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /ingresar/i })).toBeInTheDocument()
  })

  it('debe mostrar información importante para usuarios', () => {
    useAuth.mockReturnValue({
      user: null,
      error: null,
      loading: false,
      isAuthenticated: false,
      getRedirectPath: () => '/dashboard/student',
    })

    useLoginForm.mockReturnValue({
      formData: { email: '', password: '' },
      isSubmitting: false,
      handleChange: vi.fn(),
      handleSubmit: vi.fn(),
    })

    renderLogin()

    expect(screen.getByText(/Información importante/i)).toBeInTheDocument()
    expect(screen.getByText(/Estudiantes y Profesores/i)).toBeInTheDocument()
    expect(screen.getByText(/Administradores/i)).toBeInTheDocument()
  })

  it('debe mostrar error cuando hay un error de autenticación', () => {
    const errorMessage = 'Credenciales inválidas'

    useAuth.mockReturnValue({
      user: null,
      error: errorMessage,
      loading: false,
      isAuthenticated: false,
      getRedirectPath: () => '/dashboard/student',
    })

    useLoginForm.mockReturnValue({
      formData: { email: '', password: '' },
      isSubmitting: false,
      handleChange: vi.fn(),
      handleSubmit: vi.fn(),
    })

    renderLogin()

    expect(screen.getByText(errorMessage)).toBeInTheDocument()
  })

  it('debe mostrar estado de carga cuando está verificando credenciales', () => {
    useAuth.mockReturnValue({
      user: null,
      error: null,
      loading: true,
      isAuthenticated: false,
      getRedirectPath: () => '/dashboard/student',
    })

    useLoginForm.mockReturnValue({
      formData: { email: '', password: '' },
      isSubmitting: false,
      handleChange: vi.fn(),
      handleSubmit: vi.fn(),
    })

    renderLogin()

    expect(screen.getByText(/Verificando credenciales/i)).toBeInTheDocument()
  })

  it('debe permitir ingresar email y contraseña', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()

    useAuth.mockReturnValue({
      user: null,
      error: null,
      loading: false,
      isAuthenticated: false,
      getRedirectPath: () => '/dashboard/student',
    })

    useLoginForm.mockReturnValue({
      formData: { email: '', password: '' },
      isSubmitting: false,
      handleChange,
      handleSubmit: vi.fn(),
    })

    renderLogin()

    const emailInput = screen.getByLabelText('Correo Electrónico')
    const passwordInput = screen.getByLabelText('Contraseña')

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')

    expect(handleChange).toHaveBeenCalled()
  })

  it('debe deshabilitar el botón cuando está enviando', () => {
    useAuth.mockReturnValue({
      user: null,
      error: null,
      loading: false,
      isAuthenticated: false,
      getRedirectPath: () => '/dashboard/student',
    })

    useLoginForm.mockReturnValue({
      formData: { email: 'test@example.com', password: 'password123' },
      isSubmitting: true,
      handleChange: vi.fn(),
      handleSubmit: vi.fn(),
    })

    renderLogin()

    const submitButton = screen.getByRole('button', { name: /ingresando/i })
    expect(submitButton).toBeDisabled()
  })

  it('debe redirigir si el usuario ya está autenticado', async () => {
    const mockUser = {
      _id: '123',
      email: 'test@example.com',
      role: 'estudiante',
    }

    useAuth.mockReturnValue({
      user: mockUser,
      error: null,
      loading: false,
      isAuthenticated: true,
      getRedirectPath: () => '/dashboard/student',
    })

    useLoginForm.mockReturnValue({
      formData: { email: '', password: '' },
      isSubmitting: false,
      handleChange: vi.fn(),
      handleSubmit: vi.fn(),
    })

    renderLogin()

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard/student', { replace: true })
    })
  })

  it('debe llamar handleSubmit cuando se envía el formulario', async () => {
    const user = userEvent.setup()
    const handleSubmit = vi.fn((e) => {
      e.preventDefault()
      return Promise.resolve()
    })

    useAuth.mockReturnValue({
      user: null,
      error: null,
      loading: false,
      isAuthenticated: false,
      getRedirectPath: () => '/dashboard/student',
    })

    useLoginForm.mockReturnValue({
      formData: { email: 'test@example.com', password: 'password123' },
      isSubmitting: false,
      handleChange: vi.fn(),
      handleSubmit,
    })

    renderLogin()

    const submitButton = screen.getByRole('button', { name: /ingresar/i })
    await user.click(submitButton)

    expect(handleSubmit).toHaveBeenCalled()
  })
})

