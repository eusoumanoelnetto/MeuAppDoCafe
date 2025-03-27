import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import * as Location from 'expo-location';

export default function App() {
  const [descricaoCafe, setDescricaoCafe] = useState('');
  const [resposta, setResposta] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [localizacao, setLocalizacao] = useState(null);

  // Solicitar permissão de localização
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Precisamos da localização para indicar cafeterias!');
      }
    })();
  }, []);

  // Função para analisar o café (simulação)
  const analisarCafe = async () => {
    if (!descricaoCafe) {
      Alert.alert('Ops!', 'Descreva o café primeiro, vovó! 🫢');
      return;
    }

    setCarregando(true);
    
    // Simulação de chamada à API (substitua pelo seu endpoint do Google AI Studio)
    setTimeout(() => {
      const respostaFake = {
        tipo: 'Cappuccino quente',
        leite: 'De aveia',
        latteArt: 'Coração 💖',
        grao: 'Arabica',
        momento: 'Café da manhã com pãozinho!',
        curiosidade: 'Nome vem dos monges capuchinhos!',
        cafeterias: ['Café da Rosa (⭐ 4.8)', 'Padaria Doce Grão (⭐ 4.5)'],
      };
      
      setResposta(respostaFake);
      setCarregando(false);
    }, 1500);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>App da Vovó Cafeteira! ☕</Text>

      <TextInput
        style={styles.input}
        placeholder="Descreva seu café (ex: Cappuccino com leite de aveia)"
        value={descricaoCafe}
        onChangeText={setDescricaoCafe}
      />

      <Button
        title={carregando ? "Analisando..." : "Ver Detalhes"}
        onPress={analisarCafe}
        color="#6F4E37"
      />

      {resposta && (
        <View style={styles.resposta}>
          <Text style={styles.item}>☕ {resposta.tipo}</Text>
          <Text style={styles.item}>🥛 {resposta.leite}</Text>
          <Text style={styles.item}>🎨 {resposta.latteArt}</Text>
          <Text style={styles.item}>🌱 {resposta.grao}</Text>
          <Text style={styles.item}>⏰ {resposta.momento}</Text>
          <Text style={styles.item}>📚 {resposta.curiosidade}</Text>
          
          <Text style={styles.subtitulo}>📍 Cafeterias próximas:</Text>
          {resposta.cafeterias.map((cafe, index) => (
            <Text key={index} style={styles.cafeteria}>- {cafe}</Text>
          ))}
        </View>
      )}

      {carregando && <ActivityIndicator size="large" color="#6F4E37" />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFF5E6',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6F4E37',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#6F4E37',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    backgroundColor: 'white',
  },
  resposta: {
    marginTop: 20,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    borderColor: '#6F4E37',
    borderWidth: 1,
  },
  item: {
    fontSize: 16,
    marginBottom: 10,
    color: '#6F4E37',
  },
  subtitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    color: '#6F4E37',
  },
  cafeteria: {
    fontSize: 14,
    color: '#6F4E37',
    marginLeft: 10,
  },
});