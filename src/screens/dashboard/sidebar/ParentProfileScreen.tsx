import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useSelector } from "react-redux";
import { useTheme } from "../../../context/ThemeContext";
import CommonHeader from "../../../components/CommonHeader/CommonHeader";
import {
  ProfileHeroCard,
  ProfileInfoRow,
} from "../../../components/ProfileInfo/ProfileInfo";
import { RootStackParamList } from "../../../navigation/RootStackParamsList";
import { RootState } from "../../../store/store";
import {
  getInitials,
  getPersonName,
  getProfileField,
} from "../../../utils/profileHelpers";

type Props = NativeStackScreenProps<RootStackParamList, "ParentProfileScreen">;

export default function ParentProfileScreen({ navigation }: Props) {
  const { paperTheme } = useTheme();
  const parentUser = useSelector(
    (state: RootState) => state.AuthReducer.Login.userData,
  );
  const parentName = getPersonName(parentUser, "Parent");

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: paperTheme.colors.background }]}
    >
      <CommonHeader
        title="Parent Profile"
        onPressLeftBtn={() => navigation.goBack()}
        iconColor={paperTheme.colors.secondary}
        titleColor={paperTheme.colors.secondary}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ProfileHeroCard
          name={parentName}
          subtitle="Parent account"
          initials={getInitials(parentName)}
          paperTheme={paperTheme}
        />

        <View style={styles.infoList}>
          <ProfileInfoRow
            label="Full Name"
            value={getProfileField(parentName)}
            paperTheme={paperTheme}
          />
          <ProfileInfoRow
            label="Email"
            value={getProfileField(parentUser?.email)}
            paperTheme={paperTheme}
          />
          <ProfileInfoRow
            label="Phone"
            value={getProfileField(parentUser?.phone)}
            paperTheme={paperTheme}
          />
          <ProfileInfoRow
            label="Role"
            value={getProfileField(parentUser?.role ?? "Parent")}
            paperTheme={paperTheme}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  infoList: {
    gap: 0,
  },
});
