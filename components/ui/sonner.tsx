"use client"

import type { ComponentProps } from "react"
import { Toaster as SonnerToaster } from "sonner"

export function Toaster(props: ComponentProps<typeof SonnerToaster>) {
  return (
    <SonnerToaster
      theme="dark"
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: "border border-border bg-background text-foreground",
          description: "text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}
