import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { auth, db } from '../firebase';

export default function Motorista() {
  const router = useRouter();
  const [posicao, setPosicao] = useState<Location.LocationObjectCoords | null>(null);
  const [rota, setRota] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let assinatura: Location.LocationSubscription | null = null;

    async function iniciar() {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        setErro('Você não está logado.');
        return;
      }

      const snap = await getDoc(doc(db, 'usuarios', uid));
      const rotaDoUsuario = snap.exists() ? snap.data().rota : null;
      if (!rotaDoUsuario) {
        setErro('Seu usuário ainda não tem uma rota. Peça ao RH.');
        return;
      }
      setRota(rotaDoUsuario);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErro('Permissão de localização negada');
        return;
      }

      assinatura = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 3000,
          distanceInterval: 5,
        },
        async (local) => {
          setPosicao(local.coords);

          try {
            await setDoc(
              doc(db, 'rotas', rotaDoUsuario),
              {
                latitude: local.coords.latitude,
                longitude: local.coords.longitude,
                atualizadoEm: Date.now(),
              },
              { merge: true }
            );
          } catch (e) {
            console.log('Erro ao gravar no Firebase', e);
          }
        }
      );
    }

    iniciar();

    return () => {
      if (assinatura) assinatura.remove();
    };
  }, []);

  async function sair() {
    await signOut(auth);
    router.replace('/');
  }

  if (erro) {
    return (
      <View style={styles.centro}>
        <Text style={styles.mensagem}>{erro}</Text>
        <Pressable style={styles.botaoSair} onPress={sair}>
          <Text style={styles.textoBotao}>Sair</Text>
        </Pressable>
      </View>
    );
  }

  if (!posicao) {
    return (
      <View style={styles.centro}>
        <Text>Buscando sua localização...</Text>
      </View>
    );
  }

  return (
    <View style={styles.tela}>
      <MapView
        style={StyleSheet.absoluteFill}
        region={{
          latitude: posicao.latitude,
          longitude: posicao.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Marker
          coordinate={{
            latitude: posicao.latitude,
            longitude: posicao.longitude,
          }}
          title="Motorista"
        />
      </MapView>

      <View style={styles.etiqueta}>
        <Text style={styles.textoEtiqueta}>Rota: {rota}</Text>
      </View>

      <Pressable style={styles.botaoSair} onPress={sair}>
        <Text style={styles.textoBotao}>Sair</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1 },
  centro: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  mensagem: { textAlign: 'center', marginBottom: 20 },
  etiqueta: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  textoEtiqueta: { fontWeight: 'bold' },
  botaoSair: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: '#1a73e8',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 8,
  },
  textoBotao: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
});