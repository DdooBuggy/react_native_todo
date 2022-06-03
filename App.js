import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Fontisto } from "@expo/vector-icons";
import { theme } from "./colors";

const STORAGE_TODO = "@toDos";
const STORAGE_WORKING = "@working";

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});
  const [loading, setLoading] = useState(true);
  useEffect(async () => {
    loadToDos();
    setLoading(false);
    try {
      const s = await AsyncStorage.getItem(STORAGE_WORKING);
      if (s !== null) {
        setWorking(JSON.parse(s));
      }
    } catch (error) {
      console.log(error);
    }
  }, []);
  useEffect(async () => {
    try {
      await AsyncStorage.setItem(STORAGE_WORKING, JSON.stringify(working));
    } catch (error) {
      console.log(error);
    }
  }, [working]);
  const travel = () => setWorking(false);
  const work = () => setWorking(true);
  const onChangeText = (payload) => setText(payload);
  const saveToDos = async (toSave) => {
    try {
      await AsyncStorage.setItem(STORAGE_TODO, JSON.stringify(toSave));
    } catch (error) {
      console.log(error);
    }
  };
  const loadToDos = async () => {
    try {
      const s = await AsyncStorage.getItem(STORAGE_TODO);
      if (s !== null) {
        setToDos(JSON.parse(s));
      }
    } catch (error) {
      console.log(error);
    }
  };
  const addToDo = async () => {
    if (text === "") {
      return;
    }
    const newToDos = Object.assign({}, toDos, {
      [Date.now()]: { text, working, checked: false },
    });
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText("");
  };
  const deleteToDo = (key) => {
    Alert.alert("Delete To Do", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "I'm Sure",
        style: "destructive",
        onPress: () => {
          const newToDos = { ...toDos };
          delete newToDos[key];
          setToDos(newToDos);
          saveToDos(newToDos);
        },
      },
    ]);
  };
  const checkToDo = (key) => {
    const newToDos = { ...toDos };
    newToDos[key].checked = newToDos[key].checked ? false : true;
    setToDos(newToDos);
    saveToDos(newToDos);
  };
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      {loading ? (
        <ActivityIndicator
          color="white"
          style={{ marginTop: 300 }}
          size="large"
        />
      ) : (
        <>
          <View style={styles.header}>
            <TouchableOpacity onPress={work}>
              <Text
                style={{
                  fontSize: 38,
                  fontWeight: "600",
                  color: working ? "white" : theme.grey,
                }}
              >
                Work
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={travel}>
              <Text
                style={{
                  fontSize: 38,
                  fontWeight: "600",
                  color: !working ? "white" : theme.grey,
                }}
              >
                Travel
              </Text>
            </TouchableOpacity>
          </View>
          <TextInput
            onSubmitEditing={addToDo}
            onChangeText={onChangeText}
            returnKeyType="done"
            value={text}
            placeholder={working ? "Add a To Do" : "Where do you want to go?"}
            placeholderTextColor={theme.lightGrey}
            style={styles.input}
          />
          <ScrollView showsVerticalScrollIndicator={false}>
            {Object.keys(toDos).map((key) =>
              toDos[key].working === working ? (
                <View style={styles.toDo} key={key}>
                  <TouchableOpacity
                    style={{
                      alignItems: "center",
                      justifyContent: "center",
                      width: "10%",
                      height: 40,
                    }}
                    onPress={() => checkToDo(key)}
                  >
                    {toDos[key].checked ? (
                      <Fontisto
                        name="checkbox-active"
                        size={18}
                        color={theme.lightGrey}
                      />
                    ) : (
                      <Fontisto
                        name="checkbox-passive"
                        size={18}
                        color={theme.lightGrey}
                      />
                    )}
                  </TouchableOpacity>
                  <Text
                    style={{
                      color: "white",
                      opacity: toDos[key].checked ? 0.5 : 1,
                      fontSize: 16,
                      fontWeight: "600",
                      width: "80%",
                      textDecorationLine: toDos[key].checked
                        ? "line-through"
                        : "none",
                    }}
                  >
                    {toDos[key].text}
                  </Text>
                  <TouchableOpacity
                    style={{
                      alignItems: "center",
                      justifyContent: "center",
                      width: "10%",
                      height: 40,
                    }}
                    onPress={() => deleteToDo(key)}
                  >
                    <Fontisto name="trash" size={18} color={theme.grey} />
                  </TouchableOpacity>
                </View>
              ) : null
            )}
          </ScrollView>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
    paddingTop: 100,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 18,
  },
  toDo: {
    backgroundColor: theme.toDoBg,
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toDoText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    width: "80%",
  },
});
