import { getClientsWithVehicles, getUserProfile } from "@/lib/supabase/helpers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { ClientsPagination } from "./clients-pagination";
import { Users, Car } from "lucide-react";

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await connection();

  const profile = await getUserProfile();

  if (profile.role !== "mechanic") {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const currentPage = parseInt(params.page || "1", 10);

  const { clients, total, page, pageSize, totalPages } =
    await getClientsWithVehicles(currentPage, 5);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Clientes</h2>
        <p className="text-muted-foreground">
          {total} cliente{total !== 1 ? "s" : ""} registrado
          {total !== 1 ? "s" : ""}
        </p>
      </div>

      {clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border border-dashed rounded-lg">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            No hay clientes registrados aún
          </p>
        </div>
      ) : (
        <>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3 font-medium">Nombre</th>
                  <th className="text-left p-3 font-medium">Email</th>
                  <th className="text-left p-3 font-medium">Teléfono</th>
                  <th className="text-left p-3 font-medium">Vehículo</th>
                  <th className="text-left p-3 font-medium">Placa</th>
                  <th className="text-left p-3 font-medium">Marca</th>
                  <th className="text-left p-3 font-medium">Modelo</th>
                  <th className="text-left p-3 font-medium">Año</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) =>
                  client.vehicles.length > 0 ? (
                    client.vehicles.map((vehicle, vIdx) => (
                      <tr
                        key={`${client.id}-${vehicle.plate}`}
                        className="border-t hover:bg-muted/50"
                      >
                        {vIdx === 0 ? (
                          <>
                            <td className="p-3 font-medium" rowSpan={client.vehicles.length}>
                              {client.full_name || "Sin nombre"}
                            </td>
                            <td className="p-3 text-muted-foreground" rowSpan={client.vehicles.length}>
                              {client.email}
                            </td>
                            <td className="p-3 text-muted-foreground" rowSpan={client.vehicles.length}>
                              {client.phone || "—"}
                            </td>
                          </>
                        ) : null}
                        <td className="p-3">
                          <span className="inline-flex items-center gap-1.5">
                            <Car className="h-3.5 w-3.5" />
                            {vehicle.vehicle_type === "car" ? "Carro" : "Moto"}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-xs">
                          {vehicle.plate}
                        </td>
                        <td className="p-3">{vehicle.brand}</td>
                        <td className="p-3">{vehicle.model}</td>
                        <td className="p-3">{vehicle.year}</td>
                      </tr>
                    ))
                  ) : (
                    <tr key={client.id} className="border-t hover:bg-muted/50">
                      <td className="p-3 font-medium">
                        {client.full_name || "Sin nombre"}
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {client.email}
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {client.phone || "—"}
                      </td>
                      <td className="p-3 text-muted-foreground" colSpan={5}>
                        Sin vehículos registrados
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <ClientsPagination
              page={page}
              totalPages={totalPages}
              total={total}
            />
          )}
        </>
      )}
    </div>
  );
}
