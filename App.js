import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

export default function App() {
  const [descricaoCafe, setDescricaoCafe] = useState('');
  const [resposta, setResposta] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [localizacao, setLocalizacao] = useState(null);

  // Solicitar permissões
  useEffect(() => {
    (async () => {
      // Permissão de localização
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Precisamos da localização para indicar cafeterias!');
      }

      // Permissão para acessar fotos
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (mediaStatus !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos acessar suas fotos para analisar o café!');
      }
    })();
  }, []);

// Função para analisar por IMAGEM (versão corrigida)
const analisarCafePorImagem = async () => {
  setCarregando(true);
  try {
    // 1. Solicitar permissão da câmera
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    if (cameraStatus !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos acessar sua câmera!');
      return;
    }

    // 2. Abrir a câmera
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (result.canceled) return;

    // ... (restante do código permanece igual)

      const base64 = await FileSystem.readAsStringAsync(result.assets[0].uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const imagemBase64 = `data:image/jpeg;base64,${base64}`;

      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': 'AIzaSyBrcGKhhoUvgYvD_XKawfP93lHkn2qPK6E'
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              { 
                text: `Analise esta imagem de café e responda em formato JSON: 
                { "tipo": "ex: cappuccino", "leite": "ex: integral", 
                "latteArt": "ex: coração", "grao": "ex: arábica", 
                "momento": "ex: manhã", "curiosidade": "fato histórico" }` 
              },
              { 
                inline_data: { 
                  mime_type: "image/jpeg", 
                  data: imagemBase64.split(',')[1] 
                } 
              }
            ]
          }]
        })
      });

      const dados = await response.json();
      const textoResposta = dados.candidates[0].content.parts[0].text;
      const respostaFormatada = JSON.parse(textoResposta.match(/\{.*\}/s)[0]);

      setResposta({
        tipo: respostaFormatada.tipo,
        leite: respostaFormatada.leite,
        latteArt: respostaFormatada.latteArt,
        grao: respostaFormatada.grao,
        momento: respostaFormatada.momento,
        curiosidade: respostaFormatada.curiosidade,
        cafeterias: ["Café da Rosa (⭐ 4.8)", "Padaria Doce Grão (⭐ 4.5)"]
      });

    } catch (erro) {
      Alert.alert('Erro', 'Não consegui analisar o café. Tente novamente! 😢');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>App da Vovó Cafeteira! ☕</Text>

      <Button
        title="📸 Tirar Foto do Café"
        onPress={analisarCafePorImagem}
        color="#6F4E37"
        style={styles.botao}
      />

      <Text style={styles.ou}>OU</Text>

      <TextInput
        style={styles.input}
        placeholder="Descreva seu café (ex: Cappuccino com leite de aveia)"
        value={descricaoCafe}
        onChangeText={setDescricaoCafe}
      />

      <Button
        title={carregando ? "Analisando..." : "Analisar por Texto"}
        onPress={() => Alert.alert('Modo texto desativado', 'Use a câmera 📸!')}
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
  botao: {
    marginBottom: 15,
  },
  ou: {
    textAlign: 'center',
    marginVertical: 10,
    color: '#6F4E37',
    fontWeight: 'bold',
  },
});