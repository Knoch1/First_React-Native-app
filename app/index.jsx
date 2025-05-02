import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";
import { MaterialIcons} from "@expo/vector-icons";
import sendPDF from "./Tasks/print";

const Index = () => {
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const isFocused = useIsFocused();
  const router = useRouter();

  useEffect(() => {
    if (isFocused) {
      loadData();
    }
  }, [isFocused]);

  const loadData = async () => {
    try {
      const data = await AsyncStorage.getItem("inventory");
      setItems(data ? JSON.parse(data) : []);
      setLoaded(true);
    } catch (error) {
      console.log("Something went wrong in your code", error);
    }
  };

  const handleDeleteItem = async (id) => {
    Alert.alert(
      "Löschen bestätigen",
      "Bist du sicher, dass du dieses Element löschen möchtest?",
      [
        {
          text: "Abbrechen",
          style: "cancel",
        },
        {
          text: "Löschen",
          style: "destructive",
          onPress: async () => {
            try {
              const newItems = items.filter((item) => item.id !== id);
              await AsyncStorage.setItem("inventory", JSON.stringify(newItems));
              setItems(newItems); // Update UI
            } catch (error) {
              console.log("Error deleting item:", error);
            }
          },
        },
      ]
    );
  };

  return (
    
      <SafeAreaView style={{flex:1}}>
        <View style={{paddingLeft:20,paddingRight:20}}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("Tasks/create")}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {loaded && Array.isArray(items) && items.length > 0 ? (
            <FlatList
              inverted
              data={items}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View style={styles.taskContainer}>
                  <View style={styles.taskTextWrapper}>
                    <Text style={styles.taskName}>
                      {item.Name}
                    </Text>
                  </View>
                  <View style={styles.buttonGroup}>
                    <TouchableOpacity
                      style={styles.printButton}
                      onPress={() =>
                        sendPDF(item)
                      }
                    >
                      <MaterialIcons name="print" size={20} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() =>
                        router.push({
                          pathname: "Tasks/edit",
                          params: { id: item.id },
                        })
                      }
                    >
                      <MaterialIcons name="edit" size={20} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteItem(item.id)}
                    >
                      <MaterialIcons name="delete" size={20} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          ) : (
            <Text style={styles.noItemsText}>Keine Einträge</Text>
          )}
        </ScrollView>
      

    </SafeAreaView>
  );
};
export default Index;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 30,
  },
  addButton: {
    backgroundColor: "#007BFF",
    marginTop: 20,
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 20,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  taskContainer: {
    flexDirection: "row",
    alignItems: "flex-start", // Aligns buttons to top of text
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    gap: 10,
  },

  taskTextWrapper: {
    flex: 1,
    marginRight: 10,
  },
  buttonGroup: {
    flexDirection: "row",
  },
  printButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
    marginRight: 15,
  },
  editButton: {
    backgroundColor: "#FFD700",
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: "#FF6347",
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  taskName: {
    fontSize: 16,
    fontWeight: "bold",
    flexShrink: 1,
    flexWrap: "wrap",
  },
  scrollContent: {
    padding: 20,
  },
});
