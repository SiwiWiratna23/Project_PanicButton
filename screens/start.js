import React, { useEffect } from "react";
import { Box, Image } from "native-base";
import { useFocusEffect } from "@react-navigation/native";

function Start({ navigation }) {
  useFocusEffect(
    React.useCallback(() => {
      // Menunda navigasi ke halaman "Login" selama 3 detik (3000 milidetik)
      const timeoutId = setTimeout(() => {
        navigation.navigate("Login");
      }, 3000); // Ganti angka ini sesuai dengan jumlah milidetik yang Anda inginkan

      // Membersihkan timeout jika komponen kehilangan fokus sebelum waktu habis
      return () => clearTimeout(timeoutId);
    }, [])
  );

  return (
    <Box flex={1} bg="#FFFFFF" safeArea={true}>
      {/* Isi tampilan halaman awal di sini (jika ada) */}
      <Image
        bg="#FFFFFF"
        w={"100%"}
        h={"100%"}
        source={require("../assets/Screen.png")}
      />
    </Box>
  );
}

export default Start;
