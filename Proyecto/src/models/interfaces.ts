interface Usuarios {
    cedula: string;
    nombre: string;
    apellido: string;   
    codigo_unico: string;
    correo: string;
    celular: string;
    clave: string;
    facultad: Facultad;
    esAportante: boolean
    tipoAportacion?: Aportacion;
}

interface Aportacion {
    nombre_plan: Plan;
    precio: number;
    precio_Casillero: number;
    gratisAlMes: {
        billar?: { usado: boolean };
        pingPong?: { usado: boolean };
        hockey?: { usado: boolean };
        consolas?: { usado: boolean };
    };
    descuentos: { nombre: string; descuento: number }[];
}

enum Facultad {
    "FIS",
    "FICA",
    "FIQ",
    "FCA",
}

enum Plan {
    AvoCloud = "AvoCloud",
    AvoTech = "AvoTech",
    Avocoder = "Avocoder",
}


const avoCloudPlan: Aportacion = {
    nombre_plan: Plan.AvoCloud,
    precio: 7.99, 
    precio_Casillero: 4.50,
    gratisAlMes: {
        billar: { usado: false },
        pingPong: { usado: false },
    },
    descuentos: [
        { nombre: "taza", descuento: 0.10 }, // 10% off
        { nombre: "billar", descuento: 0.50 }, // $0.50 off
        { nombre: "pingPong", descuento: 0.20 }, // $0.20 off
        { nombre: "eventos", descuento: 0 }, // descuento a definir
    ],
};

const avoTechPlan: Aportacion = {
    nombre_plan: Plan.AvoTech,
    precio: 14.99, 
    precio_Casillero: 3.00,
    gratisAlMes: {
        billar: { usado: false },
        pingPong: { usado: false },
        hockey: { usado: false },
    },
    descuentos: [
        { nombre: "ropa", descuento: 0.10 }, // 10% off
        { nombre: "taza", descuento: 0.25 }, // 25% off
        { nombre: "billar", descuento: 0.50 }, // $0.50 off
        { nombre: "pingPong", descuento: 0.20 }, // $0.20 off
        { nombre: "hockey", descuento: 0.25 }, // $0.25 off
        { nombre: "eventos", descuento: 0 }, // descuento a definir
    ],
};

const avocoderPlan: Aportacion = {
    nombre_plan: Plan.Avocoder,
    precio: 19.99,
    precio_Casillero: 0.00,
    gratisAlMes: {
        billar: { usado: false },
        pingPong: { usado: false },
        hockey: { usado: false },
        consolas:{usado: false}
    },
    descuentos: [
        { nombre: "ropa", descuento: 0.25 }, // 25% off
        { nombre: "taza", descuento: 1.00 }, // 100% off (free)
        { nombre: "billar", descuento: 0.50 }, // $0.50 off
        { nombre: "pingPong", descuento: 0.20 }, // $0.20 off
        { nombre: "hockey", descuento: 0.25 }, // $0.25 off
        { nombre: "consolas", descuento: 0.50 }, // 0.50$ off
        { nombre: "eventos", descuento: 0 }, // descuento a definir
    ],
};

