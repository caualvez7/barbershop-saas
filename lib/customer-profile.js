/**
 * Recupere ou crie o perfil do cliente para a barbearia especificada.
 * Centraliza o tratamento de busca, herança de dados (nome/whatsapp) e concorrência de inserção.
 */
export async function getOrCreateCustomerProfile(supabase, user, shopData) {
  if (!user || !shopData) return null

  try {
    // 1. Buscar perfil do cliente na barbearia atual
    let { data: customerData } = await supabase
      .from('customers')
      .select('*')
      .eq('user_id', user.id)
      .eq('barbershop_id', shopData.id)
      .maybeSingle()

    if (customerData) {
      return customerData
    }

    // 2. Se não encontrou, buscar dados em outra barbearia da plataforma para reusar nome/whatsapp
    const { data: otherProfiles } = await supabase
      .from('customers')
      .select('name, whatsapp')
      .eq('user_id', user.id)
      .limit(1)

    const name = otherProfiles?.[0]?.name || user.email?.split('@')[0] || 'Cliente'
    const whatsapp = otherProfiles?.[0]?.whatsapp || ''

    // 3. Tentar inserir novo registro de cliente na barbearia
    const { data: newCustomer, error: insertError } = await supabase
      .from('customers')
      .insert({
        user_id: user.id,
        barbershop_id: shopData.id,
        name,
        email: user.email,
        whatsapp
      })
      .select()
      .single()

    if (!insertError && newCustomer) {
      return newCustomer
    }

    // 4. Contingência em caso de corrida ou restrição única
    const { data: fallbackCustomer } = await supabase
      .from('customers')
      .select('*')
      .eq('user_id', user.id)
      .eq('barbershop_id', shopData.id)
      .maybeSingle()

    return fallbackCustomer || null
  } catch (err) {
    console.error('Erro em getOrCreateCustomerProfile:', err)
    return null
  }
}
