import { useState, useEffect, useRef } from 'react';

const TYPE_COLORS = {
  fire: '#c1440e', water: '#1565c0', grass: '#2e7d32', electric: '#c79a00',
  psychic: '#880e4f', ice: '#00838f', dragon: '#4527a0', dark: '#212121',
  fairy: '#880061', normal: '#555', fighting: '#b71c1c', flying: '#1565c0',
  poison: '#6a1b9a', ground: '#6d4c41', rock: '#4e342e', bug: '#558b2f',
  ghost: '#4527a0', steel: '#37474f',
};

const PokemonCard = ({ pokemon }) => (
  <div style={styles.cardRow}>
    <span style={styles.indexNumber}>{String(pokemon.id).padStart(3, '0')}</span>
    <div style={styles.imageWrapper}>
      <img
        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`}
        alt={pokemon.name}
        style={styles.sprite}
      />
    </div>
    <div style={styles.textContainer}>
      <span style={styles.itemName}>
        {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
      </span>
      <div style={styles.typeRow}>
        {pokemon.types.map(t => (
          <span key={t.type.name} style={{ ...styles.typeBadge, backgroundColor: TYPE_COLORS[t.type.name] || '#555' }}>
            {t.type.name}
          </span>
        ))}
      </div>
    </div>
    <div style={styles.statsCol}>
      <span style={styles.statLabel}>HP <span style={styles.statVal}>{pokemon.stats[0].base_stat}</span></span>
      <span style={styles.statLabel}>ATK <span style={styles.statVal}>{pokemon.stats[1].base_stat}</span></span>
    </div>
  </div>
);

export default function App() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [searchResult, setSearchResult] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const listRes = await fetch('https://pokeapi.co/api/v2/pokemon?limit=10');
        const listData = await listRes.json();
        const details = await Promise.all(
          listData.results.map(p => fetch(p.url).then(r => r.json()))
        );
        setData(details);
      } finally {
        setLoading(false);
      }
    };
    fetchInitial();
  }, []);
  useEffect(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      setSearchResult(null);
      setNotFound(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      setNotFound(false);
      setSearchResult(null);
      try {
        const num = term.replace("#", "");
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${num}`);
        if (!res.ok) throw new Error('not found');
        const pokemon = await res.json();
        setSearchResult(pokemon);
      } catch {
        setNotFound(true);
      } finally {
        setSearching(false);
      }
    }, 500);
  }, [search]);

  const isSearching = search.trim().length > 0;

  return (
    <div style={styles.container}>
      <div style={styles.navbar}>
        <h1 style={styles.title}>POKÉDEX DO THEU</h1>
        <input
          type="text"
          placeholder="Buscar por número (#025)..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      <div style={styles.contentWrapper}>
        {loading ? (
          <p style={styles.loadingText}>Carregando Pokédex...</p>
        ) : (
          <div style={styles.listContainer}>
            {!isSearching && (
              <>
                <p style={styles.sectionLabel}>10 primeiros Pokémon</p>
                {data.map(pokemon => (
                  <PokemonCard key={pokemon.id} pokemon={pokemon} />
                ))}
              </>
            )}

            {isSearching && searching && (
              <p style={styles.loadingText}>Buscando...</p>
            )}

            {isSearching && !searching && notFound && (
              <p style={styles.noResultsText}>Nenhum Pokémon encontrado.</p>
            )}

            {isSearching && !searching && searchResult && (
              <>
                <p style={styles.sectionLabel}>Resultado da busca</p>
                <PokemonCard key={searchResult.id} pokemon={searchResult} />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#080808',
    fontFamily: '"Segoe UI", Roboto, sans-serif',
    color: '#FFF'
  },
  navbar: {
    backgroundColor: '#0f0f0f',
    borderBottom: '3px solid #c1440e',
    padding: '18px 32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 4px 12px rgba(0,0,0,0.6)'
  },
  title: {
    margin: 0,
    fontSize: 20,
    color: '#c1440e',
    letterSpacing: '2px',
    fontWeight: '900'
  },
  searchInput: {
    backgroundColor: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '20px',
    padding: '8px 18px',
    color: '#FFF',
    fontSize: 14,
    outline: 'none',
    width: '220px'
  },
  contentWrapper: {
    maxWidth: '620px',
    margin: '0 auto',
    padding: '28px 16px'
  },
  listContainer: {
    backgroundColor: '#0f0f0f',
    borderRadius: '16px',
    padding: '10px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
    border: '1px solid #1e1e1e'
  },
  sectionLabel: {
    color: '#444',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: '1px',
    padding: '6px 16px 4px',
    margin: 0,
    fontWeight: '600'
  },
  cardRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px 14px',
    borderRadius: '10px',
    borderBottom: '1px solid #161616'
  },
  indexNumber: {
    color: '#444',
    fontSize: 12,
    width: '30px',
    textAlign: 'right',
    fontWeight: 'bold',
    flexShrink: 0
  },
  imageWrapper: {
    width: '52px',
    height: '52px',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: '10px',
    border: '1px solid #2a2a2a'
  },
  sprite: {
    width: '48px',
    height: '48px',
    imageRendering: 'pixelated'
  },
  textContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    flex: 1
  },
  itemName: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600'
  },
  typeRow: {
    display: 'flex',
    gap: '5px'
  },
  typeBadge: {
    fontSize: 10,
    padding: '2px 8px',
    borderRadius: '10px',
    color: '#fff',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  statsCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    alignItems: 'flex-end',
    flexShrink: 0
  },
  statLabel: {
    color: '#444',
    fontSize: 11,
    fontWeight: '600'
  },
  statVal: {
    color: '#c1440e',
    fontWeight: '700'
  },
  loadingText: {
    color: '#c1440e',
    textAlign: 'center',
    padding: '40px',
    fontSize: '15px',
    fontWeight: '500'
  },
  noResultsText: {
    color: '#555',
    textAlign: 'center',
    marginTop: '40px',
    fontSize: '15px'
  }
};