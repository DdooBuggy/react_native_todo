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
  Pressable,
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
  const [editMode, setEditMode] = useState(false);
  const [editKey, setEditKey] = useState();
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
    if (text.trim() === "") {
      setEditMode(false);
      return;
    }
    const newToDos = Object.assign({}, toDos, {
      [Date.now()]: { text: text.trim(), working, checked: false },
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
  const editToDo = async () => {
    if (!editMode) {
      return;
    }
    if (text.trim() === "") {
      setEditMode(false);
      return;
    }
    const newToDos = { ...toDos };
    newToDos[editKey] = { text: text.trim(), working, checked: false };
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText("");
    setEditMode(false);
    return;
  };
  const editCancel = () => {
    setEditMode(false);
    setText("");
  };
  const onEditText = (key) => {
    if (editMode) {
      return;
    }
    setEditKey(key);
    setText(toDos[key].text);
    setEditMode(true);
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
          <View style={styles.mainBox}>
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
                      style={styles.toDoIcon}
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

                    <Pressable
                      onPress={() => onEditText(key)}
                      style={{ width: "80%" }}
                    >
                      <Text
                        style={{
                          color: "white",
                          fontSize: 16,
                          fontWeight: "600",
                          width: "100%",
                          opacity: toDos[key].checked ? 0.5 : 1,
                          textDecorationLine: toDos[key].checked
                            ? "line-through"
                            : "none",
                        }}
                      >
                        {toDos[key].text}
                      </Text>
                    </Pressable>

                    <TouchableOpacity
                      style={styles.toDoIcon}
                      onPress={() => deleteToDo(key)}
                    >
                      <Fontisto name="trash" size={18} color={theme.grey} />
                    </TouchableOpacity>
                  </View>
                ) : null
              )}
            </ScrollView>
          </View>
          {editMode ? (
            <View
              style={{
                position: "fixed",
                backgroundColor: "black",
                width: "100%",
                height: "100%",
                paddingHorizontal: 20,
                paddingTop: 100,
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: 38,
                  fontWeight: "600",
                  textAlign: "center",
                }}
              >
                Edit
              </Text>
              <TextInput
                onSubmitEditing={editToDo}
                onChangeText={onChangeText}
                returnKeyType="done"
                value={text}
                placeholder="Edit list"
                placeholderTextColor={theme.lightGrey}
                style={styles.input}
                autoFocus
              />
              <View
                style={{
                  width: "100%",
                  justifyContent: "space-evenly",
                  flexDirection: "row",
                }}
              >
                <Pressable
                  onPress={editCancel}
                  style={{
                    backgroundColor: theme.btnBlueBg,
                    width: 70,
                    height: 30,
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: 10,
                  }}
                >
                  <Text
                    style={{ color: "black", fontSize: 17, fontWeight: "500" }}
                  >
                    Cancel
                  </Text>
                </Pressable>
                <Pressable
                  onPress={editToDo}
                  style={{
                    backgroundColor: theme.btnPinkBg,
                    width: 70,
                    height: 30,
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: 10,
                  }}
                >
                  <Text
                    style={{ color: "black", fontSize: 17, fontWeight: "500" }}
                  >
                    Save
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : null}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  mainBox: {
    flex: 1,
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
  editInput: {
    backgroundColor: "white",
    borderRadius: 10,
    fontSize: 18,
    width: "100%",
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
  toDoIcon: {
    alignItems: "center",
    justifyContent: "center",
    width: "10%",
    height: 40,
  },
});
