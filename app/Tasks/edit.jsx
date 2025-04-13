import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useState, useEffect } from "react";
import {StyleSheet,Text,View,TextInput,FlatList,TouchableOpacity,Alert,ScrollView,KeyboardAvoidingView,Platform} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { List } from "react-native-paper";
import { MaterialIcons} from "@expo/vector-icons";
import { Picker } from '@react-native-picker/picker';

const EditItem = () => {
  const { id } = useLocalSearchParams(); // Get the item ID from the route
  const router = useRouter();
  const [name, setName] = useState("");
  const [adresse, setAdresse] = useState("");
  const [plzort, setplzort] = useState("");
  const [tel, settel] = useState("");
  const [email, setemail] = useState("");
  const [steuernummer, setsteuernummer] = useState("");
  const [partitaiva, setpartitaiva] = useState("");
  const [kodex, setkodex] = useState("");
  const [pos, setpos] = useState([]);
  const [posname, setPosName] = useState("");

  useEffect(() => {
    loadData();
  }, []);
  const handleAddPos = () => {
      if (!posname.trim()) {
        Alert.alert("Error", "Pos Name ist leer.");
        return;
      }
      setpos([
        ...pos,
        {
          id: Date.now().toString(),
          name: posname,
          variante: "",
          einbauort: "",
          menge: "",
          breite: "",
          hoehe: "",
          farbe: "",
          gewebe: "",
          masx: "",
          masy: "",
          masz: "",
          buerste: "",
          richtung: "",
          verschluss: "",
          griff: "",
          montage: "",
          besonderheit: "",
          beschreibung: "",
        },
      ]);
      setPosName('');
    };
  const loadData = async () => {
    try {
      const data = await AsyncStorage.getItem("inventory");
      const items = data ? JSON.parse(data) : [];
      const itemToEdit = items.find((item) => item.id === id);
      if (itemToEdit) {
        setName(itemToEdit.Name);
        setAdresse(itemToEdit.Adresse);
        setplzort(itemToEdit.PLZORT)
        settel(itemToEdit.Tel);
        setemail(itemToEdit.Emailadresse);
        setsteuernummer(itemToEdit.Steuernummer);
        setpartitaiva(itemToEdit.PartitaIva);
        setkodex(itemToEdit.Kodex);
        setpos(itemToEdit.pos);
      }
    } catch (error) {
      console.log("Error loading item:", error);
    }
  };

  const handleChange = (index, field, value) => {
    const updatedPosList = [...pos];
    updatedPosList[index][field] = value;
    setpos(updatedPosList);
  };
  const handleDeletePos = (id) => {
    setpos(pos.filter((item) => item.id !== id));
  };
  const saveChanges = async () => {
    if (!name.trim()) {
      Alert.alert("Fehler", "Name darf nicht leer sein.");
      return;
    }

    try {
      const data = await AsyncStorage.getItem("inventory");
      let items = data ? JSON.parse(data) : [];

      const updatedItems = items.map((item) =>
        item.id === id
          ? {
              ...item,
              Name: name.trim(),
              Adresse: adresse.trim(),
              PLZORT: plzort.trim(),
              Tel: tel.trim(),
              Emailadresse: email.trim(),
              Steuernummer: steuernummer.trim(),
              PartitaIva: partitaiva.trim(),
              Kodex: kodex.trim(),
              pos: pos,
            }
          : item
      );

      await AsyncStorage.setItem("inventory", JSON.stringify(updatedItems));
      router.back();
    } catch (error) {
      console.log("Fehler beim Speichern:", error);
    }
  };
  return (
    <KeyboardAvoidingView
    behavior={Platform.OS === "ios" ? "padding" : "height"}
    style={{flex:1,paddingBottom:30}}
  >
      <View style={styles.modalButtons}>
        <Text style={styles.modalHeader}>Bearbeiten </Text>
        <TouchableOpacity style={styles.saveButton} onPress={saveChanges}>
          <Text style={styles.saveButtonText}>Speichern</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => {
            router.back();
          }}
        >
          <Text style={styles.cancelButtonText}>Abbrechen</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text>Name</Text>
        <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName}  />
        <Text>Adresse</Text>
        <TextInput style={styles.input} placeholder="Adresse" value={adresse} onChangeText={setAdresse} multiline/>
        <Text>PLZ-ORT</Text>
        <TextInput style={styles.input} placeholder="PLZ-Ort" value={plzort} onChangeText={setplzort} multiline/>
        <Text>Telefon</Text>
        <TextInput style={styles.input} keyboardType="numeric" placeholder="Tel" value={tel} onChangeText={settel} multiline/>
        <Text>Email</Text>
        <TextInput style={styles.input} placeholder="email" value={email} onChangeText={setemail} multiline/>
        <Text>Steuernummer</Text>
        <TextInput style={styles.input} placeholder="Steuernummer" value={steuernummer} onChangeText={setsteuernummer} multiline/>
        <Text>Partita IVA</Text>
        <TextInput style={styles.input} keyboardType="numeric" placeholder="Partita iva" value={partitaiva} onChangeText={setpartitaiva} multiline/>
        <Text>Kodex</Text>
        <TextInput style={styles.input} placeholder="Kodex" value={kodex} onChangeText={setkodex} multiline/>
        <Text>POS</Text>
        <View style={styles.positionContainer}>
          <TextInput style={styles.posinput} placeholder="Pos Name" value={posname} onChangeText={setPosName} multiline/>
          <TouchableOpacity style={styles.addButton} onPress={handleAddPos}>
            <Text style={styles.addButtonText}>Add POS</Text>
          </TouchableOpacity>
        </View>
        <View>
        {pos.length > 0 ? (
        <FlatList
  data={Array.isArray(pos) ? pos : []}
  keyExtractor={(item, index) => item?.id ?? index.toString()}
  extraData={pos}
  scrollEnabled={false}
  renderItem={({ item, index }) => ( 
              <List.Accordion
                key={item.id}
                title={item.name}
                style={styles.accordion}
              >
            <View key={item.id} style={styles.posContainer}>
              <Text>{item.name}</Text>
              <TouchableOpacity onPress={() => handleDeletePos(item.id)} style={styles.deleteButton}>
                <MaterialIcons name="delete" size={20} color="white" />
              </TouchableOpacity>
              <Text>Variante</Text>

              <Picker
        selectedValue={item.variante}
        onValueChange={(value) => handleChange(index, "variante", value)}
        style={styles.picker}
      >
        <Picker.Item label="Variante wählen" value="" />
        <Picker.Item label="SP" value="SP" />
        <Picker.Item label="DT" value="DT" />
        <Picker.Item label="PT" value="PT" />
        <Picker.Item label="ST" value="ST" />
        <Picker.Item label="PL" value="PL" />
        <Picker.Item label="RO" value="RO" />
        <Picker.Item label="ER" value="ER" />
        <Picker.Item label="PF" value="PF" />
        <Picker.Item label="DF" value="DF" />
        <Picker.Item label="LISA" value="LISA" />
        <Picker.Item label="RESA" value="RESA" />
        <Picker.Item label="ELSA" value="ELSA" />
        <Picker.Item label="TERRESA" value="TERRESA" />
      </Picker>
              <Text>Einbauort</Text>
              <TextInput style={styles.input} placeholder="Einbauort" value={item.einbauort} onChangeText={(text) => handleChange(index, "einbauort", text)}/>
              <Text>Menge</Text>
              <TextInput style={styles.input} keyboardType="numeric" placeholder="Menge" value={item.menge} onChangeText={(text) => handleChange(index, "menge", text)}/>
              <Text>Breite Lichte</Text>
              <TextInput style={styles.input} placeholder="Breite Lichte" value={item.breite} onChangeText={(text) => handleChange(index, "breite", text)}/>
              <Text>Höhe Lichte</Text>
              <TextInput style={styles.input} placeholder="Höhe Lichte" value={item.hoehe} onChangeText={(text) => handleChange(index, "hoehe", text)}/>
              <Text>Farbe</Text>
              <TextInput style={styles.input} placeholder="Farbe" value={item.farbe} onChangeText={(text) => handleChange(index, "farbe", text)}/>
              <Text>Gewebe</Text>
              <TextInput style={styles.input} placeholder="Gewebe" value={item.gewebe} onChangeText={(text) => handleChange(index, "gewebe", text)}/>
              <Text>Maß X</Text>
              <TextInput style={styles.input} keyboardType="numeric" placeholder="Maß X" value={item.masx} onChangeText={(text) => handleChange(index, "masx", text)}/>
              <Text>Maß Y</Text>
              <TextInput style={styles.input} keyboardType="numeric" placeholder="Maß Y" value={item.masy} onChangeText={(text) => handleChange(index, "masy", text)}/>
              <Text>Maß Z</Text>
              <TextInput style={styles.input} keyboardType="numeric" placeholder="Maß Z" value={item.masz} onChangeText={(text) => handleChange(index, "masz", text)}/>
              <Text>Lage Bürste</Text>
              <TextInput style={styles.input} placeholder="Lage der Bürste" value={item.buerste} onChangeText={(text) => handleChange(index, "buerste", text)}/>
              <Text>Öffnunfsrichtung</Text>
              <TextInput style={styles.input} placeholder="Öffnungsrichtung" value={item.richtung} onChangeText={(text) => handleChange(index, "richtung", text)}/>
              <Text>Schiebeverschluss</Text>
               <Picker
        selectedValue={item.verschluss}
        onValueChange={(value) => handleChange(index, "verschluss", value)}
        style={styles.picker}
      >
        <Picker.Item label="Schiebeverschluss" value="" />
        <Picker.Item label="Ja" value="Ja" />
        <Picker.Item label="Nein" value="Nein" />
      </Picker>
              <Text>Griffhöhe</Text>
              <TextInput style={styles.input} placeholder="Griffhöhe" value={item.griff} onChangeText={(text) => handleChange(index, "griff", text)}/>
              <Text>Montagebohrung</Text>
                             <Picker
        selectedValue={item.montage}
        onValueChange={(value) => handleChange(index, "montage", value)}
        style={styles.picker}
      >
        <Picker.Item label="Montagebohrung" value="" />
        <Picker.Item label="Vorne" value="Vorne" />
        <Picker.Item label="Seitlich" value="Seitlich" />
      </Picker>
              <Text>Besonderheit</Text>
              <TextInput style={[styles.input,styles.textArea]} placeholder="Besonderheiten" value={item.besonderheit} onChangeText={(text) => handleChange(index, "besonderheit", text)} multiline/>
              <Text>Montagebeschriebung</Text>
              <TextInput style={[styles.input,styles.textArea]} placeholder="Montagebeschreibung" value={item.beschreibung} onChangeText={(text) => handleChange(index, "beschreibung", text)} multiline/>
            </View>
            </List.Accordion>

        )}/>): (
          <Text style={{ textAlign: "center", marginTop: 10 }}>Keine Positionen</Text>
        )}
        </View>
        
      </ScrollView>
    </KeyboardAvoidingView>
  );
};


const styles = StyleSheet.create({
  deleteButton: {
    backgroundColor: "#FF6347",
    padding: 10,
    borderRadius: 5,
    width:40,
    alignSelf:"flex-end",
  },
  accordion: {
    backgroundColor: "#f1f1f1",
    borderRadius: 5,
    marginBottom: 10,
    padding: 10, 
  },
  positionContainer: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginBottom: 30,
  },
  posinput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
  },
  addButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
    marginLeft: 20,
  },
  addButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f8f8",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  scrollContent: {
    padding: 20,
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    padding:20,
  },
  saveButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginLeft: 50,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: "#FF6347",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#fff",
  },
});

export default EditItem;
