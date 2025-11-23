# Tests del Frontend

Este directorio contiene todos los tests unitarios y de integración para el frontend de la aplicación.

## Estructura

```
src/test/
├── setup.js                 # Configuración global de tests
├── utils/
│   ├── testUtils.jsx        # Utilidades y helpers para tests
│   ├── formatting.test.js   # Tests para utilidades de formateo
│   └── routes.test.js        # Tests para utilidades de rutas
├── hooks/
│   └── useAuth.test.jsx     # Tests para el hook de autenticación
├── components/
│   ├── Login.test.jsx       # Tests para el componente Login
│   ├── ProtectedRoute.test.jsx # Tests para rutas protegidas
│   ├── Modal.test.jsx        # Tests para el componente Modal
│   ├── WhatsAppButton.test.jsx # Tests para el botón de WhatsApp
│   ├── Header.test.jsx      # Tests para el Header
│   ├── StudentsManagement.test.jsx # Tests CRUD de estudiantes
│   ├── TeachersManagement.test.jsx # Tests CRUD de profesores
│   └── CourseManagement.test.jsx  # Tests CRUD de cursos
└── services/
    └── api.test.js          # Tests para servicios de API
```

## Configuración

Los tests están configurados usando:
- **Vitest**: Framework de testing rápido y moderno
- **React Testing Library**: Para testing de componentes React
- **jsdom**: Entorno DOM simulado para tests

## Ejecutar Tests

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch
npm run test:watch

# Ejecutar tests con UI interactiva
npm run test:ui

# Ejecutar tests con cobertura
npm run test:coverage
```

## Escribir Nuevos Tests

### Estructura básica de un test

```javascript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Component from '../components/Component'

describe('Component', () => {
  beforeEach(() => {
    // Setup antes de cada test
  })

  it('debe renderizar correctamente', () => {
    render(<Component />)
    expect(screen.getByText('Texto esperado')).toBeInTheDocument()
  })
})
```

### Helpers disponibles

El archivo `testUtils.jsx` proporciona helpers útiles:

- `renderWithProviders`: Renderiza componentes con providers necesarios (Router, AuthProvider)
- `createMockUser`: Crea un usuario mock para tests
- `mockApiResponse`: Mockea respuestas de API exitosas
- `mockApiError`: Mockea errores de API

### Ejemplo de uso de helpers

```javascript
import { renderWithProviders, createMockUser } from '../utils/testUtils'

it('debe mostrar el dashboard del usuario', () => {
  const mockUser = createMockUser({ role: 'estudiante' })
  
  renderWithProviders(<Dashboard />, {
    initialAuthState: {
      user: mockUser,
      token: 'mock-token'
    }
  })
  
  expect(screen.getByText('Dashboard')).toBeInTheDocument()
})
```

## Buenas Prácticas

1. **Un test por comportamiento**: Cada test debe verificar un comportamiento específico
2. **Nombres descriptivos**: Usa nombres que describan claramente qué se está probando
3. **Setup y cleanup**: Usa `beforeEach` y `afterEach` para mantener los tests aislados
4. **Mocking**: Mockea dependencias externas (APIs, localStorage, etc.)
5. **Accesibilidad**: Usa queries accesibles de React Testing Library (`getByRole`, `getByLabelText`, etc.)

## Cobertura

El objetivo es mantener una cobertura de código superior al 80%. Puedes ver el reporte de cobertura ejecutando:

```bash
npm run test:coverage
```

El reporte se generará en `coverage/index.html`.

## Troubleshooting

### Error: "Cannot find module"
- Asegúrate de que todas las dependencias estén instaladas: `npm install`
- Verifica que las rutas de importación sean correctas

### Error: "localStorage is not defined"
- El setup.js ya incluye un mock de localStorage, pero si necesitas personalizarlo, puedes hacerlo en tu test

### Tests lentos
- Asegúrate de limpiar mocks entre tests
- Usa `vi.clearAllMocks()` en `beforeEach`

