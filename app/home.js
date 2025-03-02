import React from "react";
import { SafeAreaView, ScrollView, View } from "react-native";
import { COLORS, SIZES } from "../constants";
import { Nearbyjobs, Popularjobs, Welcome } from "../components";

const Home = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.lightWhite }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ flex: 1, padding: SIZES.medium }}>
          <Welcome />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;
