"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ClientsPaginationProps {
  page: number;
  totalPages: number;
  total: number;
}

export function ClientsPagination({
  page,
  totalPages,
  total,
}: ClientsPaginationProps) {
  const from = (page - 1) * 5 + 1;
  const to = Math.min(page * 5, total);

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        Mostrando {from} - {to} de {total} clientes
      </p>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          asChild={page > 1}
        >
          {page > 1 ? (
            <Link href={`/dashboard/clients?page=${page - 1}`}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Link>
          ) : (
            <span>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </span>
          )}
        </Button>

        <span className="text-sm text-muted-foreground px-2">
          Página {page} de {totalPages}
        </span>

        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          asChild={page < totalPages}
        >
          {page < totalPages ? (
            <Link href={`/dashboard/clients?page=${page + 1}`}>
              Siguiente
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          ) : (
            <span>
              Siguiente
              <ChevronRight className="h-4 w-4 ml-1" />
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
