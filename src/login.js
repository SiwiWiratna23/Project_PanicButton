import React, { useState, useRef, useEffect } from "react";
import { Text, Box, ScrollView, VStack, Pressable, Input, HStack } from "native-base";
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import firebase from "firebase/compat/app";
import "firebase/compat/auth"; // Import modul auth Firebase
import "firebase/compat/firestore";
import { firebaseConfig } from "../config";
import { doc, setDoc } from "firebase/firestore";
import firestore from "../config";
import { getDatabase, ref, push } from "firebase/database";
import { Ionicons } from "@expo/vector-icons";
import {
  ImageBackground,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
  View
} from "react-native";
import Separator from "../components/separator";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Otp = ({ navigation }) => {
  const [show, setShow] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("+62");
  const [code, setCode] = useState("");
  const [verificationId, setVerificationId] = useState(null);
  const [nama, setNama] = useState("");
  const recaptchaVerifier = useRef(null);
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [timer, setTimer] = useState(5);
  const [isLoading, setIsLoading] = useState(false);

  const toggleShow = () => {
    setShow(!show);
  };

  useEffect(() => {
    let interval;
    if (isVerificationSent && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (!isVerificationSent || timer === 0) {
      clearInterval(interval);
    }
    return () => {
      clearInterval(interval);
    };
  }, [isVerificationSent, timer]);



  const sendVerification = () => {
    if (!nama) {
      Alert.alert("Mohon isi Nama dan No Handphone terlebih dahulu.");
      return;
    }

    if (
      !phoneNumber ||
      (phoneNumber.length < 13 && phoneNumber.length <= 16)
    ) {
      Alert.alert("Isi Nama dan No Handphone dengan benar.");
      return;
    }
    const phoneProvider = new firebase.auth.PhoneAuthProvider();
    phoneProvider
      .verifyPhoneNumber(phoneNumber, recaptchaVerifier.current)
      .then((verificationId) => {
        setVerificationId(verificationId);
        setTimer(5);
        setIsVerificationSent(true);
      })

      .catch((error) => {
        console.error(error);
        Alert.alert("Gagal mengirimkan kode OTP.");

        setCode("");
        setPhoneNumber("+62");
        setNama("");
        setPassword("");
        setVerificationId(null);
        setIsVerificationSent(false);
      });
  };

  const confirmCode = () => {
    if (!code || code.length < 6) {
      Alert.alert("Kode OTP tidak valid");
      return;
    }

    setIsLoading(true); // Tampilkan animasi loading

    const credential = firebase.auth.PhoneAuthProvider.credential(
      verificationId,
      code
    );

    firebase
      .auth()
      .signInWithCredential(credential)
      .then(async () => {
        // Dapatkan tanggal dan waktu saat ini
        const now = new Date();
        const timestamp = `${now.getDate()}-${
          now.getMonth() + 1
        }-${now.getFullYear()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;

        // Simpan data ke AsyncStorage
        await AsyncStorage.setItem(
          "user",
          JSON.stringify({ nama, phoneNumber, created: timestamp })
        );

        console.log("data berhasil submit");
        navigation.navigate("FindLocation2");

        setCode("");

        setNama("");
        setVerificationId(null);
        setIsVerificationSent(false);
        setIsLoading(false); 
        setPhoneNumber("");
      })
      .catch((error) => {
        console.error("Kode OTP tidak valid: ", error);
        Alert.alert("Kode OTP tidak valid");
        setCode("");

        setNama("");
        setVerificationId(null);
        setIsVerificationSent(false);
        setIsLoading(false);
        setPhoneNumber("+62");
      });
  };

  const handleRecaptchaLoad = () => {
    sendVerification();
  };

  return (
    <Box flex={1} safeArea={true}>
      {isLoading && (
        <View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 9999,
          }}
        >
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      )}
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={firebaseConfig}
        invisible={false}
        onLoad={handleRecaptchaLoad}
      />
      <Image
        source={require("../assets/LoginRegister.png")}
        style={styles.imageBackground}
      ></Image>
      <ScrollView
        // marginTop={"214px"}
        // marginTop={"250px"}
        marginTop={"230px"}
        flex={1}
        bg="#FFFFFF"
        borderTopRadius={"30px"}
        shadow="9"
        px={"20px"}
        py={"0px"}
        zIndex={"4"}
      >
        <VStack space={"0px"}>
          <Text
            fontSize={"26px"}
            color="#3E4450"
            textAlign="left"
            fontWeight="bold"
            marginTop={"30px"}
          >
            Masuk
          </Text>
          <Text fontSize={"14px"} color="#3E4450" textAlign="left">
            Memulai dengan mudah hanya dalam beberapa langkah.
          </Text>
        </VStack>
        <Separator height={"5"} />
        <VStack>
          <Text
            p={"5px"}
            fontSize={"14px"}
            fontWeight={"bold"}
            color="#3E4450"
            textAlign="left"
          >
            Nama
          </Text>
          <Input
            w={"100%"}
            h={"45px"}
            borderRadius={"13px"}
            bg="#F4F8FA"
            alignSelf="center"
            placeholder="Masukkan nama anda"
            fontSize={"13px"}
            value={nama}
            onChangeText={setNama}
          />
          <Separator height={"4px"} />
          <Text
            p={"5px"}
            fontSize={"14px"}
            fontWeight={"bold"}
            color="#3E4450"
            textAlign="left"
          >
            No Handphone
          </Text>
          <Input
            w={"100%"}
            h={"45px"}
            borderRadius={"13px"}
            bg="#F4F8FA"
            alignSelf="center"
            keyboardType="phone-pad"
            autoCompleteType="tel"
            fontSize={"13px"}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />
        </VStack>
        <Separator height={"4"} />

        <Pressable onPress={sendVerification} disabled={isVerificationSent}>
          <Box
            mt={"10px"}
            w={"100%"}
            h={"45px"}
            borderRadius={"13px"}
            bg="#007DFE"
            p={"7px"}
          >
            <Text
              fontSize={"16px"}
              color="#FFFFFF"
              textAlign="center"
              fontWeight="medium"
            >
              {isVerificationSent ? "Mengirim OTP" : "Masuk"}
            </Text>
          </Box>
        </Pressable>
        <Separator height={"3"} />
        {isVerificationSent && (
          <HStack
            textAlign="center"
            alignItems={"center"}
            justifyContent={"center"}
            space={"2px"}
          >
            <Text fontSize={"10px"} color="black">
              Masukkan kode OTP dalam
            </Text>
            <Text fontSize={"10px"} color="#AE4454">
              {timer} detik
            </Text>
          </HStack>
        )}
        {timer === 0 && (
          <Pressable onPress={sendVerification}>
            <Text fontSize={"10px"} color="#007DFE" textAlign="center">
              Kirim Ulang OTP
            </Text>
          </Pressable>
        )}

        <Separator height={"4"} />
        <Input
          borderRadius={"13px"}
          w={"100%"}
          h={"45px"}
          fontSize={"13px"}
          bg="#F4F8FA"
          alignSelf="center"
          placeholder="Masukkan kode OTP"
          keyboardType="phone-pad"
          value={code}
          onChangeText={setCode}
          isDisabled={!isVerificationSent}
        />
        <Pressable onPress={confirmCode} disabled={!isVerificationSent}>
          <Box
            mt={"20px"}
            w={"100%"}
            h={"45px"}
            borderRadius={"13px"}
            bg="#019cfe"
            p={"7px"}
          >
            <Text
              fontSize={"16px"}
              color="#FFFFFF"
              textAlign="center"
              fontWeight="medium"
            >
              Verifikasi OTP
            </Text>
          </Box>
        </Pressable>
      </ScrollView>
    </Box>
  );
};

const styles = StyleSheet.create({
  imageBackground: {
    position: "absolute",

    resizeMode: "stretch",
    // width: 362,
    width: 412,
    // height: "8400%",
    // height: 342,
    height: 378,

    zIndex: 1,
  },
});

export default Otp;
