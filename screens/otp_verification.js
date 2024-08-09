import React, { Component } from "react";
import {
  Text,
  Box,
  ScrollView,
  VStack,
  Pressable,
  Image,
  Input,
  Center,
} from "native-base";
import { Alert } from "react-native"; // Tambahkan ini
import Separator from "../components/separator";
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import { firebaseConfig } from "../config";
import firestore from "../config";
import { getDatabase, ref, push } from "firebase/database";

class OTP_Verification extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      verificationId: this.props.route.params.verificationId,
      phoneNumber: this.props.route.params.phoneNumber,
      nama: this.props.route.params.nama,
      code: "",
    };
  }

  toggleShow = () => {
    this.setState((prevState) => ({
      show: !prevState.show,
    }));
  };

  confirmCode = () => {
    const { verificationId, phoneNumber, nama, code } = this.state;
    const credential = firebase.auth.PhoneAuthProvider.credential(
      verificationId,
      code
    );

    firebase
      .auth()
      .signInWithCredential(credential)
      .then(() => {
        // Dapatkan tanggal dan waktu saat ini
        const now = new Date();
        const timestamp = `${now.getDate()}-${
          now.getMonth() + 1
        }-${now.getFullYear()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;

        // Simpan data pengguna ke Realtime Database
        const db = getDatabase();
        const userRef = ref(db, "user/" + phoneNumber);
        push(userRef, {
          nomorhp: phoneNumber,
          nama: nama,
          created: timestamp,
        });

        // Menggunakan library native-base untuk menampilkan pesan sukses
        Alert.alert("Login Successful. Welcome to Dashboard");
        console.log("data berhasil submit");
        this.setState({ code: "" });
      })
      .catch((error) => {
        console.error("Gagal menyimpan data ke Firestore: ", error);
        this.setState({ code: "" });
      });
  };

  render() {
    const { navigation } = this.props;
    return (
      <Box flex={1} bg="#FFFFFF" safeArea={true}>
        <ScrollView px={"20px"} py={"60px"}>
          <Text
            fontSize={"20px"}
            color="#3E4450"
            textAlign="center"
            fontWeight="Bold"
          >
            Verifikasi OTP
          </Text>
          <Text p={"5px"} fontSize={"12px"} color="#ACACAC" textAlign="center">
            Kami mengirimkan kode OTP ke nomor Anda
          </Text>
          <Separator height={"10"} />
          <Separator height={"10"} />
          <Center h={"150px"}>
            <Image
              bg="#FFFFFF"
              w={"250px"}
              h={"202px"}
              borderRadius={"10px"}
              source={require("../assets/OTP.png")}
            />
          </Center>
          <Separator height={"10"} />
          <Separator height={"5"} />
          <VStack>
            <Text
              p={"5px"}
              fontSize={"12px"}
              color="#3E4450"
              textAlign="center"
            >
              Masukkan Kode
            </Text>
            <Input
              w={"220"}
              h={"50px"}
              borderRadius={"13px"}
              bg="#F5F5F5"
              alignSelf="center"
              alignItems="center"
              value={code}
              keyboardType="phone-pad"
              onChangeText={(text) => this.setState({ code: text })} // Simpan kode OTP yang dimasukkan pengguna ke dalam state
            />
          </VStack>
          <Separator height={"5"} />
          <Separator height={"10"} />
          <VStack space={"3px"} alignSelf="center">
            <Text fontSize={"12px"} color="#3E4450" textAlign="center">
              Belum menerima kode verifikasi?
            </Text>
            <Pressable onPress={() => navigation.navigate("Register")}>
              <Text fontSize={"12px"} color="#007DFE" textAlign="center">
                Kirim ulang kode
              </Text>
            </Pressable>
          </VStack>
          <Separator height={"10"} />
          <Center>
            <Pressable
              onPress={this.confirmCode} // Panggil confirmCode ketika tombol ditekan
            >
              <Box
                mt={"10px"}
                w={"143px"}
                h={"42px"}
                borderRadius={"11px"}
                bg="#007DFE"
                p={"7px"}
              >
                <Text
                  fontSize={"16px"}
                  color="#FFFFFF"
                  textAlign="center"
                  fontWeight="medium"
                >
                  Verifikasi
                </Text>
              </Box>
            </Pressable>
          </Center>
        </ScrollView>
      </Box>
    );
  }
}

export default OTP_Verification;
