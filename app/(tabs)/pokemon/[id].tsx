import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';

type Params = {
  id: string;
};

type PokemonDetail = {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites: any;
  types: Array<{ slot: number; type: { name: string } }>;
  abilities: Array<{ ability: { name: string } }>;
};

export default function PokemonDetailScreen() {
  const params = useLocalSearchParams() as Params;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [pokemon, setPokemon] = useState<PokemonDetail | null>(null);

  useEffect(() => {
    if (!params?.id) return;
    let mounted = true;

    async function fetchDetail() {
      try {
        setLoading(true);
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${params.id}`);
        const data = await res.json();
        if (mounted) setPokemon(data);
      } catch (e) {
        console.warn('Erro ao buscar detalhe', e);
        alert('Erro ao buscar detalhes do Pokémon');
        router.back();
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchDetail();

    return () => {
      mounted = false;
    };
  }, [params?.id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!pokemon) {
    return (
      <View style={styles.center}>
        <Text>Pokémon não encontrado.</Text>
      </View>
    );
  }

  const image = pokemon.sprites?.other?.['official-artwork']?.front_default ?? null;
  const tipos = pokemon.types.map((t) => t.type.name).join(', ');

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {image ? (
        <Image source={{ uri: image }} style={styles.image} placeholder={require('@/assets/images/splash-icon.png')} />
      ) : null}
      <Text style={styles.title}>#{pokemon.id} - {pokemon.name.toUpperCase()}</Text>
      <Text style={styles.subtitle}>Tipo(s): {tipos}</Text>
      <Text>Altura: {pokemon.height}</Text>
      <Text>Peso: {pokemon.weight}</Text>
      <Text style={styles.section}>Habilidades:</Text>
      {pokemon.abilities.map((a) => (
        <Text key={a.ability.name}>• {a.ability.name}</Text>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { padding: 20, alignItems: 'center' },
  image: { width: 220, height: 220, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 16, marginBottom: 8 },
  section: { marginTop: 12, fontWeight: '600' },
});
