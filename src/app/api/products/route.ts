import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category_id = searchParams.get('category_id');
    const search = searchParams.get('search');
    const include_empty_stock = searchParams.get('include_empty_stock') !== 'false'; // Por defecto muestra todo

    // Verificamos si category_id es un UUID válido
    const isUUID = category_id ? /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(category_id) : false;

    // Construimos la consulta base. Si filtramos por slug, necesitamos !inner join
    const selectQuery = (category_id && !isUUID) 
      ? `*, categories!inner(id, name, slug)`
      : `*, categories(id, name, slug)`;

    let query = supabase
      .from('products')
      .select(selectQuery);

    // Modificamos el filtro de stock para que sea condicional
    if (!include_empty_stock) {
      query = query.gt('stock', 0);
    }

    // Aplicar filtro por categoría si existe
    if (category_id) {
      if (isUUID) {
        query = query.eq('category_id', category_id);
      } else {
        query = query.eq('categories.slug', category_id);
      }
    }

    // Aplicar filtro de búsqueda por texto usando ilike (aprovecha índice GIN trigram)
    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    // Ordenar por los más recientes y limitar para evitar sobrecarga de datos
    query = query
      .order('created_at', { ascending: false })
      .range(0, 49); // Retorna los primeros 50 productos (Paginación básica)

    const { data: products, error } = await query;

    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data: products }, { status: 200 });
  } catch (error: any) {
    console.error('Unhandled error in products API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
