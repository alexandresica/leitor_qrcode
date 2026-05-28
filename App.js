import { useEffect, useState } from "react";
import { StyleSheet, Text, View, Button, FlatList } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [conteudoQRCode, setConteudoQRCode] = useState("");
  const [escaneado, setEscaneado] = useState(false);
  const [historico, setHistorico] = useState([]);
  const timestamp = Date.now();
  const dataFormatada = new Date(timestamp).toLocaleString('pt-BR');
  
  useEffect(()=>{
    historicoQR();
  },[]);

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
  }

  function lerNovamente() {
    setEscaneado(false);
    setConteudoQRCode("");
  }

  async function historicoQR() {
    if(!conteudoQRCode) return
    
    
    const historicoAtt = [...historico, {
      id: Date.now().toString(),
      qr: conteudoQRCode.toString(),
      data: dataFormatada,
    }]

    setHistorico(historicoAtt)

  }

  return (
    <View style={styles.container}>
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
      <FlatList
        data={historico}
        keyExtractor={item => item.id}
        renderItem={({item})=>(
          <View>
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
    backgroundColor: "#bdee35",
    justifyContent: "center",
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
    height: 350,
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
});
