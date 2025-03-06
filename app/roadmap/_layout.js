import React from "react";
import { Stack } from "expo-router";
import { COLORS, SHADOWS } from "../../constants";

const RoadmapLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.lightWhite },
        header: () => null,
        headerShadowVisible: false,
        headerBackTitleVisible: false,
      }}
    />
  );
};

export default RoadmapLayout;
