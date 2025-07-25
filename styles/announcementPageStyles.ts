import { theme } from "@/constants/theme";
import { StyleSheet } from "react-native";

const colors = theme.dark;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
  },
  headerActions: {
    paddingVertical: 16,
    alignItems: "flex-end",
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.error,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 100,
    gap: 8,
  },
  createButtonText: {
    color: "white",
    fontSize: 14,
    fontFamily: "Inter-SemiBold",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    height: 48,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
    color: "white",
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Inter-Regular",
    color: colors.onSurface,
  },
  filterButton: {
    marginLeft: 12,
  },
  filterTabs: {
    flexDirection: "row",
    marginBottom: 16,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.background,
    marginRight: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterTabActive: {
    backgroundColor: colors.error,
  },
  filterTabText: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    color: colors.onSurfaceVariant,
  },
  filterTabTextActive: {
    color: colors.background,
  },
  announcementsList: {
    flex: 1,
  },
  announcementCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: colors.border,
    overflow: "visible",
  },
  urgentCard: {
    borderLeftColor: colors.error,
    backgroundColor: `${colors.error}10`,
  },
  expiredCard: {
    opacity: 0.6,
    borderLeftColor: colors.onSurfaceVariant,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
    gap: 12,
  },
  cardHeaderText: {
    flex: 1,
  },
  announcementTitle: {
    fontSize: 20,
    fontFamily: "Inter-Bold",
    color: "white",
    lineHeight: 24,
    marginBottom: 4,
  },
  announcementDate: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
    color: colors.onSurfaceVariant,
  },
  urgentBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.error,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 12,
  },
  urgentBadgeText: {
    fontSize: 10,
    fontFamily: "Inter-Bold",
    color: colors.background,
    letterSpacing: 0.5,
  },
  announcementMessage: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: colors.onSurfaceVariant,
    lineHeight: 20,
    marginBottom: 16,
  },
  eventInfo: {
    flexDirection: "row",
    alignItems: "center",
    // backgroundColor: colors.surfaceVariant,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  eventTitle: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
    color: colors.onSurface,
    flex: 1,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardFooterLeft: {
    flex: 1,
  },
  attachmentInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  attachmentText: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
    color: colors.onSurfaceVariant,
  },
  expiryInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.warning + "33", // semi-transparent warning
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  expiredBadge: {
    backgroundColor: colors.error + "33",
  },
  expiryText: {
    fontSize: 10,
    fontFamily: "Inter-SemiBold",
    color: "#92400E", // Optional: replace with another theme color if needed
  },
  expiredText: {
    color: colors.onSurfaceVariant,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontFamily: "Inter-SemiBold",
    color: colors.onSurfaceVariant,
    marginTop: 16,
    marginBottom: 8,
  },

  emptyStateText: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: colors.onSurfaceVariant,
    textAlign: "center",
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 20,
  },
  header: {
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    borderRadius: 12,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: "Inter-Bold",
    color: colors.onSurface,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: "Inter-Regular",
    color: colors.onSurfaceVariant,
    marginTop: 4,
  },
  // Add menu button style
  menuButton: {
    padding: 8,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  // Modal backdrop
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  // Menu modal container
  menuModal: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 8,
    minWidth: 150,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  // Menu item style
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 12,
    minHeight: 44,
  },
  // Menu text style
  menuText: {
    fontSize: 16,
    fontFamily: "Inter-Medium",
    color: "white",
  },

  contextMenu: {
    position: "absolute",
    top: 28, // Position it right below the 3-dot icon
    right: 0,
    backgroundColor: "#0000",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    width: 120, // Give it a fixed or auto width
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5, // For Android shadow
  },

  // Menu separator
  menuSeparator: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  // Remove old dropdown styles and keep only these
  dropdownContainer: {
    position: "absolute",
    top: 120,
    right: 20,
    zIndex: 10000,
  },
  dropdown: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
    minWidth: 120,
    zIndex: 9999,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
    gap: 8,
    minHeight: 40,
  },
  dropdownText: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    color: colors.onSurface,
  },
  dropdownMenu: {
    position: "absolute",
    top: 30,
    right: 0,
    backgroundColor: "#FFFFFF",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
    zIndex: 20,
  },
});
