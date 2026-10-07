import { createElement } from 'react'
import type { ReactNode } from 'react'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

const state = vi.hoisted(() => ({
  auth: { data: { office: { id: 'office-a' }, permissions: [] as string[] } },
  offices: [
    { id: 'office-a', code: 'A', name: 'Office A', isActive: true },
    { id: 'office-b', code: 'B', name: 'Office B', isActive: true },
  ],
  formValues: {} as Record<string, unknown>,
  submit: undefined as undefined | ((event?: unknown) => unknown),
  formSubmit: undefined as undefined | (() => unknown),
  officeField: undefined as undefined | { value: string; onChange: (value: string) => void; disabled: boolean; nameOnly: boolean; offices: Array<{ id: string; name: string; code: string }> },
  createMutate: vi.fn(),
  updateMutate: vi.fn(),
  apiRequest: vi.fn(),
  officeQuery: { isPending: false, isError: false, refetch: vi.fn() },
  retryClick: undefined as undefined | (() => unknown),
}))

vi.mock('@/hooks/useValidatedForm', () => ({
  useValidatedForm: (options: { defaultValues: Record<string, unknown>; onSubmit: (values: Record<string, unknown>) => unknown }) => {
    state.formValues = { ...options.defaultValues, employeeNumber: 'EMP-1', fullName: 'Persona', hireDate: null }
    state.formSubmit = () => options.onSubmit(state.formValues)
    return {
      register: () => ({}), handleSubmit: () => state.formSubmit?.(),
      errors: {}, reset: vi.fn(), control: {},
    }
  },
}))
vi.mock('react-hook-form', () => ({
  Controller: ({ name, render }: { name: string; render: (props: { field: { value: string; onChange: (value: string) => void }; fieldState: { error?: undefined } }) => ReactNode }) => render({
    field: {
      value: String(state.formValues[name] ?? ''),
      onChange: (value: string) => { state.formValues[name] = value },
    },
    fieldState: {},
  }),
}))
vi.mock('@/components/form-dialog', () => ({ FormDialog: ({ children, onSubmit }: { children: ReactNode; onSubmit: (event?: unknown) => unknown }) => {
  state.submit = onSubmit
  return createElement('div', null, children)
} }))
vi.mock('@/components/ui/input', () => ({ Input: () => null }))
vi.mock('@/components/ui/button', () => ({ Button: ({ children, onClick }: { children: ReactNode; onClick?: () => unknown }) => { state.retryClick = onClick; return createElement('button', { onClick }, children) } }))
vi.mock('@/components/ui/field', () => ({ Field: ({ children }: { children: ReactNode }) => createElement('div', null, children), FieldError: () => null, FieldLabel: () => null }))
vi.mock('../hooks/useCreateEmployee', () => ({ useCreateEmployee: () => ({ mutate: state.createMutate, isPending: false, error: null, reset: vi.fn() }) }))
vi.mock('../hooks/useUpdateEmployee', () => ({ useUpdateEmployee: () => ({ mutate: state.updateMutate, isPending: false, error: null, reset: vi.fn() }) }))
vi.mock('../hooks/useEmployeeOfficeOptions', () => ({ useEmployeeOfficeOptions: () => ({ data: state.offices.map(({ id, name, code }) => ({ id, name, code })), ...state.officeQuery }) }))
vi.mock('@/modules/auth/hooks/useAuth', () => ({ useAuth: () => state.auth, hasPermission: (permissions: string[] | undefined, permission: string) => permissions?.includes(permission) ?? false }))
vi.mock('@/modules/administration/users/components/UserOfficeField', () => ({ UserOfficeField: (props: NonNullable<typeof state.officeField>) => {
  state.officeField = props
  return createElement('select', { value: props.value, disabled: props.disabled, onChange: (event: { target: { value: string } }) => props.onChange(event.target.value) }, props.offices.map((office) => createElement('option', { key: office.id, value: office.id }, props.nameOnly ? office.name : `${office.code} · ${office.name}`)))
} }))
vi.mock('./EmployeeDatePickerField', () => ({ EmployeeDatePickerField: () => null }))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))
vi.mock('@/lib/api/api-client', () => ({ apiRequest: state.apiRequest }))

import EmployeeCreate from './EmployeeCreate'
import EmployeeEdit from './EmployeeEdit'
import { createEmployee, updateEmployee } from '../api/employees.api'

const employee = {
  id: 'employee-b', officeId: 'office-b', employeeNumber: 'EMP-2', fullName: 'Persona B',
  hireDate: null, status: 'ACTIVE' as const, createdAt: '', updatedAt: '',
}

afterEach(() => {
  state.auth = { data: { office: { id: 'office-a' }, permissions: [] } }
  state.formValues = {}
  state.submit = undefined
  state.formSubmit = undefined
  state.officeField = undefined
  state.createMutate.mockReset()
  state.updateMutate.mockReset()
  state.apiRequest.mockReset()
  state.officeQuery = { isPending: false, isError: false, refetch: vi.fn() }
  state.retryClick = undefined
})

describe('employee office form wiring', () => {
  it('shows actor office by default and submits a selected office on create', async () => {
    state.auth.data.permissions = ['offices:access-all']
    renderToString(createElement(EmployeeCreate))
    expect(state.officeField?.value).toBe('office-a')
    expect(state.officeField?.offices.map((office) => office.id)).toEqual(['office-a', 'office-b'])
    expect(state.officeField?.nameOnly).toBe(true)
    expect(state.officeField?.offices.map(({ name, code }) => `${name} ${code}`)).toEqual(['Office A A', 'Office B B'])
    state.officeField?.onChange('office-b')
    await state.submit?.()
    expect(state.createMutate).toHaveBeenCalledWith(expect.objectContaining({ input: expect.objectContaining({ officeId: 'office-b' }) }), expect.any(Object))
  })

  it('limits a local creator to their own office and submits that default', async () => {
    renderToString(createElement(EmployeeCreate))
    expect(state.officeField?.value).toBe('office-a')
    expect(state.officeField?.offices.map((office) => office.id)).toEqual(['office-a'])
    expect(state.officeField?.disabled).toBe(true)
    await state.submit?.()
    expect(state.createMutate).toHaveBeenCalledWith(expect.objectContaining({ input: expect.objectContaining({ officeId: 'office-a' }) }), expect.any(Object))
  })

  it('shows employee B office read-only to a local actor and keeps it when global actor A edits B', async () => {
    state.auth.data.permissions = ['offices:access-all']
    renderToString(createElement(EmployeeEdit, { employee, open: true, onOpenChange: vi.fn() }))
    expect(state.officeField?.value).toBe('office-b')
    expect(state.officeField?.nameOnly).toBe(true)
    await state.submit?.()
    expect(state.updateMutate).toHaveBeenCalledWith(expect.objectContaining({ id: employee.id, input: expect.not.objectContaining({ officeId: expect.anything() }) }), expect.any(Object))

    state.auth.data.permissions = []
    renderToString(createElement(EmployeeEdit, { employee, open: true, onOpenChange: vi.fn() }))
    expect(state.officeField?.value).toBe('office-b')
    expect(state.officeField?.disabled).toBe(true)
  })

  it('sends officeId through the actual create/update API adapters', async () => {
    await createEmployee({ input: { employeeNumber: 'EMP-1', fullName: 'Persona', officeId: 'office-b' } })
    await updateEmployee({ id: employee.id, input: { officeId: 'office-c' } })
    expect(state.apiRequest).toHaveBeenNthCalledWith(1, '/employees', expect.objectContaining({ method: 'POST', body: expect.objectContaining({ officeId: 'office-b' }) }))
    expect(state.apiRequest).toHaveBeenNthCalledWith(2, `/employees/${employee.id}`, expect.objectContaining({ method: 'PATCH', body: { officeId: 'office-c' } }))
  })

  it('shows lookup failures with a retry action and keeps current office visible when absent from options', async () => {
    state.auth.data.permissions = ['employees:update', 'offices:access-all']
    state.officeQuery = { isPending: false, isError: true, refetch: vi.fn() }
    state.offices = [{ id: 'office-a', code: 'A', name: 'Office A', isActive: true }]
    const markup = renderToString(createElement(EmployeeEdit, { employee, open: true, onOpenChange: vi.fn() }))
    expect(markup).toContain('No se pudieron cargar las oficinas')
    expect(state.officeField?.offices.map(({ id }) => id)).toEqual(['office-a', 'office-b'])
    expect(state.officeField?.offices.find(({ id }) => id === 'office-b')).toMatchObject({ name: 'Oficina actual', code: '' })
    await state.retryClick?.()
    expect(state.officeQuery.refetch).toHaveBeenCalledOnce()
    expect(state.officeField?.value).toBe('office-b')
  })
})
