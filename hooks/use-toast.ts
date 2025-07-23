// components/ui/use-toast.ts
"use client"

// Inspired by react-hot-toast library
import * as React from "react"
import { usePathname } from "next/navigation" // <-- ¡Importamos usePathname!

import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"
import { logToastAction } from "@/app/actions" // <-- Importamos tu Server Action

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 3000 // Recomiendo bajarlo para pruebas, como 3 segundos

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
    type: ActionType["ADD_TOAST"]
    toast: ToasterToast
  }
  | {
    type: ActionType["UPDATE_TOAST"]
    toast: Partial<ToasterToast>
  }
  | {
    type: ActionType["DISMISS_TOAST"]
    toastId?: ToasterToast["id"]
  }
  | {
    type: ActionType["REMOVE_TOAST"]
    toastId?: ToasterToast["id"]
  }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
              ...t,
              open: false,
            }
            : t
        ),
      }
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

// Eliminamos la función `toast` global aquí.
// type Toast = Omit<ToasterToast, "id">

// function toast({ ...props }: Toast) { /* ... */ }

function useToast() {
  const [state, setState] = React.useState<State>(memoryState)
  const pathname = usePathname() // <-- Obtenemos la ruta aquí usando el hook

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, []) // Dependencias vacías para que se ejecute una vez

  // Definimos la función `toast` (con otro nombre temporal para evitar conflicto de ámbito)
  // DENTRO del `useToast` para que tenga acceso a `pathname`.
  const callableToast = React.useCallback((props: Omit<ToasterToast, "id">) => {
    const id = genId()

    const update = (newProps: ToasterToast) =>
      dispatch({
        type: "UPDATE_TOAST",
        toast: { ...newProps, id },
      })
    const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

    // Aquí es donde llamamos a logToastAction.
    // Convertimos ReactNode a string.
    logToastAction({
      title: typeof props.title === 'string' ? props.title : '',
      description: typeof props.description === 'string' ? props.description : '',
      variant: props.variant,
      path: pathname, // Pasamos la ruta obtenida de usePathname
    }).catch(error => {
      console.error("Error al intentar registrar la acción del toast:", error);
    });

    dispatch({
      type: "ADD_TOAST",
      toast: {
        ...props,
        id,
        open: true,
        onOpenChange: (open) => {
          if (!open) dismiss()
        },
      },
    })

    return {
      id: id,
      dismiss,
      update,
    }
  }, [pathname]); // Dependencia del useCallback para que se actualice si la ruta cambia

  return {
    ...state,
    toast: callableToast, // Exportamos la función `toast` con la lógica de logueo
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

// Ahora solo exportamos `useToast`.
// En tus componentes, deberás usar `const { toast } = useToast();`
export { useToast }