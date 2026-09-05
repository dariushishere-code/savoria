import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

declare const process: { env: { EXPO_PUBLIC_API_URL?: string } };

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001';
const fallbackImage = 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=85';

type Recipe = { id: string; title: string; slug: string; description: string | null; heroImageUrl: string | null; totalTimeMinutes: number | null; cuisine?: { name: string } | null };

async function api<T>(path: string, options: RequestInit = {}) {
  const response = await fetch(`${API_URL}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) } });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.message ?? 'Request failed');
  return (payload.data ?? payload) as T;
}

function Card({ recipe, onPress }: { recipe: Recipe; onPress: () => void }) {
  return <Pressable style={styles.card} onPress={onPress}>
    <Image source={{ uri: recipe.heroImageUrl || fallbackImage }} style={styles.cardImage} />
    <View style={styles.cardBody}><Text style={styles.cardTitle}>{recipe.title}</Text><Text style={styles.cardMeta}>{recipe.cuisine?.name ?? 'Savoria kitchen'} · {recipe.totalTimeMinutes ? `${recipe.totalTimeMinutes} min` : 'Recipe'}</Text><Text style={styles.cardDescription} numberOfLines={2}>{recipe.description ?? 'A recipe to make and savor.'}</Text></View>
  </Pressable>;
}

export default function App() {
  const [screen, setScreen] = useState<'home' | 'search' | 'account'>('home');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Recipe | null>(null);
  const [detail, setDetail] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadRecipes = async (search = '') => {
    setLoading(true); setError('');
    try { const result = await api<{ data: Recipe[] }>(`/api/recipes?pageSize=20${search ? `&q=${encodeURIComponent(search)}` : ''}`); setRecipes(result.data); } catch (err) { setError(err instanceof Error ? err.message : 'Could not load recipes'); } finally { setLoading(false); }
  };
  useEffect(() => { loadRecipes(); }, []);

  const openRecipe = async (recipe: Recipe) => { setSelected(recipe); setDetail(null); try { setDetail(await api<any>(`/api/recipes/${recipe.slug}`)); } catch (err) { setError(err instanceof Error ? err.message : 'Could not load recipe'); } };
  const login = async () => { try { const result = await api<{ accessToken: string }>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }); setToken(result.accessToken); setError(''); } catch (err) { setError(err instanceof Error ? err.message : 'Sign in failed'); } };
  const favorite = async () => { if (!token || !selected) return; try { await api(`/api/users/me/favorites/${selected.id}`, { method: 'POST', body: '{}' }); setError('Saved to favorites'); } catch (err) { setError(err instanceof Error ? err.message : 'Sign in to save favorites'); } };

  if (selected) return <SafeAreaView style={styles.container}><Pressable onPress={() => setSelected(null)}><Text style={styles.back}>‹ Back to recipes</Text></Pressable>{detail ? <ScrollView><Image source={{ uri: detail.heroImageUrl || fallbackImage }} style={styles.detailImage} /><Text style={styles.eyebrow}>{detail.cuisine?.name ?? 'SAVORIA RECIPE'}</Text><Text style={styles.detailTitle}>{detail.title}</Text><Text style={styles.detailDescription}>{detail.description}</Text><Pressable style={styles.primaryButton} onPress={favorite}><Text style={styles.primaryText}>♡ Save recipe</Text></Pressable><Text style={styles.sectionTitle}>Ingredients</Text>{detail.ingredients?.map((item: any) => <Text key={item.id} style={styles.listItem}>• {item.amount} {item.unit} {item.name || item.ingredient?.name}</Text>)}<Text style={styles.sectionTitle}>Method</Text>{detail.instructions?.map((item: any) => <View key={item.id} style={styles.step}><Text style={styles.stepNumber}>{item.stepNumber}</Text><Text style={styles.listItem}>{item.content}</Text></View>)}</ScrollView> : <ActivityIndicator color="#EA580C" style={styles.loader} />}</SafeAreaView>;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}><View><Text style={styles.title}>Savoria<span>.</span></Text><Text style={styles.sub}>Discover. Cook. Savor.</Text></View><Pressable onPress={() => setScreen('account')}><Text style={styles.account}>Account</Text></Pressable></View>
      {screen === 'account' ? <View><Text style={styles.pageTitle}>{token ? 'You are signed in' : 'Welcome back'}</Text>{!token && <><TextInput style={styles.input} autoCapitalize="none" keyboardType="email-address" placeholder="Email" value={email} onChangeText={setEmail} /><TextInput style={styles.input} secureTextEntry placeholder="Password" value={password} onChangeText={setPassword} /><Pressable style={styles.primaryButton} onPress={login}><Text style={styles.primaryText}>Sign in</Text></Pressable></>}{token && <Text style={styles.body}>Your saved recipes and ratings will sync with Savoria.</Text>}</View> : <><View style={styles.tabs}><Pressable onPress={() => { setScreen('home'); loadRecipes(); }}><Text style={[styles.tab, screen === 'home' && styles.activeTab]}>Discover</Text></Pressable><Pressable onPress={() => setScreen('search')}><Text style={[styles.tab, screen === 'search' && styles.activeTab]}>Search</Text></Pressable></View>{screen === 'search' && <View style={styles.searchRow}><TextInput style={styles.searchInput} placeholder="Search dishes, ingredients..." value={query} onChangeText={setQuery} onSubmitEditing={() => loadRecipes(query)} returnKeyType="search" /><Pressable style={styles.searchButton} onPress={() => loadRecipes(query)}><Text style={styles.primaryText}>Go</Text></Pressable></View>}{error ? <Text style={styles.error}>{error}</Text> : null}{loading ? <ActivityIndicator color="#EA580C" style={styles.loader} /> : <FlatList data={recipes} keyExtractor={(item) => item.id} renderItem={({ item }) => <Card recipe={item} onPress={() => openRecipe(item)} />} ListEmptyComponent={<Text style={styles.body}>No recipes found. Try another search.</Text>} contentContainerStyle={styles.list} />}</>}
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFBF5', paddingHorizontal: 18 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 18 },
  title: { fontSize: 30, fontWeight: '700', color: '#0F172A' },
  sub: { marginTop: 3, color: '#EA580C', fontWeight: '500', fontSize: 12 },
  account: { color: '#EA580C', fontWeight: '600' },
  tabs: { flexDirection: 'row', gap: 24, borderBottomWidth: 1, borderBottomColor: '#E2E8F0', marginBottom: 14 },
  tab: { paddingVertical: 10, color: '#64748B', fontWeight: '600' },
  activeTab: { color: '#EA580C', borderBottomWidth: 2, borderBottomColor: '#EA580C' },
  list: { paddingBottom: 24, gap: 14 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#F1F5F9' },
  cardImage: { width: '100%', height: 180 },
  cardBody: { padding: 14 },
  cardTitle: { fontSize: 21, fontWeight: '700', color: '#0F172A' },
  cardMeta: { marginTop: 4, color: '#EA580C', fontSize: 12, fontWeight: '600' },
  cardDescription: { marginTop: 8, color: '#64748B', lineHeight: 20 },
  searchRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  searchInput: { flex: 1, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  searchButton: { backgroundColor: '#EA580C', borderRadius: 10, justifyContent: 'center', paddingHorizontal: 18 },
  primaryButton: { backgroundColor: '#EA580C', borderRadius: 10, padding: 13, alignItems: 'center', marginTop: 16 },
  primaryText: { color: '#FFFFFF', fontWeight: '700' },
  detailImage: { width: '100%', height: 230, borderRadius: 16, marginTop: 12 },
  back: { color: '#EA580C', fontWeight: '600', paddingVertical: 8 },
  eyebrow: { color: '#EA580C', fontSize: 12, fontWeight: '700', letterSpacing: 1.5, marginTop: 20 },
  detailTitle: { color: '#0F172A', fontSize: 34, fontWeight: '700', marginTop: 6 },
  detailDescription: { color: '#475569', fontSize: 16, lineHeight: 24, marginTop: 10 },
  sectionTitle: { color: '#0F172A', fontSize: 22, fontWeight: '700', marginTop: 26, marginBottom: 10 },
  listItem: { color: '#475569', lineHeight: 23, flex: 1 },
  step: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  stepNumber: { backgroundColor: '#EA580C', color: '#FFFFFF', borderRadius: 20, width: 26, height: 26, textAlign: 'center', paddingTop: 3, fontWeight: '700' },
  pageTitle: { color: '#0F172A', fontSize: 30, fontWeight: '700', marginTop: 24, marginBottom: 18 },
  input: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 10, padding: 13, marginBottom: 10 },
  body: { color: '#64748B', lineHeight: 21, marginTop: 14 },
  error: { color: '#B91C1C', backgroundColor: '#FEF2F2', padding: 10, borderRadius: 8, marginBottom: 12 },
  loader: { marginTop: 40 },
});
