import React, { useEffect } from "react";
import { Text, Box, ScrollView, Center } from "native-base";
import { Ionicons } from "@expo/vector-icons";
import Separator from "../components/separator";

function LoginSucced_Submitted({ navigation }) {
  useEffect(() => {
    // Menunda navigasi ke halaman "FindLocation2" selama 3 detik (3000 milidetik)
    const timeoutId = setTimeout(() => {
      navigation.navigate("FindLocation2");
    }, 2000); // Ganti angka ini sesuai dengan jumlah milidetik yang Anda inginkan

    // Membersihkan timeout jika komponen unmount sebelum waktu habis
    return () => clearTimeout(timeoutId);
  }, [navigation]);

  return (
    <Box flex={1} bg="#FFFFFF" safeArea={true}>
      <ScrollView px={"20px"} py={"80px"}>
        <Center>
          <Text fontSize={"26px"} color="#3E4450" textAlign="center">
            Login Berhasil
          </Text>
          <Separator height={"2"} />
          <Text fontSize={"14px"} color="#ACACAC" textAlign="center">
            Anda berhasil Login!
          </Text>
          <Separator height={"10"} />
          <Box bg="#F2F8FF" w={"223px"} h={"223px"} borderRadius="full">
            <Box
              bg="#DAECFF"
              w={"183px"}
              h={"183px"}
              borderRadius="full"
              m={"20px"}
            >
              <Box
                bg="#007DFE"
                w={"143px"}
                h={"143px"}
                borderRadius="full"
                m={"20px"}
              >
                <Center py={"15px"}>
                  <Ionicons name="checkmark-sharp" size={100} color="#FFFFFF" />
                </Center>
              </Box>
            </Box>
          </Box>
        </Center>
      </ScrollView>
    </Box>
  );
}

export default LoginSucced_Submitted;
