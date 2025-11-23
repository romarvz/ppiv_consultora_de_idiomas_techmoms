import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Modal from '../../components/common/Modal'

describe('Modal', () => {
  it('debe renderizar el modal con título y contenido', () => {
    const onClose = vi.fn()
    
    render(
      <Modal title="Test Modal" onClose={onClose}>
        <p>Contenido del modal</p>
      </Modal>
    )

    expect(screen.getByText('Test Modal')).toBeInTheDocument()
    expect(screen.getByText('Contenido del modal')).toBeInTheDocument()
  })

  it('debe llamar onClose cuando se hace clic en el botón de cerrar', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    
    render(
      <Modal title="Test Modal" onClose={onClose}>
        <p>Contenido</p>
      </Modal>
    )

    const closeButton = screen.getByRole('button')
    await user.click(closeButton)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('debe llamar onClose cuando se hace clic en el overlay', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    
    const { container } = render(
      <Modal title="Test Modal" onClose={onClose}>
        <p>Contenido</p>
      </Modal>
    )

    const overlay = container.querySelector('.modal-overlay')
    await user.click(overlay)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('no debe cerrar el modal cuando se hace clic en el contenido', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    
    const { container } = render(
      <Modal title="Test Modal" onClose={onClose}>
        <p>Contenido</p>
      </Modal>
    )

    const content = container.querySelector('.modal-content')
    await user.click(content)

    expect(onClose).not.toHaveBeenCalled()
  })

  it('debe renderizar sin título si no se proporciona', () => {
    const onClose = vi.fn()
    
    render(
      <Modal onClose={onClose}>
        <p>Contenido sin título</p>
      </Modal>
    )

    expect(screen.getByText('Contenido sin título')).toBeInTheDocument()
  })

  it('debe renderizar múltiples elementos hijos', () => {
    const onClose = vi.fn()
    
    render(
      <Modal title="Test Modal" onClose={onClose}>
        <p>Primer párrafo</p>
        <p>Segundo párrafo</p>
        <button>Botón dentro del modal</button>
      </Modal>
    )

    expect(screen.getByText('Primer párrafo')).toBeInTheDocument()
    expect(screen.getByText('Segundo párrafo')).toBeInTheDocument()
    expect(screen.getByText('Botón dentro del modal')).toBeInTheDocument()
  })
})

