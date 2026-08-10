import { ZodType } from 'zod'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import {
  type FieldValues,
  type SubmitHandler,
  useForm,
  type DefaultValues,
} from 'react-hook-form'

interface Props<T extends FieldValues> {
  formSchema: ZodType<T, T>
  defaultValues?: DefaultValues<T>
  onSubmit: SubmitHandler<T>
}

export function useValidatedForm<T extends FieldValues>({
  formSchema,
  defaultValues,
  onSubmit,
}: Props<T>) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    control,
  } = useForm<T>({
    resolver: standardSchemaResolver(formSchema),
    defaultValues,
  })

  return {
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    reset,
    setValue,
    watch,
    control,
  }
}
