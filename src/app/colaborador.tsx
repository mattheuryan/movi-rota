import { Link } from 'expo-router';
import { doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { db } from '../firebase';

type Posicao = { latitude: number; longitude: number };

export default function Colaborador() {
  const [motorista, setMotorista] = useState<Posicao | null>(null);

  useEffect(() => {
    const parar = onSnapshot(doc(db, 'motoristas', 'motorista1'), (documento) => {
      const dados = documento.data();
      if (dados) {
        setMotorista({
          latitude: dados.latitude,
          longitude: dados.longitude,
        });
      }
    });

    return () => parar();
  }, []);

  if (!motorista) {
    return (
      <View style={styles.centro}>
        <Text>Aguardando o motorista...</Text>
        <Link href="/" style={styles.voltar}>Voltar</Link>
      </View>
    );
  }

  return (
    <View style={styles.tela}>
      <MapView
        style={StyleSheet.absoluteFill}
        region={{
          latitude: motorista.latitude,
          longitude: motorista.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Marker coordinate={motorista} title="Rota" />
      </MapView>
      <Link href="/" style={styles.voltar}>Voltar</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1 },
  centro: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  voltar: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: '#1a73e8',
    color: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
});