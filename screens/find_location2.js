import React, { useState, useEffect } from "react";
import {
  Text,
  Box,
  HStack,
  VStack,
  ScrollView,
  Pressable,
  Center,
  Select,
  TextArea,
  Button,
  Image,
} from "native-base";
import { Alert, TouchableOpacity, StyleSheet, View, Modal } from "react-native";
import * as Location from "expo-location";
import MapView, { Marker } from "react-native-maps";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import Icon from "react-native-vector-icons/FontAwesome";
import Separator from "../components/separator";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import { firebaseConfig } from "../config";
import { doc, setDoc } from "firebase/firestore";
import firestore from "../config";
import { getDatabase, ref, push, set } from "firebase/database";

const FindLocation2 = ({ navigation }) => {
  const [service, setService] = useState("");
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState(true);
  const [pickedImagePaths, setPickedImagePaths] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isImageAdded, setIsImageAdded] = useState(false);
  const [text, setText] = useState("");
  const [uploadedImages, setUploadedImages] = useState([]);

  useEffect(() => {
    checkLocationPermissionAndFetchLocation();
  }, []);

  useEffect(() => {
    // Load text from AsyncStorage when the component mounts
    loadTextFromStorage();
  }, []);

  const datasimpan = async () => {
    // Ambil data dari AsyncStorage
    const user = JSON.parse(await AsyncStorage.getItem("user"));

    const lokasi = `${address}, ${latitude}, ${longitude}`;

    // Gabungkan data dari AsyncStorage dan data lainnya
    const data = {
      nama_pelapor: user.nama,
      nomor_handphone: user.phoneNumber,
      waktu: user.created,
      lokasi_kejadian: lokasi,
      nama_kejadian: service,
      bukti: pickedImagePaths,
      keterangan: text,
    };

    // Dapatkan referensi ke database dan lokasi spesifik di database
    const db = getDatabase();
    const userRef = ref(db, `panicbuttonDB/${user.created}/${service}`); 

    // Simpan data ke database
    push(userRef, data)
      .then(() => {
        console.log("Data berhasil disimpan ke database");
        navigation.navigate("DataSubmitted");
        setUploadedImages([]);
        setText("");
        setService("");
      })
      .catch((error) => {
        console.error("Gagal menyimpan data ke database: ", error);
      });
  };

  const loadTextFromStorage = async () => {
    try {
      const savedText = await AsyncStorage.getItem("textareaText");
      if (savedText !== null) {
        setText(savedText);
      }
    } catch (error) {
      console.error("Error loading text from AsyncStorage:", error);
    }
  };

  const saveTextToStorage = async () => {
    try {
      await AsyncStorage.setItem("textareaText", text);
    } catch (error) {
      console.error("Error saving text to AsyncStorage:", error);
    }
  };

  useEffect(() => {
    // Save text to AsyncStorage whenever it changes
    saveTextToStorage();
  }, [text]);

  const checkLocationPermissionAndFetchLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "To use this feature, please grant location permission.",
          [
            {
              text: "OK",
              onPress: () => console.log("OK Pressed"),
            },
          ]
        );
        setIsFetchingLocation(false);
        return;
      }

      const locationData = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = locationData.coords;
      setLocation({ latitude, longitude });

      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      const address = reverseGeocode[0];
      setAddress(address);
      setIsFetchingLocation(false);
    } catch (error) {
      console.error("Error getting current location: ", error);
    }
  };

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  const openCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("You've refused to allow this app to access your camera!");
      return;
    }
    const result = await ImagePicker.launchCameraAsync();
    console.log(result);
    if (!result.cancelled) {
      setPickedImagePaths((prevState) => prevState.concat(result.uri));
      setIsImageAdded(true);

      // Tambahkan gambar yang diunggah ke state uploadedImages
      setUploadedImages((prevState) => prevState.concat(result.uri));
    }
    toggleModal();
  };

  const showImagePicker = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("You've refused to allow this app to access your photos!");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
    });
    console.log(result);
    if (!result.cancelled) {
      setPickedImagePaths((prevState) => prevState.concat(result.uri));
      setIsImageAdded(true);

      // Tambahkan gambar yang diunggah ke state uploadedImages
      setUploadedImages((prevState) => prevState.concat(result.uri));
    }
    toggleModal();
  };

  const removeImage = (index) => {
    const updatedImagePaths = [...pickedImagePaths];
    updatedImagePaths.splice(index, 1);
    setPickedImagePaths(updatedImagePaths);

    // Perbarui isImageAdded sesuai dengan keadaan gambar yang tersisa
    setIsImageAdded(updatedImagePaths.length > 0);

    // Hapus juga dari state uploadedImages
    const updatedUploadedImages = [...uploadedImages];
    updatedUploadedImages.splice(index, 1);
    setUploadedImages(updatedUploadedImages);
  };

  return (
    <Box flex={1} bg="#FFFFFF" safeArea={true}>
      <ScrollView px={"20px"} py={"15px"}>
        <Center>
          <Box
            overflow="hidden"
            w={"100%"}
            h={"325px"}
            bg="#F5F5F5"
            borderRadius={"11px"}
            position="relative"
            alignItems={"center"}
          >
            {location ? (
              <MapView
                style={styles.map}
                initialRegion={{
                  ...location,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }}
              >
                <Marker coordinate={location} title="Your Location" />
              </MapView>
            ) : (
              <View style={styles.loadingContainer}>
                <Text fontSize={"12px"} color="#3E4450" textAlign="left">
                  Fetching your location...
                </Text>
              </View>
            )}
            {address && (
              <Box
                position="absolute"
                w={"95%"}
                h={"20%"}
                bg="#FFFFFF"
                borderRadius={"11px"}
                justifyContent={"center"}
                px={"2px"}
                mt={"10px"}
              >
                <VStack space={"2px"} py={"5px"} px={"2px"}>
                  <HStack
                    space={"4px"}
                    justifyContent={"left"}
                    alignItems={"center"}
                    marginLeft={"3"}
                  >
                    <Ionicons
                      name="ios-location-sharp"
                      size={14}
                      color="black"
                    />
                    <Text fontSize={"12.5px"} color="#3E4450" textAlign="left">
                      {address.street} {address.name}, {address.city},{" "}
                      {address.region}
                    </Text>
                  </HStack>
                  <HStack
                    space={"3px"}
                    justifyContent={"left"}
                    alignItems={"center"}
                    marginLeft={"3"}
                  >
                    <Ionicons name="md-locate-sharp" size={14} color="black" />
                    <Text fontSize={"12.5px"} color="#3E4450" textAlign="left">
                      {location.latitude.toFixed(6)},
                      {location.longitude.toFixed(6)}
                    </Text>
                  </HStack>
                </VStack>
              </Box>
            )}
          </Box>
          <Center zIndex="1">
            <Pressable
              onPress={() => datasimpan()}
              position="absolute"
              bottom={-80}
            >
              <Box w={"164px"} h={"165px"} borderRadius="full">
                <Box
                  bg={isImageAdded ? "#FEF6F7" : "#FCE2E4"}
                  w={"144x"}
                  h={"145px"}
                  borderRadius="full"
                  m={"10px"}
                >
                  <Box
                    bg={isImageAdded ? "#FF0000" : "#FEF6F7"}
                    w={"118px"}
                    h={"119px"}
                    borderRadius="full"
                    m={"13px"}
                  >
                    <Center>
                      <Image
                        position="relative"
                        bottom={-45}
                        w={"67px"}
                        h={"32px"}
                        source={require("../assets/SOSVector.png")}
                      />
                    </Center>
                  </Box>
                </Box>
              </Box>
            </Pressable>
          </Center>
          <Text
            fontSize={"11px"}
            color="#ACACAC"
            textAlign="center"
            position="relative"
            mt={"25%"}
          >
            Lengkapi data dibawah ini untuk mengaktifkan tombol SOS
          </Text>
          <Separator height={"5"} />
          <Box w={"100%"} h={"40px"} borderRadius={"10px"}>
            <Select
              variant="filled"
              borderRadius={11}
              minWidth="320"
              borderWidth={1}
              borderColor="lightgray"
              style={{
                backgroundColor: service ? "white" : "#F5F5F5",
              }}
              accessibilityLabel="Pilih layanan darurat"
              placeholder="Pilih layanan darurat"
              _selectedItem={{
                bg: "blue.300",
              }}
              mt="1"
              selectedValue={service}
              onValueChange={(itemValue) => setService(itemValue)}
            >
              <Select.Item label="Kebakaran" value="Kebakaran" />
              <Select.Item label="Kecelakaan" value="Kecelakaan" />
              <Select.Item label="Darurat Medis" value="Darurat_Medis" />
              <Select.Item label="Tindak Kejahatan" value="Tindak_Kejahatan" />
              <Select.Item label="Bencana Alam" value="Bencana_Alam" />
              <Select.Item
                label="Pencarian Pertolongan"
                value="Pencarian_Pertolongan"
              />
              <Select.Item label="Hewan Buas" value="Hewan_Buas" />
              <Select.Item label="Lainnya" value="Lainnya" />
            </Select>
            {/* <FormControl.ErrorMessage
                leftIcon={<WarningOutlineIcon size="xs" />}
              >
                Please make a selection!
              </FormControl.ErrorMessage> */}
          </Box>
          <Separator height={"10"} />
          <TextArea
            h={150}
            w="100%"
            placeholder="Isi keterangan disini"
            borderRadius={11}
            bg="#F5F5F5"
            backgroundColor={text ? "white" : "#F5F5F5"}
            onChangeText={(value) => setText(value)}
            returnKeyType="done"
            onSubmitEditing={() => {
              Keyboard.dismiss();
            }}
            value={text}
          />
          <Separator height={"5"} />
          <Pressable onPress={toggleModal} w={"100%"}>
            <Box
              h={"40px"}
              mt={"10px"}
              borderRadius={"11px"}
              bg="#007DFE"
              p={"7px"}
              shadow="1"
            >
              <HStack space={"10px"} justifyContent={"center"}>
                <Ionicons name="camera" size={22} color="#FFFFFF" />
                <Text
                  fontSize={"14px"}
                  color="#FFFFFF"
                  textAlign="center"
                  fontWeight="medium"
                  py={"2px"}
                >
                  Tambahkan bukti
                </Text>
              </HStack>
            </Box>
          </Pressable>

          <Modal
            animationType="slide"
            transparent={true}
            visible={isModalVisible}
            onRequestClose={toggleModal}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text
                  fontSize={"20px"}
                  color="#2F2F2F"
                  textAlign="center"
                  mt={"10px"}
                >
                  Pilih Sumber Gambar
                </Text>
                <Separator height={"5"} />
                <HStack space={"5"} justifyContent={"center"}>
                  <Button
                    bg="#007DFE"
                    borderRadius={"11px"}
                    onPress={showImagePicker}
                  >
                    Pilih gambar
                  </Button>
                  <Button
                    bg="#007DFE"
                    borderRadius={"11px"}
                    onPress={openCamera}
                  >
                    Buka camera
                  </Button>
                </HStack>
                <Pressable style={styles.removeButton} onPress={toggleModal}>
                  <Icon name="times-circle" size={24} color="black" />
                </Pressable>
              </View>
            </View>
          </Modal>

          {/* tampilan gambar ter input */}
          <Box w={"100%"}>
            <View
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={true}
            >
              {pickedImagePaths.length > 0 && (
                <HStack
                  space="5px"
                  mt={"10px"}
                  ml={"5px"}
                  justifyContent={"left"}
                >
                  <Text
                    fontSize={"12px"}
                    color="#2F2F2F"
                    textAlign="left"
                    py={"2px"}
                  >
                    Bukti berhasil ditambahkan
                  </Text>
                  <Ionicons name="checkmark-sharp" size={20} color="#16DF7E" />
                </HStack>
              )}
              {isImageAdded ? (
                <View style={styles.imageContainerUploaded}>
                  {uploadedImages.map((imagePath, index) => (
                    <View key={index} style={styles.imageWrapper}>
                      <Image
                        source={{ uri: imagePath }}
                        w={"90"}
                        h={"90"}
                        resizeMode="cover"
                        borderRadius={"11px"}
                        m={"1"}
                      />
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => removeImage(index)}
                      >
                        <Icon name="times-circle" size={22} color="white" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          </Box>
          <Separator height={"10"} />
        </Center>
      </ScrollView>
    </Box>
  );
};

const styles = StyleSheet.create({
  map: {
    width: "100%",
    height: "100%",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imageSOS: {
    width: "67px",
    height: "32px",
    position: "relative",
    bottom: -45,
  },
  addButton: {
    width: "100%",
  },
  addButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalButton: {
    backgroundColor: "#007DFE",
    padding: 10,
    margin: 10,
    borderRadius: 5,
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  closeButton: {
    backgroundColor: "red",
    padding: 10,
    margin: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  imageContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
  imageWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  imageContainerUploaded: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    padding: 10,
    // width: windowWidth, // Menggunakan windowWidth untuk lebar
    height: "auto",
    position: "relative",
    borderWidth: 1, // Lebar border (1 pixel)
    borderColor: "#8A8A8A", // Warna border (hitam)
    borderStyle: "dashed",
    borderRadius: 11,
  },
  removeButton: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default FindLocation2;
