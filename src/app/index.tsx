import { useRouter } from 'expo-router';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { auth, db } from '../firebase';

type Perfil = 'motorista' | 'colaborador';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [perfil, setPerfil] = useState<Perfil>('colaborador');
  const [mensagem, setMensagem] = useState('');
  const [carregando, setCarregando] = useState(false);

  function irParaTela(p: Perfil) {
    if (p === 'motorista') {
      router.replace('/motorista');
    } else {
      router.replace('/colaborador');
    }
  }

  function traduzirErro(codigo: string) {
    if (codigo === 'auth/invalid-email') return 'E-mail inválido.';
    if (codigo === 'auth/weak-password') return 'A senha precisa ter pelo menos 6 caracteres.';
    if (codigo === 'auth/email-already-in-use') return 'Esse e-mail já tem conta. Toque em Entrar.';
    if (
      codigo === 'auth/invalid-credential' ||
      codigo === 'auth/wrong-password' ||
      codigo === 'auth/user-not-found'
    ) {
      return 'E-mail ou senha incorretos.';
    }
    return 'Algo deu errado. Tente de novo.';
  }

  async function entrar() {
    setMensagem('');
    setCarregando(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), senha);
      const snap = await getDoc(doc(db, 'usuarios', cred.user.uid));
      const perfilSalvo: Perfil =
        snap.exists() && snap.data().perfil === 'motorista' ? 'motorista' : 'colaborador';
      irParaTela(perfilSalvo);
    } catch (e: any) {
      setMensagem(traduzirErro(e?.code ?? ''));
    } finally {
      setCarregando(false);
    }
  }

  async function criarConta() {
    setMensagem('');
    setCarregando(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), senha);
      await setDoc(doc(db, 'usuarios', cred.user.uid), {
        email: email.trim(),
        perfil: perfil,
      });
      irParaTela(perfil);
    } catch (e: any) {
      setMensagem(traduzirErro(e?.code ?? ''));
    } finally {
      setCarregando(false);
    }
  }

  return (
    <View style={styles.tela}>
      <Text style={styles.titulo}>App de Rotas</Text>

      <TextInput
        style={styles.campo}
        placeholder="E-mail"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.campo}
        placeholder="Senha"
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
      />

      <Text style={styles.rotulo}>Eu sou (ao criar conta):</Text>
      <View style={styles.linha}>
        <Pressable
          style={[styles.opcao, perfil === 'motorista' && styles.opcaoAtiva]}
          onPress={() => setPerfil('motorista')}
        >
          <Text style={perfil === 'motorista' ? styles.textoAtivo : styles.texto}>
            Motorista
          </Text>
        </Pressable>
        <Pressable
          style={[styles.opcao, perfil === 'colaborador' && styles.opcaoAtiva]}
          onPress={() => setPerfil('colaborador')}
        >
          <Text style={perfil === 'colaborador' ? styles.textoAtivo : styles.texto}>
            Colaborador
          </Text>
        </Pressable>
      </View>

      {carregando ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : (
        <>
          <Pressable style={styles.botao} onPress={entrar}>
            <Text style={styles.textoBotao}>Entrar</Text>
          </Pressable>
          <Pressable style={styles.botaoSecundario} onPress={criarConta}>
            <Text style={styles.textoSecundario}>Criar conta</Text>
          </Pressable>
        </>
      )}

      {mensagem !== '' && <Text style={styles.erro}>{mensagem}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#ffffff' },
  titulo: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 24 },
  campo: {
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  rotulo: { marginTop: 8, marginBottom: 8, fontSize: 14 },
  linha: { flexDirection: 'row', gap: 8 },
  opcao: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1a73e8',
    borderRadius: 8,
    alignItems: 'center',
  },
  opcaoAtiva: { backgroundColor: '#1a73e8' },
  texto: { color: '#1a73e8' },
  textoAtivo: { color: '#ffffff', fontWeight: 'bold' },
  botao: {
    backgroundColor: '#1a73e8',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  textoBotao: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  botaoSecundario: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#1a73e8',
  },
  textoSecundario: { color: '#1a73e8', fontSize: 16 },
  erro: { color: '#d93025', marginTop: 16, textAlign: 'center' },
});