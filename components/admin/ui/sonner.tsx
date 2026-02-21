import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      position="top-right"
      toastOptions={{
        style: {
          background: 'white',
          border: '1px solid rgb(226, 232, 240)',
          borderRadius: '0.5rem',
          padding: '1rem',
          fontSize: '0.875rem',
          fontWeight: '500',
          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        },
        classNames: {
          success: 'group-[.toaster]:!bg-white group-[.toaster]:!border-green-200 group-[.toaster]:!text-green-900',
          error: 'group-[.toaster]:!bg-white group-[.toaster]:!border-red-200 group-[.toaster]:!text-red-900',
          warning: 'group-[.toaster]:!bg-white group-[.toaster]:!border-amber-200 group-[.toaster]:!text-amber-900',
          info: 'group-[.toaster]:!bg-white group-[.toaster]:!border-blue-200 group-[.toaster]:!text-blue-900',
        },
      }}
      icons={{
        success: <CircleCheckIcon className="size-5 text-green-600" />,
        info: <InfoIcon className="size-5 text-blue-600" />,
        warning: <TriangleAlertIcon className="size-5 text-amber-600" />,
        error: <OctagonXIcon className="size-5 text-red-600" />,
        loading: <Loader2Icon className="size-5 text-slate-600 animate-spin" />,
      }}
      {...props}
    />
  )
}

export { Toaster }
