import { Stack, useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";
import { COLORS } from "../../constants";
import { AntDesign } from "@expo/vector-icons";

export default function CommunityLayout() {
  const router = useRouter();

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          header: () => null,
          headerTitle: "Community",
          ...defaultHeaderStyle,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          header: () => null,
          headerTitle: "Community",
          ...defaultHeaderStyle,
        }}
      />
    </Stack>
  );
}

const defaultHeaderStyle = {
  headerStyle: { backgroundColor: COLORS.lightWhite },
  headerShadowVisible: false,
};
