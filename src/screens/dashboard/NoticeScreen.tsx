import React, { useMemo, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import CommonHeader from "../../components/CommonHeader/CommonHeader";
import { useTheme } from "../../context/ThemeContext";
import { fonts } from "../../constants/fonts";
import { DUMMY_NOTICES_RESPONSE } from "../../data/dummyNoticeData";
import { RootStackParamList } from "../../navigation/RootStackParamsList";
import { Notice } from "../../type/notice";
import {
  formatNoticeAudience,
  formatNoticeCategory,
  formatNoticeDate,
  getAttachmentIcon,
  getNoticeCategoryColor,
  getNoticeCategoryIcon,
  sortNotices,
} from "../../utils/noticeHelpers";

type Props = NativeStackScreenProps<RootStackParamList, "NoticeScreen">;

export default function NoticeScreen({ navigation }: Props) {
  const { paperTheme, resolvedTheme } = useTheme();
  const payload = DUMMY_NOTICES_RESPONSE.data;
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

  const notices = useMemo(() => sortNotices(payload.notices), [payload.notices]);

  function renderNoticeCard(notice: Notice) {
    const categoryColor = getNoticeCategoryColor(notice.category);
    const categoryIcon = getNoticeCategoryIcon(notice.category);
    const isUnread = !notice.read.is_read;

    return (
      <TouchableOpacity
        key={notice.id}
        style={[
          styles.noticeCard,
          {
            backgroundColor: paperTheme.colors.surface,
            borderColor: isUnread
              ? paperTheme.colors.primary
              : paperTheme.colors.outline,
          },
          isUnread && {
            borderLeftWidth: 4,
            borderLeftColor: paperTheme.colors.primary,
          },
        ]}
        onPress={() => setSelectedNotice(notice)}
        activeOpacity={0.85}
      >
        <View style={styles.noticeCardTop}>
          <View style={styles.noticeBadges}>
            {notice.is_pinned ? (
              <View
                style={[
                  styles.badge,
                  { backgroundColor: paperTheme.colors.tertiaryContainer },
                ]}
              >
                <Ionicons
                  name="pin"
                  size={10}
                  color={paperTheme.colors.onTertiaryContainer}
                />
                <Text
                  style={[
                    styles.badgeText,
                    { color: paperTheme.colors.onTertiaryContainer },
                  ]}
                >
                  Pinned
                </Text>
              </View>
            ) : null}
            <View style={[styles.badge, { backgroundColor: `${categoryColor}18` }]}>
              <Ionicons name={categoryIcon} size={10} color={categoryColor} />
              <Text style={[styles.badgeText, { color: categoryColor }]}>
                {formatNoticeCategory(notice.category)}
              </Text>
            </View>
            {isUnread ? (
              <View
                style={[styles.unreadDot, { backgroundColor: paperTheme.colors.primary }]}
              />
            ) : null}
          </View>
          <Text
            style={[styles.noticeDate, { color: paperTheme.colors.onSurfaceVariant }]}
          >
            {formatNoticeDate(notice.publish_at)}
          </Text>
        </View>

        <Text
          style={[
            styles.noticeTitle,
            { color: paperTheme.colors.onSurface },
            isUnread && { fontFamily: fonts.PoppinsBold },
          ]}
          numberOfLines={2}
        >
          {notice.title}
        </Text>

        <Text
          style={[styles.noticeExcerpt, { color: paperTheme.colors.onSurfaceVariant }]}
          numberOfLines={2}
        >
          {notice.body}
        </Text>

        <View style={styles.noticeFooter}>
          <View style={styles.noticeMetaRow}>
            <Ionicons
              name="people-outline"
              size={12}
              color={paperTheme.colors.onSurfaceVariant}
            />
            <Text
              style={[styles.noticeMeta, { color: paperTheme.colors.onSurfaceVariant }]}
            >
              {formatNoticeAudience(notice.audience)}
            </Text>
            {notice.attachments.length > 0 ? (
              <>
                <Text style={[styles.metaDot, { color: paperTheme.colors.outline }]}>
                  ·
                </Text>
                <Ionicons
                  name="attach-outline"
                  size={12}
                  color={paperTheme.colors.onSurfaceVariant}
                />
                <Text
                  style={[styles.noticeMeta, { color: paperTheme.colors.onSurfaceVariant }]}
                >
                  {notice.attachments.length} file
                  {notice.attachments.length === 1 ? "" : "s"}
                </Text>
              </>
            ) : null}
          </View>
          {notice.requires_acknowledgement && !notice.read.acknowledged ? (
            <View
              style={[
                styles.ackBadge,
                { backgroundColor: paperTheme.colors.errorContainer },
              ]}
            >
              <Text
                style={[
                  styles.ackBadgeText,
                  { color: paperTheme.colors.onErrorContainer },
                ]}
              >
                Ack required
              </Text>
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: paperTheme.colors.background }]}
      edges={["top"]}
    >
      <StatusBar
        barStyle={resolvedTheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={paperTheme.colors.background}
        translucent={false}
      />

      <CommonHeader
        title="Notices"
        onPressLeftBtn={() => navigation.goBack()}
        iconColor={paperTheme.colors.secondary}
        titleColor={paperTheme.colors.secondary}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {payload.unread_count > 0 ? (
          <View
            style={[
              styles.unreadBanner,
              {
                backgroundColor: paperTheme.colors.primaryContainer,
                borderColor: paperTheme.colors.primary,
              },
            ]}
          >
            <View
              style={[styles.unreadIcon, { backgroundColor: paperTheme.colors.primary }]}
            >
              <Ionicons name="mail-unread-outline" size={20} color={paperTheme.colors.onPrimary} />
            </View>
            <View style={styles.unreadCopy}>
              <Text
                style={[
                  styles.unreadTitle,
                  { color: paperTheme.colors.onPrimaryContainer },
                ]}
              >
                {payload.unread_count} unread notice
                {payload.unread_count === 1 ? "" : "s"}
              </Text>
              <Text
                style={[
                  styles.unreadSubtitle,
                  { color: paperTheme.colors.onPrimaryContainer },
                ]}
              >
                Tap a notice to read the full message
              </Text>
            </View>
          </View>
        ) : null}

        <Text
          style={[styles.sectionLabel, { color: paperTheme.colors.onSurfaceVariant }]}
        >
          {payload.meta.total} notice{payload.meta.total === 1 ? "" : "s"}
        </Text>

        {notices.map(renderNoticeCard)}

        {payload.meta.last_page > 1 ? (
          <Text
            style={[styles.paginationHint, { color: paperTheme.colors.onSurfaceVariant }]}
          >
            Showing page {payload.meta.current_page} of {payload.meta.last_page}
          </Text>
        ) : null}
      </ScrollView>

      <Modal
        visible={selectedNotice != null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedNotice(null)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setSelectedNotice(null)}>
          <Pressable
            style={[styles.detailSheet, { backgroundColor: paperTheme.colors.surface }]}
            onPress={(event) => event.stopPropagation()}
          >
            {selectedNotice ? (
              <>
                <View style={styles.sheetHandleWrap}>
                  <View
                    style={[
                      styles.sheetHandle,
                      { backgroundColor: paperTheme.colors.outlineVariant },
                    ]}
                  />
                </View>

                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.detailContent}
                >
                  <View style={styles.detailHeader}>
                    <View style={styles.detailBadges}>
                      {selectedNotice.is_pinned ? (
                        <View
                          style={[
                            styles.badge,
                            { backgroundColor: paperTheme.colors.tertiaryContainer },
                          ]}
                        >
                          <Ionicons
                            name="pin"
                            size={10}
                            color={paperTheme.colors.onTertiaryContainer}
                          />
                          <Text
                            style={[
                              styles.badgeText,
                              { color: paperTheme.colors.onTertiaryContainer },
                            ]}
                          >
                            Pinned
                          </Text>
                        </View>
                      ) : null}
                      <View
                        style={[
                          styles.badge,
                          {
                            backgroundColor: `${getNoticeCategoryColor(selectedNotice.category)}18`,
                          },
                        ]}
                      >
                        <Ionicons
                          name={getNoticeCategoryIcon(selectedNotice.category)}
                          size={10}
                          color={getNoticeCategoryColor(selectedNotice.category)}
                        />
                        <Text
                          style={[
                            styles.badgeText,
                            { color: getNoticeCategoryColor(selectedNotice.category) },
                          ]}
                        >
                          {formatNoticeCategory(selectedNotice.category)}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.closeBtn,
                        { backgroundColor: paperTheme.colors.surfaceVariant },
                      ]}
                      onPress={() => setSelectedNotice(null)}
                    >
                      <Ionicons name="close" size={18} color={paperTheme.colors.onSurface} />
                    </TouchableOpacity>
                  </View>

                  <Text style={[styles.detailTitle, { color: paperTheme.colors.onSurface }]}>
                    {selectedNotice.title}
                  </Text>
                  <Text
                    style={[
                      styles.detailMeta,
                      { color: paperTheme.colors.onSurfaceVariant },
                    ]}
                  >
                    {formatNoticeDate(selectedNotice.publish_at)} ·{" "}
                    {formatNoticeAudience(selectedNotice.audience)}
                  </Text>

                  <Text style={[styles.detailBody, { color: paperTheme.colors.onSurface }]}>
                    {selectedNotice.body}
                  </Text>

                  {selectedNotice.attachments.length > 0 ? (
                    <View style={styles.attachmentsSection}>
                      <Text
                        style={[
                          styles.attachmentsTitle,
                          { color: paperTheme.colors.onSurfaceVariant },
                        ]}
                      >
                        Attachments
                      </Text>
                      {selectedNotice.attachments.map((file) => (
                        <View
                          key={file.id}
                          style={[
                            styles.attachmentRow,
                            {
                              backgroundColor: paperTheme.colors.surfaceVariant,
                              borderColor: paperTheme.colors.outline,
                            },
                          ]}
                        >
                          <Ionicons
                            name={getAttachmentIcon(file.mime_type)}
                            size={18}
                            color={paperTheme.colors.primary}
                          />
                          <View style={styles.attachmentCopy}>
                            <Text
                              style={[
                                styles.attachmentName,
                                { color: paperTheme.colors.onSurface },
                              ]}
                              numberOfLines={1}
                            >
                              {file.filename}
                            </Text>
                            <Text
                              style={[
                                styles.attachmentSize,
                                { color: paperTheme.colors.onSurfaceVariant },
                              ]}
                            >
                              {file.human_size}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  ) : null}

                  {selectedNotice.requires_acknowledgement ? (
                    <TouchableOpacity
                      style={[
                        styles.ackButton,
                        {
                          backgroundColor: selectedNotice.read.acknowledged
                            ? paperTheme.colors.surfaceVariant
                            : paperTheme.colors.primary,
                        },
                      ]}
                      activeOpacity={0.85}
                    >
                      <Ionicons
                        name={
                          selectedNotice.read.acknowledged
                            ? "checkmark-circle"
                            : "checkmark-circle-outline"
                        }
                        size={18}
                        color={
                          selectedNotice.read.acknowledged
                            ? paperTheme.colors.onSurfaceVariant
                            : paperTheme.colors.onPrimary
                        }
                      />
                      <Text
                        style={[
                          styles.ackButtonText,
                          {
                            color: selectedNotice.read.acknowledged
                              ? paperTheme.colors.onSurfaceVariant
                              : paperTheme.colors.onPrimary,
                          },
                        ]}
                      >
                        {selectedNotice.read.acknowledged
                          ? "Acknowledged"
                          : "Acknowledge notice"}
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                </ScrollView>
              </>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 28,
    gap: 10,
  },
  unreadBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginTop: 8,
    marginBottom: 4,
  },
  unreadIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadCopy: {
    flex: 1,
    gap: 2,
  },
  unreadTitle: {
    fontFamily: fonts.PoppinsSemiBold,
    fontSize: 14,
    lineHeight: 18,
  },
  unreadSubtitle: {
    fontFamily: fonts.InterRegular,
    fontSize: 12,
    lineHeight: 16,
    opacity: 0.9,
  },
  sectionLabel: {
    fontFamily: fonts.PoppinsMedium,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginTop: 4,
    marginBottom: 2,
  },
  noticeCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  noticeCardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  noticeBadges: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    fontFamily: fonts.PoppinsSemiBold,
    fontSize: 10,
    lineHeight: 12,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  noticeDate: {
    fontFamily: fonts.InterRegular,
    fontSize: 10,
    lineHeight: 14,
    maxWidth: 110,
    textAlign: "right",
  },
  noticeTitle: {
    fontFamily: fonts.PoppinsSemiBold,
    fontSize: 15,
    lineHeight: 20,
  },
  noticeExcerpt: {
    fontFamily: fonts.InterRegular,
    fontSize: 13,
    lineHeight: 18,
  },
  noticeFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  noticeMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
    flexWrap: "wrap",
  },
  noticeMeta: {
    fontFamily: fonts.InterRegular,
    fontSize: 11,
    lineHeight: 14,
  },
  metaDot: {
    fontFamily: fonts.InterRegular,
    fontSize: 11,
  },
  ackBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  ackBadgeText: {
    fontFamily: fonts.PoppinsSemiBold,
    fontSize: 10,
    lineHeight: 12,
  },
  paginationHint: {
    fontFamily: fonts.InterRegular,
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  detailSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "88%",
    paddingBottom: Platform.OS === "ios" ? 28 : 20,
  },
  sheetHandleWrap: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 4,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  detailContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },
  detailHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  detailBadges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    flex: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  detailTitle: {
    fontFamily: fonts.PoppinsBold,
    fontSize: 20,
    lineHeight: 26,
  },
  detailMeta: {
    fontFamily: fonts.InterRegular,
    fontSize: 12,
    lineHeight: 16,
  },
  detailBody: {
    fontFamily: fonts.InterRegular,
    fontSize: 14,
    lineHeight: 22,
  },
  attachmentsSection: {
    gap: 8,
    marginTop: 4,
  },
  attachmentsTitle: {
    fontFamily: fonts.PoppinsMedium,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  attachmentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  attachmentCopy: {
    flex: 1,
    gap: 2,
  },
  attachmentName: {
    fontFamily: fonts.PoppinsMedium,
    fontSize: 13,
    lineHeight: 18,
  },
  attachmentSize: {
    fontFamily: fonts.InterRegular,
    fontSize: 11,
    lineHeight: 14,
  },
  ackButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 4,
  },
  ackButtonText: {
    fontFamily: fonts.PoppinsSemiBold,
    fontSize: 14,
    lineHeight: 18,
  },
});
