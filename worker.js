export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Usa KV storage per cache persistente (richiede binding in wrangler.toml)
    const cache = env.CRYPTO_CACHE; // KV namespace
    
    try {
      // Tenta di fetchare dati freschi
      const [coinsRes, btcRes] = await Promise.all([
        fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false'),
        fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd')
      ]);

      if (!coinsRes.ok || !btcRes.ok) {
        throw new Error(`CoinGecko error: ${coinsRes.status}, ${btcRes.status}`);
      }

      const coinsData = await coinsRes.json();
      const btcData = await btcRes.json();
      const btcPrice = btcData?.bitcoin?.usd ?? null;

      const freshData = {
        coins: coinsData,
        btcPrice: btcPrice,
        lastSuccessfulUpdate: new Date().toISOString(),
        lastError: null
      };

      // Salva in KV (persistente)
      await cache.put('crypto-data', JSON.stringify(freshData));
      
      // Restituisci con cache edge 5 min
      return new Response(JSON.stringify(freshData), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300',
          ...corsHeaders
        }
      });

    } catch (error) {
      // ERRORE: Recupera dati cached da KV
      const cached = await cache.get('crypto-data');
      
      if (cached) {
        const cachedData = JSON.parse(cached);
        // Aggiungi info errore ma MANTIENI dati cached
        const responseData = {
          ...cachedData,
          lastError: {
            message: error.message,
            timestamp: new Date().toISOString()
          }
        };
        
        return new Response(JSON.stringify(responseData), {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=300', // Serve cached anche in errore
            ...corsHeaders
          }
        });
      }
      
      // Nessun dato cached disponibile
      return new Response(JSON.stringify({ 
        error: error.message,
        lastError: { message: error.message, timestamp: new Date().toISOString() }
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
  }
};
