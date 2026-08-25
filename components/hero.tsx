
export function Hero() {
  return (
    <div className="relative flex flex-col items-center w-full overflow-hidden rounded-none border-0 h-3'0">
     

      <div className="relative z-10 flex flex-col gap-10 items-center py-20 px-6 text-center">
        <h1 className="text-3xl lg:text-6xl !leading-tight max-w-5xl">
          La plataforma digital para el{" "}
          <span className="text-orange-500">Taller Moderno</span>
        </h1>

        <div className="w-full max-w-md p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />

        <p className="text-lg max-w-3xl text-foreground/80">
          MecaApp es una plataforma digital que permite a los talleres mecánicos
          gestionar sus operaciones de manera eficiente y efectiva. Con MecaApp,
          los talleres pueden llevar un registro de sus clientes, vehículos,
          servicios y facturación, todo en un solo lugar.
        </p>
      </div>
    </div>
  );
}
