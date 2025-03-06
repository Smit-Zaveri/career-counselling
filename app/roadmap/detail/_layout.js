import React from "react";
import { Stack } from "expo-router";

const DetailLayout = () => {
  return (
    <Stack
      screenOptions={{
        header: () => null,
        headerBackTitleVisible: false,
      }}
    />
  );
};

export default DetailLayout;
