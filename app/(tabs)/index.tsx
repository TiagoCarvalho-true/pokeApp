import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  ListRenderItemInfo,
} from 'react-native';
import { Image } from 'expo-image';
import { Link } from 'expo-router';

type Pokemon = {
  id: number;
  nome: string;
  imagem: string | null;
  tipo: string;
};

export default function HomeScreen() {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 20;

  async function carregarPokemons(loadOffset = 0) {
    if (carregando) return;
    try {
      setCarregando(true);
      const resposta = await fetch(
        `https://pokeapi.co/api/v2/pokemon?limit=${LIMIT}&offset=${loadOffset}`
      );
      const dados = await resposta.json();

      const detalhes: Pokemon[] = await Promise.all(
        dados.results.map(async (p: { name: string; url: string }) => {
          const resp = await fetch(p.url);
          const info = await resp.json();
          return {
            id: info.id,
            nome: p.name,
            imagem: info.sprites?.other?.['official-artwork']?.front_default ?? null,
            tipo: info.types?.map((t: any) => t.type.name).join(', ') ?? '—',
          };
        })
      );

      setPokemons((prev) => (loadOffset === 0 ? detalhes : [...prev, ...detalhes]));
      setOffset(loadOffset + LIMIT);
      if (!dados.next) setHasMore(false);
    } catch (erro) {
      console.warn('Erro ao carregar Pokémons', erro);
      alert('❌ Erro ao carregar Pokémons!');
    } finally {
      setCarregando(false);
    }
  }

  const handleLoadMore = useCallback(() => {
    if (!hasMore || carregando) return;
    carregarPokemons(offset);
  }, [hasMore, carregando, offset]);

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Pokédex - React Native</Text>

  {carregando && <ActivityIndicator size="large" color="#ffcb05" />}

      {!carregando && pokemons.length === 0 && (
        <TouchableOpacity style={styles.botao} onPress={() => carregarPokemons(0)}>
          <Text style={styles.textoBotao}>Carregar Pokémons</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={pokemons}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }: ListRenderItemInfo<Pokemon>) => (
          <TouchableOpacity style={styles.card}>
            {item.imagem ? (
              <Image
                source={{ uri: item.imagem }}
                style={styles.imagem}
                placeholder={require('@/assets/images/splash-icon.png')}
                transition={200}
              />
            ) : (
              <View style={[styles.imagem, styles.placeholder]} />
            )}
            <View style={styles.info}>
              <Link
                href={{ pathname: '/(tabs)/pokemon/[id]', params: { id: String(item.id) } }}>
                <Text style={styles.nome}>#{item.id} - {item.nome.toUpperCase()}</Text>
              </Link>
              <Text style={styles.tipo}>Tipo: {item.tipo}</Text>
            </View>
          </TouchableOpacity>
        )}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={carregando && hasMore ? <ActivityIndicator /> : null}
        contentContainerStyle={pokemons.length === 0 ? undefined : { paddingBottom: 24 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E3350D',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  titulo: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  botao: {
    backgroundColor: '#FFCB05',
    padding: 12,
    borderRadius: 8,
    alignSelf: 'center',
    marginBottom: 20,
  },
  textoBotao: {
    color: '#2a75bb',
    fontWeight: 'bold',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  imagem: {
    width: 80,
    height: 80,
    marginRight: 15,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
  },
  nome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2a75bb',
    marginBottom: 5,
  },
  tipo: {
    fontSize: 14,
    color: '#555',
  },
});
