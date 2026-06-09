import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  StyleSheet, Text, View, TextInput, FlatList,
  TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { List } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";

// ─────────────────────────────────────────────
// FIELD CONFIG — add/remove/reorder fields here
// ─────────────────────────────────────────────

// Top-level customer fields
// type: "text" | "numeric" | "email" | "textarea"
const CUSTOMER_FIELDS = [
  { key: "Name",          label: "Name",         type: "text" },
  { key: "Adresse",       label: "Adresse",       type: "textarea" },
  { key: "PLZORT",        label: "PLZ-ORT",       type: "text" },
  { key: "Tel",           label: "Telefon",       type: "numeric" },
  { key: "Emailadresse",  label: "Email",         type: "email" },
  { key: "Steuernummer",  label: "Steuernummer",  type: "text" },
  { key: "PartitaIva",    label: "Partita IVA",   type: "numeric" },
  { key: "Kodex",         label: "Kodex",         type: "text" },
];

// POS fields per position
// type: "text" | "numeric" | "textarea" | "picker"
// For picker: add options: [{ label, value }]
const POS_FIELDS = [
//   {
//     key: "variante", label: "Variante", type: "picker",
//     options: [
//       { label: "Variante wählen", value: "" },
//       ...["SP","DT","PT","ST","PL","RO","ER","PF","DF","LISA","RESA","ELSA","TERRESA"]
//         .map((v) => ({ label: v, value: v })),
//     ],
//   },

  { key: "variante", label: "Variante",         type: "text" },
  { key: "einbauort", label: "Einbauort",         type: "text" },
  { key: "menge",     label: "Menge",             type: "numeric" },
  { key: "breite",    label: "Breite",     type: "text" },
  { key: "hoehe",     label: "Höhe",       type: "text" },
  { key: "farbe",     label: "Farbe",             type: "text" },
  { key: "gewebe",    label: "Gewebe",            type: "text" },
  { key: "masx",      label: "Maß X",             type: "text" },
  { key: "masy",      label: "Maß Y",             type: "text" },
  { key: "masz",      label: "Maß Z",             type: "text" },
  { key: "Seitenarretierung",   label: "Seitenarretierung", type: "text" },
  { key: "richtung",  label: "Öffnungsrichtung",  type: "text" },
  { key: "sprossenhoehe",  label: "Sprossenhöhe",  type: "text" },
  { key: "stabilotec",  label: "Stabilotec unter d. Sprosse",  type: "text" },
  { key: "tuer",  label: "Gedämpfte Tür",  type: "text" },
  { key: "dichtung",  label: "Aufgleitdichtung",  type: "text" },
//   {
//     key: "verschluss", label: "Schiebeverschluss", type: "picker",
//     options: [
//       { label: "Schiebeverschluss", value: "" },
//       { label: "Ohne",  value: "Ohne" },
//       { label: "Innen", value: "Innen" },
//     ],
//   },
  { key: "griff", label: "Bürste Griffgegenseite", type: "text" },
  { key: "laufschiene", label: "Laufschienelänge", type: "text" },
  
//   {
//     key: "montage", label: "Montagebohrung", type: "picker",
//     options: [
//       { label: "Montagebohrung", value: "" },
//       { label: "Vorne",    value: "Vorne" },
//       { label: "Seitlich", value: "Seitlich" },
//     ],
//   },
  { key: "montage", label: "Montagebohrung",        type: "text" },
  { key: "besonderheit", label: "Besonderheit",        type: "textarea" },
  { key: "beschreibung", label: "Montagebeschreibung", type: "textarea" },
];

// ─────────────────────────────────────────────
// Helpers — derived from config, never touch manually
// ─────────────────────────────────────────────

const EMPTY_CUSTOMER = () =>
  Object.fromEntries(CUSTOMER_FIELDS.map((f) => [f.key, ""]));

const EMPTY_POS = (name = "") => ({
  id: `${Date.now()}-${Math.random()}`,
  name,
  ...Object.fromEntries(POS_FIELDS.map((f) => [f.key, ""])),
});

const KB_TYPE = { numeric: "numeric", email: "email-address" };

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

const ItemForm = () => {
  const { id } = useLocalSearchParams();
  const isEdit = !!id;
  const router = useRouter();

  const [customer, setCustomer] = useState(EMPTY_CUSTOMER);
  const [pos, setPos] = useState([]);
  const [posname, setPosName] = useState("");

  useEffect(() => { if (isEdit) loadData(); }, []);

  const setField = (key, value) =>
    setCustomer((prev) => ({ ...prev, [key]: value }));

  const loadData = async () => {
    try {
      const data = await AsyncStorage.getItem("inventory");
      const items = data ? JSON.parse(data) : [];
      const item = items.find((i) => i.id === id);
      if (item) {
        const loaded = {};
        CUSTOMER_FIELDS.forEach(({ key }) => { loaded[key] = item[key] ?? ""; });
        setCustomer(loaded);
        setPos(item.pos ?? []);
      }
    } catch (e) { console.log("Error loading:", e); }
  };

  const handleAddPos = () => {
    if (!posname.trim()) { Alert.alert("Error", "Pos Name ist leer."); return; }
    setPos((prev) => [...prev, EMPTY_POS(posname)]);
    setPosName("");
  };

  const handleDeletePos = (posId) =>
    setPos((prev) => prev.filter((p) => p.id !== posId));

  const handlePosChange = (index, key, value) =>
    setPos((prev) => prev.map((item, i) => (i === index ? { ...item, [key]: value } : item)));

  const handleSave = async () => {
    if (!customer.Name.trim()) { Alert.alert("Fehler", "Name darf nicht leer sein."); return; }
    try {
      const data = await AsyncStorage.getItem("inventory");
      let items = data ? JSON.parse(data) : [];
      const record = { ...customer, pos };

      if (isEdit) {
        items = items.map((item) => item.id === id ? { ...item, ...record } : item);
      } else {
        items = [...items, { id: Date.now().toString(), ...record }];
        setCustomer(EMPTY_CUSTOMER());
        setPos([]);
      }

      await AsyncStorage.setItem("inventory", JSON.stringify(items));
      router.back();
    } catch (e) { console.log("Fehler beim Speichern:", e); }
  };

  const renderField = (field, value, onChange) => {
    if (field.type === "picker") {
      return (
        <View key={field.key}>
          <Text style={styles.label}>{field.label}</Text>
          <Picker selectedValue={value} onValueChange={onChange} style={styles.picker}>
            {field.options.map((o) => (
              <Picker.Item key={o.value} label={o.label} value={o.value} />
            ))}
          </Picker>
        </View>
      );
    }
    return (
      <View key={field.key}>
        <Text style={styles.label}>{field.label}</Text>
        <TextInput
          style={[styles.input, field.type === "textarea" && styles.textArea]}
          placeholder={field.label}
          value={value}
          onChangeText={onChange}
          keyboardType={KB_TYPE[field.type] || "default"}
          multiline={field.type === "textarea"}
        />
      </View>
    );
  };

  const renderPos = ({ item, index }) => (
    <List.Accordion title={item.name} style={styles.accordion}>
      <View style={styles.posContainer}>
        <TouchableOpacity onPress={() => handleDeletePos(item.id)} style={styles.deleteButton}>
          <MaterialIcons name="delete" size={20} color="white" />
        </TouchableOpacity>
        {POS_FIELDS.map((field) =>
          renderField(field, item[field.key] ?? "", (v) => handlePosChange(index, field.key, v))
        )}
      </View>
    </List.Accordion>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1, paddingBottom: 30 }}>
      <View style={styles.header}>
        <Text style={styles.modalHeader}>{isEdit ? "Bearbeiten" : "Hinzufügen"}</Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Speichern</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelButtonText}>Abbrechen</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {CUSTOMER_FIELDS.map((field) =>
          renderField(field, customer[field.key], (v) => setField(field.key, v))
        )}

        <Text style={styles.sectionTitle}>POS</Text>
        <View style={styles.positionContainer}>
          <TextInput style={styles.posinput} placeholder="Pos Name" value={posname} onChangeText={setPosName} />
          <TouchableOpacity style={styles.addButton} onPress={handleAddPos}>
            <Text style={styles.addButtonText}>Add POS</Text>
          </TouchableOpacity>
        </View>

        {pos.length > 0 ? (
          <FlatList
            data={pos}
            keyExtractor={(item, i) => item?.id ?? i.toString()}
            extraData={pos}
            scrollEnabled={false}
            renderItem={renderPos}
          />
        ) : (
          <Text style={{ textAlign: "center", marginTop: 10 }}>Keine Positionen</Text>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "center", gap: 10, padding: 20 },
  modalHeader: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 8, marginTop: 4 },
  label: { marginBottom: 2, color: "#333" },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 5, marginBottom: 10 },
  textArea: { height: 100, textAlignVertical: "top" },
  picker: { marginBottom: 10 },
  positionContainer: { flexDirection: "row", alignItems: "center", marginBottom: 30 },
  posinput: { flex: 1, borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 5 },
  addButton: { backgroundColor: "#007BFF", padding: 10, borderRadius: 5, marginLeft: 20 },
  addButtonText: { color: "#fff", fontWeight: "bold" },
  accordion: { backgroundColor: "#f1f1f1", borderRadius: 5, marginBottom: 10 },
  posContainer: { borderWidth: 1, borderColor: "#ddd", padding: 10, borderRadius: 5, marginBottom: 15 },
  deleteButton: { backgroundColor: "#FF6347", padding: 10, borderRadius: 5, width: 40, alignSelf: "flex-end", marginBottom: 10 },
  saveButton: { flex: 1, backgroundColor: "#007BFF", padding: 10, borderRadius: 5, alignItems: "center" },
  saveButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  cancelButton: { flex: 1, backgroundColor: "#FF6347", padding: 10, borderRadius: 5, alignItems: "center" },
  cancelButtonText: { color: "#fff" },
  scrollContent: { padding: 20 },
});

export default ItemForm;