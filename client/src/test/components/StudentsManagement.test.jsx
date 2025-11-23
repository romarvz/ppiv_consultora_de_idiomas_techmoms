import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import StudentsManagement from '../../components/StudentsManagement'
import * as api from '../../services/api'
import * as apiAdapter from '../../services/apiAdapter'

// Mock de las APIs
vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

vi.mock('../../services/apiAdapter', () => ({
  default: {
    classes: {
      obtenerEstadisticasAsistencia: vi.fn(),
    },
    reports: {
      studentsAtRiskByAttendance: vi.fn(),
    },
  },
}))

vi.mock('../../components/RegisterStudent', () => ({
  default: ({ onSuccess, onCancel }) => (
    <div data-testid="register-student-modal">
      <button onClick={onSuccess}>Registrar</button>
      <button onClick={onCancel}>Cancelar</button>
    </div>
  ),
}))

const mockStudents = [
  {
    _id: '1',
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'juan@example.com',
    dni: '12345678',
    nivel: 'A1',
    condicion: 'activo',
    isActive: true,
    phone: '1234567890',
    createdAt: '2024-01-01',
  },
  {
    _id: '2',
    firstName: 'María',
    lastName: 'González',
    email: 'maria@example.com',
    dni: '87654321',
    nivel: 'B1',
    condicion: 'inscrito',
    isActive: true,
    phone: '0987654321',
    createdAt: '2024-01-02',
  },
]

const renderStudentsManagement = () => {
  return render(
    <BrowserRouter>
      <StudentsManagement onBack={vi.fn()} />
    </BrowserRouter>
  )
}

describe('StudentsManagement - CRUD', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock por defecto para get students
    api.default.get.mockImplementation((url) => {
      if (url.includes('/students/stats')) {
        return Promise.resolve({
          data: {
            success: true,
            data: {
              overview: { total: 2, active: 2, inactive: 0, graduated: 0 },
            },
          },
        })
      }
      if (url.includes('/students')) {
        return Promise.resolve({
          data: {
            success: true,
            data: {
              students: mockStudents,
              pagination: {
                total: 2,
                pages: 1,
                hasPrev: false,
                hasNext: false,
              },
            },
          },
        })
      }
      return Promise.reject(new Error('Unknown endpoint'))
    })

    // Mock para estadísticas de asistencia
    apiAdapter.default.classes.obtenerEstadisticasAsistencia.mockResolvedValue({
      data: {
        success: true,
        data: {
          porcentajeAsistencia: 85,
          esAlumnoRegular: true,
          totalClases: 20,
          clasesAsistidas: 17,
        },
      },
    })
  })

  describe('Read - Listar estudiantes', () => {
    it('debe cargar y mostrar la lista de estudiantes', async () => {
      renderStudentsManagement()

      await waitFor(() => {
        expect(screen.getByText('Gestión de Estudiantes')).toBeInTheDocument()
      })

      await waitFor(() => {
        expect(screen.getByText('Juan Pérez')).toBeInTheDocument()
        expect(screen.getByText('María González')).toBeInTheDocument()
      })
    })

    it('debe mostrar estadísticas de estudiantes', async () => {
      renderStudentsManagement()

      await waitFor(() => {
        expect(screen.getByText(/Total de Estudiantes/i)).toBeInTheDocument()
      })

      // Buscar el número 2 dentro del contexto de "Total de Estudiantes"
      const totalSection = screen.getByText(/Total de Estudiantes/i).closest('div')
      expect(totalSection).toBeInTheDocument()
      expect(totalSection?.textContent).toContain('2')
    })

  })

  describe('Create - Crear estudiante', () => {
    it('debe abrir el modal de registro al hacer clic en "Agregar Estudiante"', async () => {
      const user = userEvent.setup()
      renderStudentsManagement()

      await waitFor(() => {
        expect(screen.getByText('Agregar Estudiante')).toBeInTheDocument()
      })

      const addButton = screen.getByText('Agregar Estudiante')
      await user.click(addButton)

      expect(screen.getByTestId('register-student-modal')).toBeInTheDocument()
    })
  })

  describe('Update - Editar estudiante', () => {
    it('debe abrir el modal de edición al hacer clic en el botón editar', async () => {
      const user = userEvent.setup()
      
      // Mock para obtener cursos del estudiante
      api.default.get.mockImplementation((url) => {
        if (url.includes('/cursos/estudiante/')) {
          return Promise.resolve({
            data: {
              success: true,
              data: [],
            },
          })
        }
        if (url.includes('/students/stats')) {
          return Promise.resolve({
            data: {
              success: true,
              data: {
                overview: { total: 2, active: 2, inactive: 0 },
              },
            },
          })
        }
        if (url.includes('/students')) {
          return Promise.resolve({
            data: {
              success: true,
              data: {
                students: mockStudents,
                pagination: {
                  total: 2,
                  pages: 1,
                  hasPrev: false,
                  hasNext: false,
                },
              },
            },
          })
        }
        return Promise.reject(new Error('Unknown endpoint'))
      })

      renderStudentsManagement()

      await waitFor(() => {
        expect(screen.getByText('Juan Pérez')).toBeInTheDocument()
      })

      // Buscar botones de editar (puede haber múltiples)
      const editButtons = screen.getAllByTitle('Editar')
      await user.click(editButtons[0])

      // Verificar que se muestra el modal de edición
      await waitFor(() => {
        expect(screen.getByText(/Editar Estudiante/i)).toBeInTheDocument()
      })
    })
  })

  describe('Delete - Eliminar/Desactivar estudiante', () => {
    it('debe mostrar confirmación antes de desactivar un estudiante', async () => {
      const user = userEvent.setup()
      window.confirm = vi.fn(() => true)

      api.default.delete.mockResolvedValue({
        data: { success: true },
      })

      renderStudentsManagement()

      await waitFor(() => {
        expect(screen.getByText('Juan Pérez')).toBeInTheDocument()
      })

      const deactivateButtons = screen.getAllByTitle('Desactivar')
      await user.click(deactivateButtons[0])

      expect(window.confirm).toHaveBeenCalledWith(
        expect.stringContaining('desactivar')
      )
    })

    it('debe reactivar un estudiante inactivo', async () => {
      const user = userEvent.setup()
      window.confirm = vi.fn(() => true)

      const inactiveStudent = {
        ...mockStudents[0],
        isActive: false,
        condicion: 'inactivo',
      }

      api.default.get.mockImplementation((url) => {
        if (url.includes('/students/stats')) {
          return Promise.resolve({
            data: {
              success: true,
              data: {
                overview: { total: 1, active: 0, inactive: 1 },
              },
            },
          })
        }
        if (url.includes('/students')) {
          return Promise.resolve({
            data: {
              success: true,
              data: {
                students: [inactiveStudent],
                pagination: {
                  total: 1,
                  pages: 1,
                  hasPrev: false,
                  hasNext: false,
                },
              },
            },
          })
        }
        return Promise.reject(new Error('Unknown endpoint'))
      })

      api.default.patch.mockResolvedValue({
        data: { success: true },
      })

      renderStudentsManagement()

      await waitFor(() => {
        expect(screen.getByText('Juan Pérez')).toBeInTheDocument()
      })

      const reactivateButtons = screen.getAllByTitle('Reactivar')
      await user.click(reactivateButtons[0])

      expect(window.confirm).toHaveBeenCalled()
      expect(api.default.patch).toHaveBeenCalledWith(
        expect.stringContaining('/students/1/reactivate')
      )
    })
  })

  describe('Paginación', () => {
    it('debe mostrar controles de paginación cuando hay múltiples páginas', async () => {
      api.default.get.mockImplementation((url) => {
        if (url.includes('/students/stats')) {
          return Promise.resolve({
            data: {
              success: true,
              data: {
                overview: { total: 25, active: 20, inactive: 5 },
              },
            },
          })
        }
        if (url.includes('/students')) {
          return Promise.resolve({
            data: {
              success: true,
              data: {
                students: mockStudents,
                pagination: {
                  total: 25,
                  pages: 3,
                  hasPrev: false,
                  hasNext: true,
                },
              },
            },
          })
        }
        return Promise.reject(new Error('Unknown endpoint'))
      })

      renderStudentsManagement()

      await waitFor(() => {
        expect(screen.getByText(/Página/i)).toBeInTheDocument()
      })
    })
  })
})

