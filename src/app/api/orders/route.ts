import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Instanciamos el cliente del servidor de forma directa para el bypass de tipos en este endpoint corporativo
const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customer_name, customer_phone, total, items } = body;

    // Validación de campos obligatorios en backend
    if (!customer_name || !customer_phone || !total || !items) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios en la petición.' },
        { status: 400 }
      );
    }

    // Insertamos usando una estructura limpia (al no pasarle <Database> genérico al cliente aquí,
    // TypeScript permite enviar el objeto literal con las columnas reales de la base de datos)
    const { data, error } = await supabaseServer
      .from('orders')
      .insert([
        {
          customer_name: String(customer_name).trim(),
          customer_phone: String(customer_phone).trim(),
          total: Number(total),
          items: items, // Se mapea directo a la columna JSONB
          status: 'pending'
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error de Supabase al insertar la orden:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error: any) {
    console.error('Error crítico en el endpoint de órdenes:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}