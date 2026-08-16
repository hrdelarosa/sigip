import { UploadIcon } from 'lucide-react'
import { useRef } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useUploadCommissionAnnex } from '../hooks/useUploadCommissionAnnex'

const MAX_SIZE = 5 * 1024 * 1024

export function CommissionAnnexUpload({ incidentId }: { incidentId: string }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const mutation = useUploadCommissionAnnex(incidentId)

  function selectFile(file?: File) {
    if (!file) return
    if (file.type !== 'application/pdf' || file.size > MAX_SIZE) {
      toast.error('Seleccione un PDF de hasta 5 MB')
      return
    }
    mutation.mutate(file)
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={mutation.isPending}
        onClick={() => inputRef.current?.click()}
      >
        {mutation.isPending ? (
          <Spinner data-icon="inline-start" />
        ) : (
          <UploadIcon data-icon="inline-start" />
        )}
        Agregar oficio
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        aria-label="Oficio de comisión PDF"
        className="sr-only !w-px"
        onChange={(event) => {
          selectFile(event.target.files?.[0])
          event.target.value = ''
        }}
      />
    </>
  )
}
