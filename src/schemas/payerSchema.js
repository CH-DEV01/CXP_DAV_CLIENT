// src/schemas/payerSchema.js
import * as z from 'zod';

// Pequeña función para sacar los números de la máscara cuando comparemos Consumo vs Límite
const extractNumber = (val) => Number(val.replace(/[^0-9.-]/g, ''));

export const payerSchema = z.object({
        codigo: z.string().min(1, { message: "Obligatorio" }),
        niu: z.string().min(1, { message: "Obligatorio" }),
        nombre: z.string().min(1, { message: "Obligatorio" }),
        nit: z.string().min(1, { message: "Obligatorio" }),
        numero_linea_credito: z.string().min(1, { message: "Obligatorio" }),
        politica_pago: z.string().min(1, { message: "Obligatorio" }),
        base_calculo: z.string().min(1, { message: "Obligatorio" }),
        tasa_interes: z.string().min(1, { message: "Obligatorio" }),
        tasa_comision: z.string().min(1, { message: "Obligatorio" }),
        limite_linea_credito: z.string().min(1, { message: "Obligatorio" }),
        consumo_actual: z.string().min(1, { message: "Obligatorio" }),
        tipo_desembolso: z.enum(['T_MAS_1', 'DIA_ESPECIFICO']),
        dia_semana: z.string().optional()
    })
    .refine((data) => {
        if (data.tipo_desembolso === 'DIA_ESPECIFICO' && !data.dia_semana) return false;
        return true;
    }, { message: "Seleccione un día", path: ["dia_semana"] })
    .refine((data) => {
        // Convertimos los strings a números solo para compararlos
        if (data.consumo_actual && data.limite_linea_credito) {
            return extractNumber(data.consumo_actual) < extractNumber(data.limite_linea_credito);
        }
        return true;
    }, { message: "El consumo debe ser menor al límite", path: ["consumo_actual"] });