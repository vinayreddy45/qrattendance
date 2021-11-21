import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  StatusBar,
  ScrollView,
} from "react-native";
import { BarCodeScanningResult, Camera } from "expo-camera";
import { API_URL } from "./api";
import {
  Provider as PaperProvider,
  Appbar,
  Button,
  DataTable,
  Menu,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";

const window = Dimensions.get("window");

interface StudentType {
  name: string;
  rollNo: string;
  age: number;
  email: string;
  branch: string;
  id: number;
}

interface AttendanceType {
  student: string;
  subject: string;
  isPresent: boolean;
  date: string;
  id: number;
}

interface SubjectType {
  name: string;
}

type Student = Partial<StudentType>;
type Attendance = Partial<AttendanceType>;

export function Main() {
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [flag, setFlag] = useState<boolean>(true);
  const [student, setStudent] = useState<Student>();
  const [attendance, setAttendance] = useState<Attendance>();
  const [attendanceTable, setAttendanceTable] = useState<Attendance[]>([]);
  const [rollNo, setRollNo] = useState<string>("");
  const [menuVisible, setMenuVisible] = useState<boolean>(false);
  const [subjects, setSubjects] = useState<SubjectType[]>([]);
  const [subject, setSubject] = useState<string>("");

  const closeMenu = () => {
    setMenuVisible(false);
  };

  const openMenu = () => {
    setMenuVisible(true);
  };

  const selectSubject = (subject: string) => {
    setSubject(subject);
    closeMenu();
  };

  const onBarScan = (cam: BarCodeScanningResult) => {
    console.log(cam);
    setRollNo(cam.data);
    if (flag) {
      setFlag(false);
      fetch(`http://${API_URL}/api/attendance/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rollNo: cam.data,
          subject: subject,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          alert(data.message);
          setStudent(data.student);
          setAttendance(data.attendance);
        });

      setTimeout(() => {
        setFlag(true);
      }, 10000);
    }
  };

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  useEffect(() => {
    fetch(`http://${API_URL}/api/subjects`)
      .then((res) => res.json())
      .then((subjects) => setSubjects(subjects));
  }, []);

  useEffect(() => {
    fetch(`http://${API_URL}/api/attendance/list`, {
      method: "GET",
    })
      .then((res) => res.json())
      .then((data) => {
        setAttendanceTable(data);
      });
  }, [attendance]);

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <ScrollView>
      <View style={styles.container}>
        <View style={{ alignItems: "center", padding: 15 }}>
          <Camera
            zoom={1}
            autoFocus
            onBarCodeScanned={onBarScan}
            style={styles.camera}
            type={type}
          ></Camera>
        </View>

        <View style={{ alignItems: "center", padding: 10 }}>
          <Menu
            visible={menuVisible}
            onDismiss={closeMenu}
            anchor={
              <Button mode="outlined" onPress={openMenu}>
                subjects
              </Button>
            }
          >
            {subjects.map((subject, id) => (
              <Menu.Item
                title={subject.name}
                key={id}
                onPress={() => selectSubject(subject.name)}
              />
            ))}
          </Menu>
        </View>

        <Text style={{ textAlign: "center" }}>
          selected subject{"   "}
          <Text style={{ fontWeight: "bold" }}>{subject}</Text>
        </Text>
        <View style={{ marginTop: 5 }}>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>student</DataTable.Title>
              <DataTable.Title>subject</DataTable.Title>
              <DataTable.Title>date</DataTable.Title>
              <DataTable.Title>is present</DataTable.Title>
            </DataTable.Header>

            {attendanceTable
              .filter((item) => item.student === rollNo)
              .map(({ student, subject, date, isPresent }, id) => {
                return (
                  <DataTable.Row key={id}>
                    <DataTable.Cell>{student}</DataTable.Cell>
                    <DataTable.Cell style={{ flex: 1 }}>
                      {subject}
                    </DataTable.Cell>
                    <DataTable.Cell>{date}</DataTable.Cell>
                    <DataTable.Cell>
                      {isPresent ? (
                        <MaterialCommunityIcons
                          name="sticker-check"
                          size={24}
                          color="green"
                        />
                      ) : (
                        <AntDesign name="closecircle" size={24} color="red" />
                      )}
                    </DataTable.Cell>
                  </DataTable.Row>
                );
              })}
          </DataTable>
        </View>

        <View
          style={{
            padding: 10,
            backgroundColor: "lightblue",
            alignItems: "center",
          }}
        >
          <Text>
            Name :<Text style={{ fontWeight: "bold" }}>{student?.name}</Text>
          </Text>
          <Text>
            Branch :
            <Text style={{ fontWeight: "bold" }}>{student?.branch}</Text>
          </Text>
          <Text>
            Roll Number :
            <Text style={{ fontWeight: "bold" }}>{student?.rollNo}</Text>
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

export default function App() {
  return (
    <PaperProvider>
      <Appbar.Header>
        <Appbar.Content title="Student Attendance" />
      </Appbar.Header>
      <Main />
      <StatusBar barStyle="dark-content" backgroundColor="transparent" />
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    width: 320,
    height: 200,
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: "transparent",
    flexDirection: "row",
    margin: 20,
  },
  button: {
    flex: 0.1,
    alignSelf: "flex-end",
    alignItems: "center",
  },
  text: {
    fontSize: 18,
    color: "white",
  },
  student: {
    width: 300,
    height: 150,
    backgroundColor: "lightblue",
    marginVertical: 5,
    elevation: 4,
  },
});
