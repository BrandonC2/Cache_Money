import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Check, Trash2 } from "lucide-react-native";
import apiClient from "../lib/apiClient";

const OLIVE = "#6b7c52";
const CREAM = "#f5f1e6";
const INK = "#374151";
const INK_MUTED = "#9ca3af";
const BORDER = "rgba(139, 121, 94, 0.35)";
const TRASH = "#785D49";

export default function GroceryList() {
  const tabBarHeight = useBottomTabBarHeight();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newItemText, setNewItemText] = useState("");

  const headerDate = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }, []);

  const loadItems = useCallback(async () => {
    try {
      const res = await apiClient.get("/grocerylist");
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error("Grocery load error:", e.response?.data || e.message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadItems();
    }, [loadItems])
  );

  const checkedCount = useMemo(
    () => items.filter((i) => i.status === "bought").length,
    [items]
  );

  const toggleItem = async (item) => {
    const next = item.status === "bought" ? "pending" : "bought";
    try {
      const res = await apiClient.patch(`/grocerylist/${item._id}`, { status: next });
      setItems((prev) =>
        prev.map((x) => (x._id === item._id ? { ...x, ...res.data } : x))
      );
    } catch (e) {
      console.error("Toggle error:", e.response?.data || e.message);
    }
  };

  const deleteItem = async (id) => {
    try {
      await apiClient.delete(`/grocerylist/${id}`);
      setItems((prev) => prev.filter((x) => x._id !== id));
    } catch (e) {
      console.error("Delete error:", e.response?.data || e.message);
    }
  };

  const addItem = async () => {
    const name = newItemText.trim();
    if (!name || submitting) return;
    setSubmitting(true);
    try {
      const res = await apiClient.post("/grocerylist", {
        name,
        quantity: 1,
        unit: "",
      });
      setItems((prev) => {
        const exists = prev.some((x) => x._id === res.data._id);
        if (exists) {
          return prev.map((x) => (x._id === res.data._id ? res.data : x));
        }
        return [res.data, ...prev];
      });
      setNewItemText("");
    } catch (e) {
      console.error("Add error:", e.response?.data || e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderItem = ({ item }) => {
    const done = item.status === "bought";
    return (
      <View style={styles.itemCard}>
        <Pressable
          onPress={() => toggleItem(item)}
          style={[styles.checkbox, done && styles.checkboxChecked]}
          hitSlop={8}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: done }}
        >
          {done ? <Check size={16} color="#fff" strokeWidth={3} /> : null}
        </Pressable>
        <Text
          style={[styles.itemName, done && styles.itemNameDone]}
          numberOfLines={2}
        >
          {item.quantity > 1 ? `${item.quantity}× ` : ""}
          {item.name}
          {item.unit ? ` ${item.unit}` : ""}
        </Text>
        <Pressable
          onPress={() => deleteItem(item._id)}
          hitSlop={10}
          style={styles.trashHit}
          accessibilityLabel="Remove item"
        >
          <Trash2 size={20} color={TRASH} strokeWidth={2} />
        </Pressable>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={require("../assets/basket.png")}
            style={styles.headerIcon}
            resizeMode="contain"
          />
          <Text style={styles.headerTitle}>Grocery List</Text>
          <Text style={styles.headerDate}>{headerDate}</Text>
        </View>

        {/* Body */}
        <View style={[styles.body, { paddingBottom: tabBarHeight + 8 }]}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Add new item..."
              placeholderTextColor={INK_MUTED}
              value={newItemText}
              onChangeText={setNewItemText}
              onSubmitEditing={addItem}
              returnKeyType="done"
              editable={!submitting}
            />
            <Pressable
              style={[styles.addBtn, submitting && styles.addBtnDisabled]}
              onPress={addItem}
              disabled={submitting || !newItemText.trim()}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.addBtnPlus}>+</Text>
              )}
            </Pressable>
          </View>

          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={OLIVE} />
            </View>
          ) : (
            <View style={styles.listWrap}>
              <FlatList
                data={items}
                keyExtractor={(it) => String(it._id)}
                renderItem={renderItem}
                style={styles.listFlex}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <Text style={styles.empty}>No items yet. Add one above.</Text>
                }
              />
              {!loading && items.length > 0 ? (
                <View style={styles.footer}>
                  <Text style={styles.footerText}>
                    {checkedCount} of {items.length} items checked
                  </Text>
                </View>
              ) : null}
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: OLIVE },
  flex: { flex: 1 },
  header: {
    backgroundColor: OLIVE,
    alignItems: "center",
    paddingBottom: 20,
    paddingTop: 8,
  },
  headerIcon: {
    width: 44,
    height: 44,
    tintColor: "#fff",
    marginBottom: 10,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  headerDate: {
    color: "#fff",
    fontSize: 14,
    marginTop: 6,
    opacity: 0.95,
  },
  body: {
    flex: 1,
    backgroundColor: CREAM,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    marginTop: -4,
    paddingHorizontal: 16,
    paddingTop: 18,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 12 : 10,
    fontSize: 16,
    color: INK,
  },
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: OLIVE,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnDisabled: { opacity: 0.6 },
  addBtnPlus: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "300",
    marginTop: -2,
  },
  listWrap: { flex: 1 },
  listFlex: { flex: 1 },
  listContent: {
    paddingBottom: 8,
    flexGrow: 1,
  },
  center: {
    flex: 1,
    minHeight: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  empty: {
    textAlign: "center",
    color: INK_MUTED,
    fontSize: 15,
    marginTop: 24,
    paddingHorizontal: 20,
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: "#4b5563",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: OLIVE,
    borderWidth: 0,
  },
  itemName: {
    flex: 1,
    fontSize: 16,
    color: INK,
    fontWeight: "500",
  },
  itemNameDone: {
    color: INK_MUTED,
    textDecorationLine: "line-through",
    fontWeight: "400",
  },
  trashHit: { padding: 4 },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: BORDER,
    paddingTop: 14,
    paddingBottom: 12,
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: -16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  footerText: {
    color: OLIVE,
    fontSize: 15,
    fontWeight: "600",
  },
});
