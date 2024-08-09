
import * as React from "react";
import { NativeBaseProvider, StatusBar } from "native-base";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Login from './src/login'
import {
  Start,
  LoginSucced_Submitted,
  OTP_Verification,
  FindLocation2,
  DataSubmitted,
} from "./screens";



const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NativeBaseProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Start"
            component={Start}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Login"
            component={Login}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="OTP_Verification"
            component={OTP_Verification}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="LoginSucced_Submitted"
            component={LoginSucced_Submitted}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="FindLocation2"
            component={FindLocation2}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="DataSubmitted"
            component={DataSubmitted}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </NativeBaseProvider>
  );
};

export default App;