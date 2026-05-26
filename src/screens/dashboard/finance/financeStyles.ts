import { Platform, StyleSheet } from "react-native";
import { fonts } from "../../../constants/fonts";

export const financeStyles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  tabListHeader: {
    paddingTop: 4,
    paddingBottom: 8,
  },
  hintText: {
    fontFamily: fonts.InterRegular,
    fontSize: 14,
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 10,
    fontFamily: fonts.PoppinsMedium,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  recordCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    gap: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  recordHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },
  recordHeaderMain: {
    flex: 1,
    gap: 2,
  },
  recordTitle: {
    fontFamily: fonts.PoppinsSemiBold,
    fontSize: 15,
    lineHeight: 20,
  },
  recordSubtitle: {
    fontFamily: fonts.InterRegular,
    fontSize: 12,
    lineHeight: 16,
  },
  recordMeta: {
    fontFamily: fonts.InterRegular,
    fontSize: 12,
    lineHeight: 16,
  },
  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusText: {
    fontFamily: fonts.PoppinsSemiBold,
    fontSize: 11,
    lineHeight: 14,
  },
  amountBlock: {
    gap: 6,
  },
  emptyCard: {
    borderRadius: 14,
    padding: 20,
    marginTop: 8,
  },
  emptyText: {
    fontFamily: fonts.InterRegular,
    fontSize: 14,
    textAlign: "center",
  },
  loadMoreButton: {
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
  },
  loadMoreText: {
    fontFamily: fonts.PoppinsSemiBold,
    fontSize: 14,
    letterSpacing: 0.5,
  },
  footerSpacer: {
    height: 16,
  },
  listFooter: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    paddingHorizontal: 16,
    gap: 8,
  },
  listFooterLoadingText: {
    fontFamily: fonts.InterRegular,
    fontSize: 13,
    lineHeight: 18,
  },
  listEndTitle: {
    fontFamily: fonts.PoppinsMedium,
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
  },
  listEndSubtitle: {
    fontFamily: fonts.InterRegular,
    fontSize: 12,
    lineHeight: 16,
    textAlign: "center",
  },
  loadingOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.35)",
  },
  inlineLoader: {
    position: "absolute",
    bottom: 24,
    alignSelf: "center",
    padding: 10,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  filterCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  filterTitle: {
    fontFamily: fonts.PoppinsSemiBold,
    fontSize: 15,
    lineHeight: 20,
  },
  statusField: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
  },
  dateRow: {
    flexDirection: "row",
    gap: 10,
  },
  filterError: {
    fontFamily: fonts.InterRegular,
    fontSize: 12,
    lineHeight: 16,
  },
  filterActions: {
    flexDirection: "row",
    gap: 10,
  },
  searchButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    paddingVertical: 12,
  },
  searchButtonText: {
    fontFamily: fonts.PoppinsSemiBold,
    fontSize: 14,
    lineHeight: 18,
  },
  resetButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: "center",
  },
  resetButtonText: {
    fontFamily: fonts.PoppinsSemiBold,
    fontSize: 14,
    lineHeight: 18,
  },
  activeFiltersLabel: {
    fontFamily: fonts.InterRegular,
    fontSize: 12,
    lineHeight: 16,
  },
  pickerBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  pickerSheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: Platform.OS === "ios" ? 24 : 0,
    maxHeight: "70%",
  },
  pickerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(128,128,128,0.3)",
  },
  pickerTitle: {
    fontFamily: fonts.PoppinsSemiBold,
    fontSize: 15,
  },
  pickerAction: {
    fontFamily: fonts.PoppinsMedium,
    fontSize: 15,
    minWidth: 60,
  },
  statusList: {
    maxHeight: 320,
  },
  statusOption: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  statusOptionText: {
    fontFamily: fonts.PoppinsMedium,
    fontSize: 15,
    lineHeight: 20,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  itemsToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingTop: 2,
  },
  itemsToggleText: {
    fontFamily: fonts.PoppinsMedium,
    fontSize: 13,
    lineHeight: 18,
  },
  itemsList: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 8,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 10,
  },
  itemMain: {
    flex: 1,
    gap: 2,
  },
  itemDescription: {
    fontFamily: fonts.PoppinsMedium,
    fontSize: 13,
    lineHeight: 18,
  },
  itemQty: {
    fontFamily: fonts.InterRegular,
    fontSize: 11,
    lineHeight: 15,
  },
  itemAmount: {
    fontFamily: fonts.PoppinsSemiBold,
    fontSize: 13,
    lineHeight: 18,
  },
});
