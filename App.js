import { useEffect, useState } from "react";
import { StyleSheet, Text, View, Button, FlatList, Vibration, Linking } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Updates from 'expo-updates';

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [conteudoQRCode, setConteudoQRCode] = useState("");
  const [escaneado, setEscaneado] = useState(false);
  const [historico, setHistorico] = useState([]);
  const [corTela, setCorTela] = useState("#bdee35");


  useEffect(() => {
    carregarHistorico();
  }, []);

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text>Carregando permissões...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.texto}>
          Precisamos da permissão da câmera para ler o QR Code.
        </Text>

        <Button title="Permitir câmera" onPress={requestPermission} />
      </View>
    );
  }
  
  function lerQRCode({ data }) {
    setEscaneado(true);
    setConteudoQRCode(data);
    salvarHistorico(data);
    executarAcaoqr(data);
  }

  function lerNovamente() {
    setEscaneado(false);
    setConteudoQRCode("");
  }

  async function salvarHistorico(data) {
    try{   
      
      if(!data) return
      
      const historicoAtt = [...historico, {
        id: Date.now().toString(),
        qr: data.toString(),
        data: new Date().toLocaleString("pt-BR"),
      }]

      setHistorico(historicoAtt);

      await AsyncStorage.setItem(
      "qrhist",
      JSON.stringify(historicoAtt)
      ); 
    } catch (error) {
      console.log("Erro ao salvar:", error);
    } 
  }

  async function carregarHistorico() {
    try {
      const dados = await AsyncStorage.getItem("qrhist");

      if (dados) {
        setHistorico(JSON.parse(dados));
      }
    } catch (error) {
      console.log("Erro ao carregar histórico:", error);
    }
  }

  function executarAcaoqr(data) {

    if (data.startsWith("COLOR:")) {

      const cor = data.replace("COLOR:", "");
      setCorTela(cor);
      reloadApp();
    }
    
    else if (data === "DARKMODE") {
      setCorTela("#111827");
      reloadApp();
      
    }
    
    else if (data === "VIBRAR") {

      Vibration.vibrate(1000);

    } 
    
    else if (data.startsWith("SITE:")) {

      const url = data.replace("SITE:", "");
      Linking.openURL(url);

    } 
    
    else if (data.startsWith("MENSAGEM:")) {

      const mensagem = data.replace("MENSAGEM:", "");
      alert(mensagem);

    } 

  async function reloadApp() {
    try {
      await Updates.reloadAsync();
    } catch (error) {
      alert("Erro ao recarregar o app: ", error);
    }
  }

  }


  return (
    <View style={[styles.container, {backgroundColor: corTela}]}>
      <Text style={styles.titulo}>QR Expo 📷</Text>

      <View style={styles.cameraArea}>
        <CameraView
          style={styles.camera}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
          onBarcodeScanned={escaneado ? undefined : lerQRCode}
        />
      </View>

      <View style={styles.resultado}>
        <Text style={styles.label}>Conteúdo do QR Code:</Text>

        <Text style={styles.conteudo}>
          {conteudoQRCode || "Nenhum QR Code lido ainda."}
        </Text>

        {escaneado && (
          <Button title="Ler outro QR Code" onPress={lerNovamente} />
        )}
      </View>
      <Text style={styles.label}>
        Histórico
      </Text>
      <FlatList
        data={historico}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemHistorico}>
            <Text>{item.qr}</Text>
            <Text>{item.data}</Text>
          </View>
        )}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    
  },

  titulo: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },

  texto: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
  },

  cameraArea: {
    height: 250,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#000000",
    marginBottom: 20,
  },

  camera: {
    flex: 1,
  },

  resultado: {
    backgroundColor: "#e8ffc4",
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },

  label: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },

  conteudo: {
    fontSize: 16,
    marginBottom: 20,
  },

  itemHistorico: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
},
});
